package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle/solver"
	appserver "github.com/liel-almog/go-algorithm-playground/internal/server"
)

func main() {
	if err := run(); err != nil {
		slog.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

// run owns startup and cleanup, so deferred shutdown runs before main exits.
func run() error {
	registry := solver.DefaultRegistry()
	service := eightpuzzle.New(registry)
	server := appserver.New(service, appserver.AllowedOriginsFromEnv())
	port := appserver.ParsePort()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	config := echo.StartConfig{
		Address:         ":" + port,
		HideBanner:      true,
		HidePort:        true,
		GracefulTimeout: 10 * time.Second,
		OnShutdownError: func(err error) {
			slog.Error("graceful shutdown failed", "error", err)
		},
		BeforeServeFunc: func(httpServer *http.Server) error {
			httpServer.ReadHeaderTimeout = 5 * time.Second
			httpServer.ReadTimeout = 15 * time.Second
			httpServer.WriteTimeout = 10 * time.Second
			httpServer.IdleTimeout = 60 * time.Second
			slog.Info("algorithm playground ready", "url", "http://localhost:"+port, "go", runtime.Version(), "algorithms", len(registry.List()))
			return nil
		},
	}
	return config.Start(ctx, server.Handler())
}
