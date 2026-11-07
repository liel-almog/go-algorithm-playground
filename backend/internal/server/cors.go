package server

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

func cors() echo.MiddlewareFunc {
	allowedOrigins, err := allowedOriginsFromEnv()
	if err != nil {
		panic(err)
	}
	return middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:  allowedOrigins,
		AllowMethods:  []string{http.MethodGet, http.MethodPost},
		AllowHeaders:  []string{echo.HeaderContentType, echo.HeaderAuthorization},
		ExposeHeaders: []string{echo.HeaderXRequestID},
		MaxAge:        600,
	})
}
