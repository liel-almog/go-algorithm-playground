package server

import (
	"errors"
	"net/http"
	"slices"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/httpapi"
)

var (
	errAPIRouteNotFound = errors.New("API route not found")
	errMethodNotAllowed = errors.New("method not allowed")
)

type routeMethods map[string]struct{}

type apiRouteRegistry map[string]routeMethods

func (r apiRouteRegistry) add(path, method string) {
	methods, exists := r[path]
	if !exists {
		methods = make(routeMethods)
		r[path] = methods
	}

	methods[method] = struct{}{}
}

func (s *Server) registerAPI(group *echo.Group, method, path string, handler echo.HandlerFunc, middleware ...echo.MiddlewareFunc) {
	routeMiddleware := append([]echo.MiddlewareFunc{httpapi.ValidateAPIRequest}, middleware...)
	registeredRoute := group.Add(method, path, handler, routeMiddleware...)
	s.apiRoutes.add(registeredRoute.Path, registeredRoute.Method)
}

func apiNotFound(c *echo.Context) error {
	return httpapi.WriteError(c, http.StatusNotFound, errAPIRouteNotFound)
}

func (s *Server) apiFallback(c *echo.Context) error {
	methods, pathExists := s.apiRoutes[c.Request().URL.Path]
	if !pathExists {
		return apiNotFound(c)
	}

	setAllowedMethodsHeader(c, methods)
	return httpapi.WriteError(c, http.StatusMethodNotAllowed, errMethodNotAllowed)
}

func setAllowedMethodsHeader(c *echo.Context, methods routeMethods) {
	c.Response().Header().Set("Allow", strings.Join(allowedMethods(methods), ", "))
}

func allowedMethods(methods routeMethods) []string {
	allowed := make([]string, 0, len(methods))
	for method := range methods {
		allowed = append(allowed, method)
	}
	slices.Sort(allowed)
	return allowed
}
