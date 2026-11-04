package routes

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/controllers"
)

func registerPuzzleRoutes(group *echo.Group, h *controllers.Controller, add apiRegistrar, limit echo.MiddlewareFunc) {
	add(group, http.MethodPost, "/generate", h.GeneratePuzzle)
	add(group, http.MethodPost, "/astar/solve", h.SolvePuzzleAStar, limit)
	add(group, http.MethodPost, "/bfs/solve", h.SolvePuzzleBFS, limit)
	add(group, http.MethodPost, "/dfs/solve", h.SolvePuzzleIDDFS, limit)
}
