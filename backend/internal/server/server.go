// Package server adapts the problem packages to the playground's HTTP API.
package server

import (
	"log/slog"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"github.com/liel-almog/go-algorithm-playground/internal/controllers"
	"github.com/liel-almog/go-algorithm-playground/internal/routes"
	"github.com/liel-almog/go-algorithm-playground/internal/services"
)

// Server hosts a collection of independent problems and their HTTP middleware.
type Server struct {
	handler *echo.Echo
}

func New() *Server {
	godotenv.Load()

	e := echo.New()
	e.HTTPErrorHandler = handleHTTPError

	e.Use(
		cors(),
		middleware.Recover(),
	)

	e.Pre(
		requestMetadata,
		middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
			HandleError:     true,
			LogLatency:      true,
			LogMethod:       true,
			LogURIPath:      true,
			LogStatus:       true,
			LogResponseSize: true,
			LogValuesFunc: func(c *echo.Context, v middleware.RequestLoggerValues) error {
				slog.InfoContext(c.Request().Context(), "request",
					"requestId", c.Response().Header().Get(echo.HeaderXRequestID),
					"method", v.Method,
					"path", v.URIPath,
					"status", v.Status,
					"bytes", v.ResponseSize,
					"duration", v.Latency,
				)
				return nil
			},
		}),
	)

	routes.Register(e, controllers.New(services.NewCatalog()), limitAlgorithm(algorithmSlots()))
	return &Server{handler: e}
}

func (s *Server) Handler() *echo.Echo { return s.handler }
