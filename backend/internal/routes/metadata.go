package routes

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/controllers"
)

func registerMetadataRoutes(api, problems *echo.Group, h *controllers.Controller, add apiRegistrar) {
	add(api, http.MethodGet, "/health", h.Health)
	add(api, http.MethodGet, "/algorithms", h.Algorithms)
	add(problems, http.MethodGet, "", h.Problems)
	add(problems, http.MethodGet, "/", h.Problems)
}
