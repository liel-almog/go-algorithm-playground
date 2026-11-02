package server

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
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
