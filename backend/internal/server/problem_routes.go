package server

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/liel-almog/go-algorithm-playground/internal/matrixverify"
	"github.com/liel-almog/go-algorithm-playground/internal/mincut"
	"github.com/liel-almog/go-algorithm-playground/internal/playground"
	"github.com/liel-almog/go-algorithm-playground/internal/polynomial"
)

const problemRoutePrefix = "/api/problems"

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

type matrixSolveRequest struct {
	A       matrixverify.Matrix `json:"a" validate:"required,min=2,max=10,dive,required,min=2,max=10,dive,gte=-1000000,lte=1000000"`
	B       matrixverify.Matrix `json:"b" validate:"required,min=2,max=10,dive,required,min=2,max=10,dive,gte=-1000000,lte=1000000"`
	Product matrixverify.Matrix `json:"product" validate:"required,min=2,max=10,dive,required,min=2,max=10,dive,gte=-1000000,lte=1000000"`
	Rounds  int                 `json:"rounds" validate:"required,min=1,max=10"`
}

type matrixGenerateRequest struct {
	Size int `json:"size" validate:"required,min=2,max=10"`
}

type polynomialSolveRequest struct {
	Left   []int64 `json:"left" validate:"required,min=1,max=21,dive,gte=0,lte=100"`
	Right  []int64 `json:"right" validate:"required,min=1,max=21,dive,gte=0,lte=100"`
	Rounds int     `json:"rounds" validate:"required,min=1,max=10"`
}

type polynomialGenerateRequest struct {
	Degree int `json:"degree" validate:"required,min=1,max=20"`
}

func newValidator() *validator.Validate {
	validate := validator.New()
	validate.RegisterTagNameFunc(func(field reflect.StructField) string {
		name := strings.SplitN(field.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})
	return validate
}

func (s *Server) registerProblemRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET "+problemRoutePrefix, s.problems)
	mux.HandleFunc("POST "+problemRoutePrefix+"/eight-puzzle/generate", s.generatePuzzle)
	mux.HandleFunc("POST "+problemRoutePrefix+"/eight-puzzle/solve", s.limitAlgorithm(s.solvePuzzle))
	mux.HandleFunc("POST "+problemRoutePrefix+"/minimum-cut/generate", s.generateMinimumCut)
	mux.HandleFunc("POST "+problemRoutePrefix+"/minimum-cut/solve", s.limitAlgorithm(s.solveMinimumCut))
	mux.HandleFunc("POST "+problemRoutePrefix+"/matrix-verification/generate", s.generateMatrices)
	mux.HandleFunc("POST "+problemRoutePrefix+"/matrix-verification/solve", s.limitAlgorithm(s.solveMatrixVerification))
	mux.HandleFunc("POST "+problemRoutePrefix+"/polynomial-identity/generate", s.generatePolynomial)
	mux.HandleFunc("POST "+problemRoutePrefix+"/polynomial-identity/solve", s.limitAlgorithm(s.solvePolynomialIdentity))
}

func (s *Server) problems(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"problems": problemCatalog()})
}

func problemCatalog() []problemDescription {
	return []problemDescription{
		{
			ID: "eight-puzzle", Title: "Sliding puzzle", Algorithm: "A*, breadth-first search, or iterative-deepening DFS",
			Description:      "Rearrange numbered tiles into ascending order by sliding one tile at a time into the empty space.",
			SolutionApproach: "The backend validates that the board is solvable, explores neighboring board states with the selected search strategy, and reconstructs the move-by-move path when it reaches the goal.",
			GenerateEndpoint: problemRoutePrefix + "/eight-puzzle/generate", SolveEndpoint: problemRoutePrefix + "/eight-puzzle/solve",
			Limits: []string{"rows and columns: 2 to 4", "runtime: 5 seconds"},
		},
		{
			ID: "minimum-cut", Title: "Minimum cut", Algorithm: "Karger's randomized contraction",
			Description:      "Find a small set of edges whose removal separates a connected graph into two groups.",
			SolutionApproach: "Each trial repeatedly contracts a random edge until two components remain. The backend returns the smallest crossing cut found across all requested trials.",
			GenerateEndpoint: problemRoutePrefix + "/minimum-cut/generate", SolveEndpoint: problemRoutePrefix + "/minimum-cut/solve",
			Limits: []string{"50 vertices", "1,000 edges", "500 trials", "250,000 edge-trial units", "runtime: 5 seconds"},
		},
		{
			ID: "matrix-verification", Title: "Matrix multiplication verification", Algorithm: "Freivalds' algorithm",
			Description:      "Check whether a claimed product C is equal to A multiplied by B without recomputing the full matrix product.",
			SolutionApproach: "For each round the backend samples a binary vector r and compares A(Br) with Cr. Any mismatch proves the claim false; repeated matches reduce the false-positive probability.",
			GenerateEndpoint: problemRoutePrefix + "/matrix-verification/generate", SolveEndpoint: problemRoutePrefix + "/matrix-verification/solve",
			Limits: []string{"matrix size: 2x2 to 10x10", "10 verification rounds", "runtime: 5 seconds"},
		},
		{
			ID: "polynomial-identity", Title: "Polynomial identity testing", Algorithm: "Schwartz-Zippel",
			Description:      "Determine whether two coefficient lists represent the same polynomial over the finite field F_101.",
			SolutionApproach: "The backend evaluates both polynomials at random nonzero field points using Horner's method. A mismatch proves they differ; repeated matches provide probabilistic evidence of identity.",
			GenerateEndpoint: problemRoutePrefix + "/polynomial-identity/generate", SolveEndpoint: problemRoutePrefix + "/polynomial-identity/solve",
			Limits: []string{"maximum degree: 20", "10 verification rounds", "runtime: 5 seconds"},
		},
	}
}

