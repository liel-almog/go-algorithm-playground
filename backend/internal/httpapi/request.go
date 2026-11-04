package httpapi

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

const maxRequestBytes = 256 << 10

var (
	errUnsupportedMediaType = errors.New("Content-Type must be application/json")
	errInvalidUTF8          = errors.New("request body must be valid UTF-8")
	errMultipleJSONValues   = errors.New("request body must contain exactly one JSON object")
	errRequestTooLarge      = errors.New("request body exceeds 256 KiB")
	errQueryNotSupported    = errors.New("query parameters are not supported")
	errGETBodyNotSupported  = errors.New("GET requests must not contain a body")
)

// decode enforces the wire contract before Go can coerce nulls into zero
// values or accept case-insensitive and repeated object keys.
func decode(c *echo.Context, destination any) error {
	request := c.Request()
	if err := validateJSONContentType(request.Header.Get("Content-Type")); err != nil {
		return err
	}

	body, err := readRequestBody(c, request)
	if err != nil {
		return err
	}

	return decodeJSONBody(body, destination)
}

func validateJSONContentType(contentType string) error {
	mediaType, _, err := mime.ParseMediaType(contentType)
	if err != nil || mediaType != "application/json" {
		return errUnsupportedMediaType
	}
	return nil
}

func readRequestBody(c *echo.Context, request *http.Request) ([]byte, error) {
	request.Body = http.MaxBytesReader(c.Response(), request.Body, maxRequestBytes)
	body, err := io.ReadAll(request.Body)
	if err != nil {
		return nil, fmt.Errorf("cannot read request body: %w", err)
	}
	return body, nil
}

func decodeJSONBody(body []byte, destination any) error {
	if !utf8.Valid(body) {
		return errInvalidUTF8
	}

	if err := validateJSONDocument(body, reflect.TypeOf(destination)); err != nil {
		return err
	}

	if err := json.Unmarshal(body, destination); err != nil {
		return fmt.Errorf("invalid JSON: %w", err)
	}
	return nil
}

func validateJSONDocument(body []byte, destinationType reflect.Type) error {
	decoder := json.NewDecoder(bytes.NewReader(body))
	decoder.UseNumber()

	if err := validateJSONValue(decoder, destinationType); err != nil {
		return fmt.Errorf("invalid JSON: %w", err)
	}
	if _, err := decoder.Token(); err != io.EOF {
		return errMultipleJSONValues
	}
	return nil
}

func WriteRequestError(c *echo.Context, err error) error {
	var tooLarge *http.MaxBytesError
	switch {
	case errors.Is(err, errUnsupportedMediaType):
		return WriteError(c, http.StatusUnsupportedMediaType, err)
	case errors.As(err, &tooLarge):
		return WriteError(c, http.StatusRequestEntityTooLarge, errRequestTooLarge)
	default:
		return WriteError(c, http.StatusBadRequest, err)
	}
}

// All current API inputs live in JSON bodies; reject ignored query/body inputs.
func ValidateAPIRequest(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		if err := validateRequestInput(c.Request()); err != nil {
			return WriteRequestError(c, err)
		}
		return next(c)
	}
}

func validateRequestInput(request *http.Request) error {
	if request.URL.RawQuery != "" {
		return errQueryNotSupported
	}
	if request.Method == http.MethodGet && requestHasBody(request) {
		return errGETBodyNotSupported
	}
	return nil
}

func requestHasBody(request *http.Request) bool {
	return request.ContentLength != 0 || len(request.TransferEncoding) != 0
}
