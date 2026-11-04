package server

import (
	"errors"
	"fmt"
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
	name, parameter := field.Field(), field.Param()
	switch field.Tag() {
	case "required":
		return fmt.Errorf("field %q is required", name)
	case "min", "gte":
		if field.Kind() == reflect.Slice || field.Kind() == reflect.String {
			return fmt.Errorf("field %q must contain at least %s items or characters", name, parameter)
		}
		return fmt.Errorf("field %q must be at least %s", name, parameter)
	case "max", "lte":
		if field.Kind() == reflect.Slice || field.Kind() == reflect.String {
			return fmt.Errorf("field %q must contain at most %s items or characters", name, parameter)
		}
		return fmt.Errorf("field %q must be at most %s", name, parameter)
	case "oneof":
		return fmt.Errorf("field %q must be one of: %s", name, parameter)
	default:
		return fmt.Errorf("field %q is invalid", name)
	}
}
