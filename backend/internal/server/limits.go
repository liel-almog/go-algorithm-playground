package server

import (
	"context"
	"errors"
	"net/http"
	"runtime"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/httpapi"
)

const (
	algorithmTimeout = 5 * time.Second
)

func algorithmSlots() chan struct{} {
	// Leave capacity for the HTTP server, garbage collector, and health checks.
	limit := min(4, max(1, runtime.GOMAXPROCS(0)/2))
	return make(chan struct{}, limit)
}

// limitAlgorithm bounds both the wall-clock time and the number of concurrent
// CPU-heavy requests. Algorithms must observe the request context for the
// deadline to stop their work promptly.
func (s *Server) limitAlgorithm(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		r := c.Request()
		ctx, cancel := context.WithTimeout(r.Context(), algorithmTimeout)
		defer cancel()

		select {
		case s.algorithmSlots <- struct{}{}:
			defer func() { <-s.algorithmSlots }()
		case <-ctx.Done():
			return httpapi.WriteError(c, http.StatusServiceUnavailable, errors.New("the server is busy; try again shortly"))
		}

		c.SetRequest(r.WithContext(ctx))
		return next(c)
	}
}
