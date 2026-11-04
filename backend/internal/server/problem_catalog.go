package server

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

type problemDescription struct {
	ID               string   `json:"id"`
	Title            string   `json:"title"`
	Algorithm        string   `json:"algorithm"`
	Description      string   `json:"description"`
	SolutionApproach string   `json:"solutionApproach"`
	GenerateEndpoint string   `json:"generateEndpoint"`
	SolveEndpoint    string   `json:"solveEndpoint"`
	Limits           []string `json:"limits"`
}

type problemsResponse struct {
	Problems []problemDescription `json:"problems"`
}

func (s *Server) listProblems(c *echo.Context) error {
	descriptions := make([]problemDescription, 0, len(s.problems))
	for _, p := range s.problems {
		description := p.describe()
		description.GenerateEndpoint = generateEndpoint(description.ID)
		description.SolveEndpoint = solveEndpoint(description.ID)
		descriptions = append(descriptions, description)
	}
	return c.JSON(http.StatusOK, problemsResponse{Problems: descriptions})
}