func (s *Server) generatePuzzle(w http.ResponseWriter, r *http.Request) {
	var request puzzleGenerateRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := s.playground.RandomPuzzle(playground.RandomPuzzleRequest{Rows: request.Rows, Columns: request.Columns, Scramble: request.Scramble})
	writeResult(w, result, err)
}

func (s *Server) solvePuzzle(w http.ResponseWriter, r *http.Request) {
	var request puzzleSolveRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := s.playground.Solve(r.Context(), playground.SolveRequest{
		BoardRequest: playground.BoardRequest{Rows: request.Rows, Columns: request.Columns, Tiles: request.Tiles},
		Algorithm:    request.Algorithm,
	})
	if err != nil {
		switch {
		case playground.IsSolverTimeout(err):
			writeSolverError(w, err)
		case errors.Is(err, playground.ErrUnsolvable):
			writeError(w, http.StatusUnprocessableEntity, err)
		default:
			writeError(w, http.StatusBadRequest, err)
		}
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (s *Server) generateMinimumCut(w http.ResponseWriter, r *http.Request) {
	var request minimumCutGenerateRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := mincut.Generate(request.Vertices)
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
	edges := make([]mincut.Edge, len(request.Edges))
	for i, edge := range request.Edges {
		edges[i] = mincut.Edge{From: edge.From, To: edge.To}
	}
	result, err := mincut.Solve(r.Context(), mincut.Graph{Vertices: request.Vertices, Edges: edges}, request.Trials)
	writeResult(w, result, err)
}

func (s *Server) generateMatrices(w http.ResponseWriter, r *http.Request) {
	var request matrixGenerateRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := matrixverify.Generate(request.Size)
	writeResult(w, result, err)
}

func (s *Server) solveMatrixVerification(w http.ResponseWriter, r *http.Request) {
	var request matrixSolveRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := matrixverify.Solve(r.Context(), request.A, request.B, request.Product, request.Rounds)
	writeResult(w, result, err)
}

func (s *Server) generatePolynomial(w http.ResponseWriter, r *http.Request) {
	var request polynomialGenerateRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := polynomial.Generate(request.Degree)
	writeResult(w, result, err)
}

func (s *Server) solvePolynomialIdentity(w http.ResponseWriter, r *http.Request) {
	var request polynomialSolveRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := polynomial.Solve(r.Context(), request.Left, request.Right, request.Rounds)
	writeResult(w, result, err)
}

func (s *Server) decodeAndValidate(w http.ResponseWriter, r *http.Request, destination any) bool {
	if !decode(w, r, destination) {
		return false
	}
	if err := s.validator.Struct(destination); err != nil {
		writeError(w, http.StatusBadRequest, validationError(err))
		return false
	}
	return true
}

func validationError(err error) error {
	var fields validator.ValidationErrors
	if !errors.As(err, &fields) {
		return errors.New("request validation failed")
	}
	field := fields[0]
	return fmt.Errorf("field %q failed validation rule %q", field.Field(), field.Tag())
}

func writeResult(w http.ResponseWriter, value any, err error) {
	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) {
			writeError(w, http.StatusRequestTimeout, err)
		} else {
			writeError(w, http.StatusBadRequest, err)
		}
		return
	}
	writeJSON(w, http.StatusOK, value)
}
