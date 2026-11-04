package controllers

import (
	"errors"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/httpapi"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/matrixverification/freivalds"
	"github.com/liel-almog/go-algorithm-playground/internal/services"
)

type matrixSolveRequest struct {
	A       freivalds.Matrix  `json:"a" validate:"required,min=1,max=100"`
	B       freivalds.Matrix  `json:"b" validate:"required,min=1,max=100"`
	C       *freivalds.Matrix `json:"c"`
	Product freivalds.Matrix  `json:"product"`
	Rounds  *int              `json:"rounds" validate:"omitempty,min=1,max=15"`
}

func (request matrixSolveRequest) validateMatrices() error {
	if request.C != nil {
		if request.Product != nil || request.Rounds != nil {
			return errors.New("c cannot be combined with product or rounds; use product for multiple rounds")
		}
		_, err := freivalds.ValidateMatrices(request.A, request.B, *request.C)
		return err
	}
	if request.Product == nil {
		return errors.New("field \"product\" is required when c is not provided")
	}
	_, err := freivalds.ValidateMatrices(request.A, request.B, request.Product)
	return err
}

type matrixGenerateRequest struct {
	Size int `json:"size" validate:"required,min=1,max=100"`
}

func (h *Controller) GenerateMatrix(c *echo.Context) error {
	var request matrixGenerateRequest
	if err := httpapi.DecodeAndValidate(c, &request); err != nil {
		return httpapi.WriteRequestError(c, err)
	}
	result, err := services.GenerateMatrix(request.Size)
	return httpapi.WriteResult(c, result, err)
}
func (h *Controller) SolveMatrix(c *echo.Context) error {
	var request matrixSolveRequest
	if err := httpapi.DecodeAndValidate(c, &request); err != nil {
		return httpapi.WriteRequestError(c, err)
	}
	if err := request.validateMatrices(); err != nil {
		return httpapi.WriteRequestError(c, err)
	}
	if request.C != nil {
		result, err := services.CheckMatrix(c.Request().Context(), request.A, request.B, *request.C)
		return httpapi.WriteResult(c, result, err)
	}
	rounds := 1
	if request.Rounds != nil {
		rounds = *request.Rounds
	}
	result, err := services.SolveMatrix(c.Request().Context(), request.A, request.B, request.Product, rounds)
	return httpapi.WriteResult(c, result, err)
}
