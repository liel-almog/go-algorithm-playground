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
	"strconv"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle"
)

type Server struct {
	eightPuzzle    *eightpuzzle.Service
	allowedOrigins []string
	apiRoutes      map[string]map[string]struct{}
	handler        http.Handler
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
	mux := http.NewServeMux()
	mux.HandleFunc("GET /{$}", server.index)
	server.registerAPI(mux, http.MethodGet, "/api/health", server.health)
	server.registerAPI(mux, http.MethodGet, "/api/algorithms", server.algorithms)
	server.registerProblemRoutes(mux)
	mux.HandleFunc("/api", apiNotFound)
	mux.HandleFunc("/api/", apiNotFound)
	server.handler = server.recoverPanic(server.cors(server.logRequests(mux)))
	return server
}

func (s *Server) Handler() http.Handler { return s.handler }

func (s *Server) index(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("<!doctype html><title>Algorithm Playground</title><h1>Algorithm Playground API</h1>"))
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

func (s *Server) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "goVersion": strings.TrimPrefix(runtimeVersion(), "go"), "algorithms": s.eightPuzzle.AlgorithmCount()})
}

var runtimeVersion = runtime.Version

func (s *Server) algorithms(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"algorithms": s.eightPuzzle.Algorithms(),
		"tools":      []map[string]any{{"id": "karger", "name": "Karger randomized minimum cut", "category": "graph", "endpoint": problemRoutePrefix + "/minimum-cut/solve"}},
	})
}

func (s *Server) registerAPI(mux *http.ServeMux, method, path string, handler http.HandlerFunc) {
	pattern := path
	if strings.HasSuffix(pattern, "/") {
		pattern += "{$}"
	}
	mux.HandleFunc(method+" "+pattern, handler)
	mux.HandleFunc(pattern, func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Allow", method)
		writeError(w, http.StatusMethodNotAllowed, errors.New("method not allowed"))
	})
	methods := s.apiRoutes[path]
	if methods == nil {
		methods = make(map[string]struct{})
		s.apiRoutes[path] = methods
	}
	methods[method] = struct{}{}
}

func apiNotFound(w http.ResponseWriter, _ *http.Request) {
	writeError(w, http.StatusNotFound, errors.New("API route not found"))
}

func decode(w http.ResponseWriter, r *http.Request, destination any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBytes)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		writeError(w, http.StatusBadRequest, fmt.Errorf("invalid JSON: %w", err))
		return false
	}
	if decoder.Decode(&struct{}{}) != io.EOF {
		writeError(w, http.StatusBadRequest, errors.New("invalid JSON: request body must contain exactly one JSON object"))
		return false
	}
	return true
}

func writeSolverError(w http.ResponseWriter, err error) {
	status := http.StatusUnprocessableEntity
	if eightpuzzle.IsSolverTimeout(err) {
		status = http.StatusRequestTimeout
	}
	writeError(w, status, err)
}
func writeError(w http.ResponseWriter, status int, err error) {
	writeJSON(w, status, map[string]any{"error": publicError(err), "status": status})
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
func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func (s *Server) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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
				writeError(w, http.StatusForbidden, errors.New("origin is not allowed"))
				return
			}
			requestedMethod := r.Header.Get("Access-Control-Request-Method")
			methods, pathExists := s.apiRoutes[r.URL.Path]
			if !pathExists {
				apiNotFound(w, r)
				return
			}
			if _, methodExists := methods[requestedMethod]; requestedMethod == "" || !methodExists {
				writeError(w, http.StatusMethodNotAllowed, errors.New("requested method is not allowed"))
				return
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
func (s *Server) originAllowed(origin string) bool {
	for _, allowed := range s.allowedOrigins {
		if allowed == "*" || allowed == origin {
			return true
		}
	}
	return false
}
func (s *Server) logRequests(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		if strings.HasPrefix(r.URL.Path, "/api/") {
			slog.Info("request", "method", r.Method, "path", r.URL.Path, "duration", time.Since(start))
		}
	})
}
func (s *Server) recoverPanic(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				slog.Error("request panic", "error", recovered)
				writeError(w, http.StatusInternalServerError, errors.New("internal server error"))
			}
		}()
		next.ServeHTTP(w, r)
	})
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
