package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/playground"
	appserver "github.com/liel-almog/go-algorithm-playground/internal/server"
	"github.com/liel-almog/go-algorithm-playground/internal/solver"
)

func main() {
	registry := solver.DefaultRegistry()
	service := playground.New(registry)
	server := appserver.New(service, appserver.AllowedOriginsFromEnv())
	port := appserver.ParsePort()
	e := echo.New()
	e.Any("/", echo.WrapHandler(server.Handler()))
	e.Any("/*", echo.WrapHandler(server.Handler()))
	httpServer := &http.Server{
		Addr:              ":" + port,
		Handler:           e,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		slog.Info("algorithm playground ready", "url", "http://localhost:"+port, "go", runtime.Version(), "algorithms", len(registry.List()))
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("server stopped", "error", err)
			os.Exit(1)
		}
	}()

	<-stop
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := httpServer.Shutdown(ctx); err != nil {
		slog.Error("graceful shutdown failed", "error", err)
	}
}
