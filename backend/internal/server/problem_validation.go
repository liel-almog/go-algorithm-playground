package server

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v5"
)

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

func (s *Server) decodeAndValidate(c *echo.Context, destination any) error {
	if err := decode(c, destination); err != nil {
		return err
	}
	if err := s.validator.Struct(destination); err != nil {
		return validationError(err)
	}
	return nil
}

func validationError(err error) error {
	var fields validator.ValidationErrors
	if !errors.As(err, &fields) {
		return errors.New("request validation failed")
	}
	field := fields[0]
	return fmt.Errorf("field %q failed validation rule %q", field.Field(), field.Tag())
}

func writeResult(c *echo.Context, value any, err error) error {
	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) {
			return writeError(c, http.StatusRequestTimeout, err)
		}
		return writeError(c, http.StatusBadRequest, err)
	}
	return c.JSON(http.StatusOK, value)
}
