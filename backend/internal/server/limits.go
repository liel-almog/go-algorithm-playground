package server

import (
	"context"
	"errors"
	"net/http"
	"runtime"
	"time"
)

const (
	algorithmTimeout = 5 * time.Second
	maxRequestBytes  = 256 << 10
	maxMinCutWork    = 250_000
)

func algorithmSlots() chan struct{} {
	// Leave capacity for the HTTP server, garbage collector, and health checks.
	limit := min(4, max(1, runtime.GOMAXPROCS(0)/2))
	return make(chan struct{}, limit)
}

// limitAlgorithm bounds both the wall-clock time and the number of concurrent
// CPU-heavy requests. Algorithms must observe the request context for the
// deadline to stop their work promptly.
func (s *Server) limitAlgorithm(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), algorithmTimeout)
		defer cancel()

		select {
		case s.algorithmSlots <- struct{}{}:
			defer func() { <-s.algorithmSlots }()
		case <-ctx.Done():
			writeError(w, http.StatusServiceUnavailable, errors.New("the server is busy; try again shortly"))
			return
		}

		next(w, r.WithContext(ctx))
	}
}
