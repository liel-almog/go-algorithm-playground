package controllers

import (
	"net/http"
	"runtime"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/services"
)

type Controller struct{ catalog *services.Catalog }

func New(catalog *services.Catalog) *Controller { return &Controller{catalog: catalog} }

func (h *Controller) Index(c *echo.Context) error {
	return c.HTML(http.StatusOK, "<!doctype html><title>Algorithm Playground</title><h1>Algorithm Playground API</h1>")
}
func (h *Controller) Health(c *echo.Context) error {
	return c.JSON(http.StatusOK, struct {
		Status     string `json:"status"`
		GoVersion  string `json:"goVersion"`
		Algorithms int    `json:"algorithms"`
	}{Status: "ok", GoVersion: strings.TrimPrefix(runtime.Version(), "go"), Algorithms: h.catalog.AlgorithmCount()})
}
func (h *Controller) Algorithms(c *echo.Context) error {
	return c.JSON(http.StatusOK, h.catalog.Algorithms())
}
func (h *Controller) Problems(c *echo.Context) error {
	return c.JSON(http.StatusOK, h.catalog.ListProblems())
}
