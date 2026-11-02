package server

import (
	"errors"
	"net/http"

	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle"
)

type puzzleSolveRequest struct {
	Rows      int    `json:"row" validate:"required,min=2,max=4"`
	Columns   int    `json:"column" validate:"required,min=2,max=4"`
	Tiles     []int  `json:"tiles" validate:"required,min=4,max=16,dive,gte=0,lte=15"`
	Algorithm string `json:"algorithm" validate:"required,oneof=astar bfs dfs"`
}

type puzzleGenerateRequest struct {
	Rows     int `json:"row" validate:"required,min=2,max=4"`
	Columns  int `json:"column" validate:"required,min=2,max=4"`
	Scramble int `json:"scramble" validate:"required,min=1,max=200"`
}

func (s *Server) registerEightPuzzleRoutes(mux *http.ServeMux) {
	s.registerAPI(mux, http.MethodPost, problemRoutePrefix+"/eight-puzzle/generate", s.generatePuzzle)
	s.registerAPI(mux, http.MethodPost, problemRoutePrefix+"/eight-puzzle/solve", s.limitAlgorithm(s.solvePuzzle))
}

func (s *Server) generatePuzzle(w http.ResponseWriter, r *http.Request) {
	var request puzzleGenerateRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := s.eightPuzzle.RandomPuzzle(eightpuzzle.RandomPuzzleRequest{Rows: request.Rows, Columns: request.Columns, Scramble: request.Scramble})
	writeResult(w, result, err)
}

func (s *Server) solvePuzzle(w http.ResponseWriter, r *http.Request) {
	var request puzzleSolveRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := s.eightPuzzle.Solve(r.Context(), eightpuzzle.SolveRequest{
		BoardRequest: eightpuzzle.BoardRequest{Rows: request.Rows, Columns: request.Columns, Tiles: request.Tiles},
		Algorithm:    request.Algorithm,
	})
	if err != nil {
		switch {
		case eightpuzzle.IsSolverTimeout(err):
			writeSolverError(w, err)
		case eightpuzzle.IsSolverLimit(err), errors.Is(err, eightpuzzle.ErrUnsolvable):
			writeError(w, http.StatusUnprocessableEntity, err)
		default:
			writeError(w, http.StatusBadRequest, err)
		}
		return
	}
	writeJSON(w, http.StatusOK, result)
}
