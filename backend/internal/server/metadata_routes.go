package server

import (
	"net/http"
	"runtime"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle"
)

type healthResponse struct {
	Status     string `json:"status"`
	GoVersion  string `json:"goVersion"`
	Algorithms int    `json:"algorithms"`
}

type algorithmsResponse struct {
	Algorithms []eightpuzzle.Algorithm `json:"algorithms"`
	Tools      []algorithmTool         `json:"tools"`
}

func (s *Server) health(c *echo.Context) error {
	return c.JSON(http.StatusOK, healthResponse{
		Status:     "ok",
		GoVersion:  strings.TrimPrefix(runtimeVersion(), "go"),
		Algorithms: len(s.eightPuzzle.Algorithms()) + len(algorithmTools()),
	})
}

var runtimeVersion = runtime.Version

type algorithmTool struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Category string `json:"category"`
	Endpoint string `json:"endpoint"`
}

func algorithmTools() []algorithmTool {
	return []algorithmTool{
		{ID: "karger", Name: "Karger randomized minimum cut", Category: "graph", Endpoint: problemRoutePrefix + "/minimum-cut/solve"},
		{ID: "freivalds", Name: "Freivalds matrix verification", Category: "matrix", Endpoint: problemRoutePrefix + "/matrix-verification/solve"},
		{ID: "schwartz-zippel", Name: "Schwartz-Zippel polynomial identity test", Category: "polynomial", Endpoint: problemRoutePrefix + "/polynomial-identity/solve"},
	}
}

func (s *Server) algorithms(c *echo.Context) error {
	return c.JSON(http.StatusOK, algorithmsResponse{
		Algorithms: s.eightPuzzle.Algorithms(),
		Tools:      algorithmTools(),
	})
}
