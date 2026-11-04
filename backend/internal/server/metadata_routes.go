package server

import (
	"net/http"
	"runtime"
	"strings"

	"github.com/labstack/echo/v5"
)

type healthResponse struct {
	Status     string `json:"status"`
	GoVersion  string `json:"goVersion"`
	Algorithms int    `json:"algorithms"`
}

// algorithmOption is an algorithm a client can select when solving a problem.
type algorithmOption struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Optimal     bool   `json:"optimal"`
	Category    string `json:"category"`
}

// algorithmTool is an algorithm that is exposed as a problem endpoint itself.
type algorithmTool struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Category string `json:"category"`
	Endpoint string `json:"endpoint"`
}

type algorithmCatalog struct {
	Algorithms []algorithmOption `json:"algorithms"`
	Tools      []algorithmTool   `json:"tools"`
}

// catalog merges what every registered problem offers.
func (s *Server) catalog() algorithmCatalog {
	catalog := algorithmCatalog{Algorithms: []algorithmOption{}, Tools: []algorithmTool{}}
	for _, p := range s.problems {
		offered := p.algorithms()
		catalog.Algorithms = append(catalog.Algorithms, offered.Algorithms...)
		catalog.Tools = append(catalog.Tools, offered.Tools...)
	}
	return catalog
}

func (s *Server) algorithmCount() int {
	catalog := s.catalog()
	return len(catalog.Algorithms) + len(catalog.Tools)
}

func (s *Server) health(c *echo.Context) error {
	return c.JSON(http.StatusOK, healthResponse{
		Status:     "ok",
		GoVersion:  strings.TrimPrefix(runtime.Version(), "go"),
		Algorithms: s.algorithmCount(),
	})
}

func (s *Server) algorithms(c *echo.Context) error {
	return c.JSON(http.StatusOK, s.catalog())
}
