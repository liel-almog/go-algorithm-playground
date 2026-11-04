package controllers

import (
	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/httpapi"
	"github.com/liel-almog/go-algorithm-playground/internal/services"
)

type polynomialSolveRequest struct {
	Left   []int64 `json:"left" validate:"required,min=1,max=21,dive,gte=0,lte=100"`
	Right  []int64 `json:"right" validate:"required,min=1,max=21,dive,gte=0,lte=100"`
	Rounds int     `json:"rounds" validate:"required,min=1,max=10"`
}
type polynomialGenerateRequest struct {
	Degree int `json:"degree" validate:"required,min=1,max=20"`
}

func (h *Controller) GeneratePolynomial(c *echo.Context) error {
	var request polynomialGenerateRequest
	if err := httpapi.DecodeAndValidate(c, &request); err != nil {
		return httpapi.WriteRequestError(c, err)
	}
	result, err := services.GeneratePolynomial(request.Degree)
	return httpapi.WriteResult(c, result, err)
}
func (h *Controller) SolvePolynomial(c *echo.Context) error {
	var request polynomialSolveRequest
	if err := httpapi.DecodeAndValidate(c, &request); err != nil {
		return httpapi.WriteRequestError(c, err)
	}
	result, err := services.SolvePolynomial(c.Request().Context(), request.Left, request.Right, request.Rounds)
	return httpapi.WriteResult(c, result, err)
}
