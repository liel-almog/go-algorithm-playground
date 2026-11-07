package server

import (
	"crypto/rand"

	"github.com/labstack/echo/v5"
)

func requestMetadata(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		// Generate the ID here so callers cannot inject arbitrary log identifiers.
		c.Response().Header().Set(echo.HeaderXRequestID, rand.Text())
		c.Response().Header().Set("X-Content-Type-Options", "nosniff")
		return next(c)
	}
}
