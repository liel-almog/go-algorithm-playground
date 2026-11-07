package routes

import (
	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/controllers"
)

func registerPuzzleRoutes(group *echo.Group, h *controllers.Controller, limit echo.MiddlewareFunc) {
	group.POST("/generate", h.GeneratePuzzle)
	group.POST("/astar/solve", h.SolvePuzzleAStar, limit)
	group.POST("/bfs/solve", h.SolvePuzzleBFS, limit)
	group.POST("/dfs/solve", h.SolvePuzzleIDDFS, limit)
}
