package server

import (
	"context"
	"log/slog"
	"net/http"
	"runtime"
	"time"

	"github.com/labstack/echo/v5"
)

const (
	gracefulTimeout   = 10 * time.Second
	readHeaderTimeout = 5 * time.Second
	readTimeout       = 15 * time.Second
	writeTimeout      = 10 * time.Second
	idleTimeout       = 60 * time.Second
)

// Run builds the server from the environment and serves it until ctx is
// cancelled, then shuts down gracefully.
func Run(ctx context.Context) error {
	server := New(allowedOriginsFromEnv())
	return server.start(ctx, parsePort())
}

func (s *Server) start(ctx context.Context, port string) error {
	config := echo.StartConfig{
		Address:         ":" + port,
		HideBanner:      true,
		HidePort:        true,
		GracefulTimeout: gracefulTimeout,
		OnShutdownError: func(err error) {
			slog.Error("graceful shutdown failed", "error", err)
		},
		BeforeServeFunc: func(httpServer *http.Server) error {
			httpServer.ReadHeaderTimeout = readHeaderTimeout
			httpServer.ReadTimeout = readTimeout
			httpServer.WriteTimeout = writeTimeout
			httpServer.IdleTimeout = idleTimeout
			slog.Info("algorithm playground ready",
				"url", "http://localhost:"+port,
				"go", runtime.Version(),
				"algorithms", s.algorithmCount(),
			)
			return nil
		},
	}

	return config.Start(ctx, s.handler)
}
