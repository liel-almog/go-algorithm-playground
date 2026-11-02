package server

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"runtime"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle"
)

type Server struct {
	eightPuzzle    *eightpuzzle.Service
	allowedOrigins []string
	apiRoutes      map[string]map[string]struct{}
	handler        *echo.Echo
	validator      *validator.Validate
	algorithmSlots chan struct{}
}

func New(service *eightpuzzle.Service, allowedOrigins []string) *Server {
	if service == nil {
		service = eightpuzzle.New(nil)
	}
	if len(allowedOrigins) == 0 {
		allowedOrigins = []string{"*"}
	}
	server := &Server{
		eightPuzzle: service, allowedOrigins: allowedOrigins,
		apiRoutes: make(map[string]map[string]struct{}),
		validator: newValidator(), algorithmSlots: algorithmSlots(),
	}
	e := echo.New()
	e.HTTPErrorHandler = server.handleHTTPError
	e.Pre(server.cors)
	e.Use(
		server.recoverPanic,
		server.logRequests,
	)
	e.GET("/", server.index)
	server.registerAPI(e, http.MethodGet, "/api/health", server.health)
	server.registerAPI(e, http.MethodGet, "/api/algorithms", server.algorithms)
	server.registerProblemRoutes(e)
	e.RouteNotFound("/api", server.apiFallback)
	e.RouteNotFound("/api/*", server.apiFallback)
	server.handler = e
	return server
}

func (s *Server) Handler() *echo.Echo { return s.handler }

func (s *Server) index(c *echo.Context) error {
	return c.HTML(http.StatusOK, "<!doctype html><title>Algorithm Playground</title><h1>Algorithm Playground API</h1>")
}

func AllowedOriginsFromEnv() []string {
	value := strings.TrimSpace(os.Getenv("CORS_ALLOWED_ORIGINS"))
	if value == "" {
		return []string{"*"}
	}
	result := make([]string, 0)
	for _, part := range strings.Split(value, ",") {
		if origin := strings.TrimSpace(part); origin != "" {
			result = append(result, origin)
		}
	}
	return result
}

func (s *Server) health(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{"status": "ok", "goVersion": strings.TrimPrefix(runtimeVersion(), "go"), "algorithms": s.eightPuzzle.AlgorithmCount()})
}

var runtimeVersion = runtime.Version

func (s *Server) algorithms(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{
		"algorithms": s.eightPuzzle.Algorithms(),
		"tools":      []map[string]any{{"id": "karger", "name": "Karger randomized minimum cut", "category": "graph", "endpoint": problemRoutePrefix + "/minimum-cut/solve"}},
	})
}

func (s *Server) registerAPI(e *echo.Echo, method, path string, handler echo.HandlerFunc, middleware ...echo.MiddlewareFunc) {
	e.Add(method, path, handler, middleware...)
	methods := s.apiRoutes[path]
	if methods == nil {
		methods = make(map[string]struct{})
		s.apiRoutes[path] = methods
	}
	methods[method] = struct{}{}
}

func apiNotFound(c *echo.Context) error {
	return writeError(c, http.StatusNotFound, errors.New("API route not found"))
}

func (s *Server) apiFallback(c *echo.Context) error {
	if methods, exists := s.apiRoutes[c.Request().URL.Path]; exists {
		allowed := make([]string, 0, len(methods))
		for method := range methods {
			allowed = append(allowed, method)
		}
		slices.Sort(allowed)
		c.Response().Header().Set("Allow", strings.Join(allowed, ", "))
		return writeError(c, http.StatusMethodNotAllowed, errors.New("method not allowed"))
	}
	return apiNotFound(c)
}

func decode(c *echo.Context, destination any) error {
	r := c.Request()
	r.Body = http.MaxBytesReader(c.Response(), r.Body, maxRequestBytes)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		return fmt.Errorf("invalid JSON: %w", err)
	}
	if decoder.Decode(&struct{}{}) != io.EOF {
		return errors.New("invalid JSON: request body must contain exactly one JSON object")
	}
	return nil
}

func writeSolverError(c *echo.Context, err error) error {
	status := http.StatusUnprocessableEntity
	if eightpuzzle.IsSolverTimeout(err) {
		status = http.StatusRequestTimeout
	}
	return writeError(c, status, err)
}
func writeError(c *echo.Context, status int, err error) error {
	return c.JSON(status, map[string]any{"error": publicError(err), "status": status})
}
func publicError(err error) string {
	if errors.Is(err, context.DeadlineExceeded) {
		return "the algorithm exceeded its 5 second time limit"
	}
	if eightpuzzle.IsSolverLimit(err) {
		return "the algorithm reached its state exploration limit"
	}
	return err.Error()
}

func (s *Server) cors(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		r := c.Request()
		w := c.Response()
		origin := r.Header.Get("Origin")
		allowedOrigin := origin == "" || s.originAllowed(origin)
		if origin != "" && allowedOrigin {
			if len(s.allowedOrigins) == 1 && s.allowedOrigins[0] == "*" {
				w.Header().Set("Access-Control-Allow-Origin", "*")
			} else {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Add("Vary", "Origin")
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Max-Age", "86400")
		}
		if r.Method == http.MethodOptions {
			if !allowedOrigin {
				return writeError(c, http.StatusForbidden, errors.New("origin is not allowed"))
			}
			requestedMethod := r.Header.Get("Access-Control-Request-Method")
			methods, pathExists := s.apiRoutes[r.URL.Path]
			if !pathExists {
				return apiNotFound(c)
			}
			if _, methodExists := methods[requestedMethod]; requestedMethod == "" || !methodExists {
				return writeError(c, http.StatusMethodNotAllowed, errors.New("requested method is not allowed"))
			}
			return c.NoContent(http.StatusNoContent)
		}
		return next(c)
	}
}
func (s *Server) originAllowed(origin string) bool {
	for _, allowed := range s.allowedOrigins {
		if allowed == "*" || allowed == origin {
			return true
		}
	}
	return false
}
func (s *Server) logRequests(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		r := c.Request()
		start := time.Now()
		err := next(c)
		if strings.HasPrefix(r.URL.Path, "/api/") {
			slog.Info("request", "method", r.Method, "path", r.URL.Path, "duration", time.Since(start))
		}
		return err
	}
}

func (s *Server) recoverPanic(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) (err error) {
		defer func() {
			if recovered := recover(); recovered != nil {
				if recovered == http.ErrAbortHandler {
					panic(recovered)
				}
				if recoveredErr, ok := recovered.(error); ok {
					err = recoveredErr
				} else {
					err = fmt.Errorf("panic: %v", recovered)
				}
			}
		}()
		return next(c)
	}
}

func (s *Server) handleHTTPError(c *echo.Context, err error) {
	status := http.StatusInternalServerError
	message := errors.New("internal server error")
	var statusCoder echo.HTTPStatusCoder
	if errors.As(err, &statusCoder) {
		status = statusCoder.StatusCode()
		message = errors.New(strings.ToLower(http.StatusText(status)))
	}
	if status >= http.StatusInternalServerError {
		slog.Error("request failed", "error", err)
	}
	if responseErr := writeError(c, status, message); responseErr != nil {
		slog.Error("failed to write error response", "error", responseErr)
	}
}
func ParsePort() string {
	port := strings.TrimSpace(os.Getenv("PORT"))
	if port == "" {
		return "8080"
	}
	if value, err := strconv.Atoi(port); err != nil || value < 1 || value > 65535 {
		return "8080"
	}
	return port
}
