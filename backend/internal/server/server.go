// Package server adapts the problem packages to the playground's HTTP API.
package server

import (
	"net/http"
	"slices"

	"github.com/labstack/echo/v5"
)

// Server hosts a collection of independent problems. It owns only the
// cross-cutting concerns: CORS, middleware, limits, errors, and discovery.
type Server struct {
	problems       []problem
	allowedOrigins []string
	apiRoutes      map[string]map[string]struct{}
	handler        *echo.Echo
	algorithmSlots chan struct{}
}

func New(allowedOrigins []string) *Server {
	if len(allowedOrigins) == 0 {
		allowedOrigins = []string{"*"}
	}
	server := &Server{
		problems:       defaultProblems(),
		allowedOrigins: slices.Clone(allowedOrigins),
		apiRoutes:      make(map[string]map[string]struct{}),
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
