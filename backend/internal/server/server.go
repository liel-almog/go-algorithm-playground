// Package server adapts the problem packages to the playground's HTTP API.
package server

import (
	"slices"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/controllers"
	"github.com/liel-almog/go-algorithm-playground/internal/routes"
	"github.com/liel-almog/go-algorithm-playground/internal/services"
)

// Server hosts a collection of independent problems. It owns only the
// cross-cutting concerns: CORS, middleware, limits, errors, and discovery.
type Server struct {
	catalog        *services.Catalog
	allowedOrigins []string
	apiRoutes      apiRouteRegistry
	handler        *echo.Echo
	algorithmSlots chan struct{}
}

func New(allowedOrigins []string) *Server {
	if len(allowedOrigins) == 0 {
		allowedOrigins = []string{"*"}
	}
	server := &Server{
		catalog:        services.NewCatalog(),
		allowedOrigins: slices.Clone(allowedOrigins),
		apiRoutes:      make(apiRouteRegistry),
		algorithmSlots: algorithmSlots(),
	}
	e := echo.New()
	e.HTTPErrorHandler = server.handleHTTPError
	// Apply diagnostics and recovery before routing, including CORS preflights.
	e.Pre(server.requestMetadata, server.logRequests, server.recoverPanic, server.cors)
	routes.Register(e, controllers.New(server.catalog), server.registerAPI, server.limitAlgorithm)
	e.RouteNotFound("/api", server.apiFallback)
	e.RouteNotFound("/api/*", server.apiFallback)
	server.handler = e
	return server
}

func (s *Server) Handler() *echo.Echo { return s.handler }
