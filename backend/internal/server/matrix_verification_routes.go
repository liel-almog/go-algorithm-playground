package server

import (
	"net/http"

	"github.com/liel-almog/go-algorithm-playground/internal/problems/matrixverification/freivalds"
)

type matrixSolveRequest struct {
	A       freivalds.Matrix `json:"a" validate:"required,min=2,max=10,dive,required,min=2,max=10,dive,gte=-1000000,lte=1000000"`
	B       freivalds.Matrix `json:"b" validate:"required,min=2,max=10,dive,required,min=2,max=10,dive,gte=-1000000,lte=1000000"`
	Product freivalds.Matrix `json:"product" validate:"required,min=2,max=10,dive,required,min=2,max=10,dive,gte=-1000000,lte=1000000"`
	Rounds  int              `json:"rounds" validate:"required,min=1,max=10"`
}

type matrixGenerateRequest struct {
	Size int `json:"size" validate:"required,min=2,max=10"`
}

func (s *Server) registerMatrixVerificationRoutes(mux *http.ServeMux) {
	s.registerAPI(mux, http.MethodPost, problemRoutePrefix+"/matrix-verification/generate", s.generateMatrices)
	s.registerAPI(mux, http.MethodPost, problemRoutePrefix+"/matrix-verification/solve", s.limitAlgorithm(s.solveMatrixVerification))
}

func (s *Server) generateMatrices(w http.ResponseWriter, r *http.Request) {
	var request matrixGenerateRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := freivalds.Generate(request.Size)
	writeResult(w, result, err)
}

func (s *Server) solveMatrixVerification(w http.ResponseWriter, r *http.Request) {
	var request matrixSolveRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := freivalds.Solve(r.Context(), request.A, request.B, request.Product, request.Rounds)
	writeResult(w, result, err)
}
