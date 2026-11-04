package controllers

import (
	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/httpapi"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/minimumcut/karger"
	"github.com/liel-almog/go-algorithm-playground/internal/services"
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

func (h *Controller) GenerateMinimumCut(c *echo.Context) error {
	var request minimumCutGenerateRequest
	if err := httpapi.DecodeAndValidate(c, &request); err != nil {
		return httpapi.WriteRequestError(c, err)
	}
	result, err := services.GenerateMinimumCut(request.Vertices)
	return httpapi.WriteResult(c, result, err)
}
func (h *Controller) SolveMinimumCut(c *echo.Context) error {
	var request minimumCutSolveRequest
	if err := httpapi.DecodeAndValidate(c, &request); err != nil {
		return httpapi.WriteRequestError(c, err)
	}
	edges := make([]karger.Edge, len(request.Edges))
	for i, edge := range request.Edges {
		edges[i] = karger.Edge{From: edge.From, To: edge.To}
	}
	result, err := services.SolveMinimumCut(c.Request().Context(), request.Vertices, edges, request.Trials)
	return httpapi.WriteResult(c, result, err)
}
