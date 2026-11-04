package server

import (
	"errors"
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/httpapi"
)

func (s *Server) cors(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		r := c.Request()
		w := c.Response()
		origin := r.Header.Get("Origin")
		allowedOrigin := origin == "" || s.originAllowed(origin)
		wildcardOrigin := len(s.allowedOrigins) == 1 && s.allowedOrigins[0] == "*"
		if !wildcardOrigin {
			w.Header().Add("Vary", "Origin")
		}
		methods, pathExists := s.apiRoutes[r.URL.Path]
		if origin != "" && allowedOrigin {
			if wildcardOrigin {
				w.Header().Set("Access-Control-Allow-Origin", "*")
			} else {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			}
			if pathExists {
				w.Header().Set("Access-Control-Allow-Methods", strings.Join(allowedMethods(methods), ", "))
			}
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Max-Age", "86400")
			w.Header().Set("Access-Control-Expose-Headers", echo.HeaderXRequestID)
		}
		if r.Method == http.MethodOptions {
			w.Header().Add("Vary", "Access-Control-Request-Method")
			if !allowedOrigin {
				return httpapi.WriteError(c, http.StatusForbidden, errors.New("origin is not allowed"))
			}
			requestedMethod := r.Header.Get("Access-Control-Request-Method")
			if !pathExists {
				return apiNotFound(c)
			}
			if _, methodExists := methods[requestedMethod]; requestedMethod == "" || !methodExists {
				w.Header().Set("Allow", strings.Join(allowedMethods(methods), ", "))
				return httpapi.WriteError(c, http.StatusMethodNotAllowed, errors.New("requested method is not allowed"))
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
