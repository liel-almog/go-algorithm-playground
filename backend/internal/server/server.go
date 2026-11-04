// Package server adapts the problem services to the playground's HTTP API.
package server

import (
	"net/http"
	"slices"

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
		eightPuzzle:    service,
		allowedOrigins: slices.Clone(allowedOrigins),
		apiRoutes:      make(map[string]map[string]struct{}),
		validator:      newValidator(),
		algorithmSlots: algorithmSlots(),
	}
	e := echo.New()
	e.HTTPErrorHandler = server.handleHTTPError
	// Apply diagnostics and recovery before routing, including CORS preflights.
	e.Pre(server.requestMetadata, server.logRequests, server.recoverPanic, server.cors)
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
