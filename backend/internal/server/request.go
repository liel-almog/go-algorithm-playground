package server

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime"
	"net/http"
	"reflect"
	"unicode/utf8"

	"github.com/labstack/echo/v5"
)

// decode enforces the wire contract before Go can coerce nulls into zero
// values or accept case-insensitive and repeated object keys.
func decode(c *echo.Context, destination any) error {
	r := c.Request()
	mediaType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil || mediaType != "application/json" {
		return errUnsupportedMediaType
	}
	r.Body = http.MaxBytesReader(c.Response(), r.Body, maxRequestBytes)
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return fmt.Errorf("cannot read request body: %w", err)
	}
	if !utf8.Valid(body) {
		return errors.New("request body must be valid UTF-8")
	}
	decoder := json.NewDecoder(bytes.NewReader(body))
	decoder.UseNumber()
	if err := validateJSONValue(decoder, reflect.TypeOf(destination)); err != nil {
		return fmt.Errorf("invalid JSON: %w", err)
	}
	if _, err := decoder.Token(); err != io.EOF {
		return errors.New("request body must contain exactly one JSON object")
	}
	if err := json.Unmarshal(body, destination); err != nil {
		return fmt.Errorf("invalid JSON: %w", err)
	}
	return nil
}

var errUnsupportedMediaType = errors.New("Content-Type must be application/json")

func writeRequestError(c *echo.Context, err error) error {
	var tooLarge *http.MaxBytesError
	switch {
	case errors.Is(err, errUnsupportedMediaType):
		return writeError(c, http.StatusUnsupportedMediaType, err)
	case errors.As(err, &tooLarge):
		return writeError(c, http.StatusRequestEntityTooLarge, errors.New("request body exceeds 256 KiB"))
	default:
		return writeError(c, http.StatusBadRequest, err)
	}
}

// All current API inputs live in JSON bodies; reject ignored query/body inputs.
func (s *Server) validateAPIRequest(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		r := c.Request()
		if r.URL.RawQuery != "" {
			return writeRequestError(c, errors.New("query parameters are not supported"))
		}
		if r.Method == http.MethodGet && (r.ContentLength != 0 || len(r.TransferEncoding) != 0) {
			return writeRequestError(c, errors.New("GET requests must not contain a body"))
		}
		return next(c)
	}
}
