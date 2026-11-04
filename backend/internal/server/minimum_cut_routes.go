package server

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/minimumcut/karger"
)

const minimumCutID = "minimum-cut"

type minimumCutSolveRequest struct {
	Vertices []string `json:"vertices" validate:"required,min=2,max=50,dive,required,max=100"`
	Edges    []struct {
		From string `json:"from" validate:"required,max=100"`
		To   string `json:"to" validate:"required,max=100"`
	} `json:"edges" validate:"required,min=1,max=1000,dive"`
	Trials int `json:"trials" validate:"required,min=1,max=500"`
}

type minimumCutGenerateRequest struct {
	Vertices int `json:"vertices" validate:"required,min=3,max=50"`
}

type minimumCutProblem struct{}

func (minimumCutProblem) describe() problemDescription {
	return problemDescription{
		ID: minimumCutID, Title: "Minimum cut", Algorithm: "Karger's randomized contraction",
		Description:      "Find a small set of edges whose removal separates a connected graph into two groups.",
		SolutionApproach: "Each trial repeatedly contracts a random edge until two components remain. The backend returns the smallest crossing cut found across all requested trials.",
		Limits:           []string{"50 vertices", "1,000 edges", "500 trials", "250,000 edge-trial units", "runtime: 5 seconds"},
	}
}

func (minimumCutProblem) algorithms() algorithmCatalog {
	return algorithmCatalog{Tools: []algorithmTool{{
		ID: "karger", Name: "Karger randomized minimum cut", Category: "graph", Endpoint: solveEndpoint(minimumCutID),
	}}}
}

func (p minimumCutProblem) register(routes problemRoutes) {
	routes.generate(p.generate)
	routes.solve(p.solve)
}

func (minimumCutProblem) generate(c *echo.Context) error {
	var request minimumCutGenerateRequest
	if err := decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	result, err := karger.Generate(request.Vertices)
	return writeResult(c, result, err)
}

func (minimumCutProblem) solve(c *echo.Context) error {
	var request minimumCutSolveRequest
	if err := decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	if len(request.Edges)*request.Trials > maxMinCutWork {
		return writeError(c, http.StatusBadRequest, errors.New("edges multiplied by trials must not exceed 250000"))
	}
	edges := make([]karger.Edge, len(request.Edges))
	for i, edge := range request.Edges {
		edges[i] = karger.Edge{From: edge.From, To: edge.To}
	}
	result, err := karger.Solve(c.Request().Context(), karger.Graph{Vertices: request.Vertices, Edges: edges}, request.Trials)
	return writeResult(c, result, err)
}
