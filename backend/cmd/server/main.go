package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	appserver "github.com/liel-almog/go-algorithm-playground/internal/server"
)

func main() {
	if err := run(); err != nil {
		slog.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

// run owns the process lifecycle, so deferred cleanup runs before main exits.
func run() error {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	return appserver.Run(ctx)
}
