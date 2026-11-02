package server

import (
	"errors"
	"net/http"

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

func (s *Server) registerMinimumCutRoutes(mux *http.ServeMux) {
	s.registerAPI(mux, http.MethodPost, problemRoutePrefix+"/minimum-cut/generate", s.generateMinimumCut)
	s.registerAPI(mux, http.MethodPost, problemRoutePrefix+"/minimum-cut/solve", s.limitAlgorithm(s.solveMinimumCut))
}

func (s *Server) generateMinimumCut(w http.ResponseWriter, r *http.Request) {
	var request minimumCutGenerateRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := karger.Generate(request.Vertices)
	writeResult(w, result, err)
}

func (s *Server) solveMinimumCut(w http.ResponseWriter, r *http.Request) {
	var request minimumCutSolveRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	if len(request.Edges)*request.Trials > maxMinCutWork {
		writeError(w, http.StatusBadRequest, errors.New("edges multiplied by trials must not exceed 250000"))
		return
	}
	edges := make([]karger.Edge, len(request.Edges))
	for i, edge := range request.Edges {
		edges[i] = karger.Edge{From: edge.From, To: edge.To}
	}
	result, err := karger.Solve(r.Context(), karger.Graph{Vertices: request.Vertices, Edges: edges}, request.Trials)
	writeResult(w, result, err)
}
