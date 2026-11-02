package server

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/minimumcut/karger"
)

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

func (s *Server) registerMinimumCutRoutes(e *echo.Echo) {
	s.registerAPI(e, http.MethodPost, problemRoutePrefix+"/minimum-cut/generate", s.generateMinimumCut)
	s.registerAPI(e, http.MethodPost, problemRoutePrefix+"/minimum-cut/solve", s.solveMinimumCut, s.limitAlgorithm)
}

func (s *Server) generateMinimumCut(c *echo.Context) error {
	var request minimumCutGenerateRequest
	if err := s.decodeAndValidate(c, &request); err != nil {
		return writeError(c, http.StatusBadRequest, err)
	}
	result, err := karger.Generate(request.Vertices)
	return writeResult(c, result, err)
}

func (s *Server) solveMinimumCut(c *echo.Context) error {
	var request minimumCutSolveRequest
	if err := s.decodeAndValidate(c, &request); err != nil {
		return writeError(c, http.StatusBadRequest, err)
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
