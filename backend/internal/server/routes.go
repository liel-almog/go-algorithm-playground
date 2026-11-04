package server

import (
	"errors"
	"net/http"
	"slices"
	"strings"

	"github.com/labstack/echo/v5"
)

func (s *Server) registerAPI(e *echo.Echo, method, path string, handler echo.HandlerFunc, middleware ...echo.MiddlewareFunc) {
	middleware = append([]echo.MiddlewareFunc{s.validateAPIRequest}, middleware...)
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
		c.Response().Header().Set("Allow", strings.Join(allowedMethods(methods), ", "))
		return writeError(c, http.StatusMethodNotAllowed, errors.New("method not allowed"))
	}
	return apiNotFound(c)
}

func allowedMethods(methods map[string]struct{}) []string {
	allowed := make([]string, 0, len(methods))
	for method := range methods {
		allowed = append(allowed, method)
	}
	slices.Sort(allowed)
	return allowed
}
