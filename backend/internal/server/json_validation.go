package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"reflect"
	"strings"
)

// Request DTOs contain only explicitly named structs, slices, and scalar
// values. Walking that shape also bounds nesting before decoding the body.
func validateJSONValue(decoder *json.Decoder, shape reflect.Type) error {
	for shape.Kind() == reflect.Pointer {
		shape = shape.Elem()
	}
	token, err := decoder.Token()
	if err != nil {
		return err
	}
	if token == nil {
		return errors.New("null values are not allowed")
	}
	switch shape.Kind() {
	case reflect.Struct:
		if token != json.Delim('{') {
			return errors.New("expected a JSON object")
		}
		return validateJSONObject(decoder, shape)
	case reflect.Slice:
		if token != json.Delim('[') {
			return errors.New("expected a JSON array")
		}
		return validateJSONArray(decoder, shape.Elem())
	default:
		if _, nested := token.(json.Delim); nested {
			return errors.New("expected a scalar value")
		}
		// json.Unmarshal checks the exact scalar type and integer range.
		return nil
	}
}

// validateJSONObject reads fields after the opening object delimiter.
func validateJSONObject(decoder *json.Decoder, shape reflect.Type) error {
	fields := make(map[string]reflect.Type, shape.NumField())
	collectJSONFields(fields, shape)
	seen := make(map[string]bool, len(fields))
	for decoder.More() {
		key, err := decoder.Token()
		if err != nil {
			return err
		}
		name, ok := key.(string)
		if !ok {
			return errors.New("expected a field name")
		}
		field, exists := fields[name]
		if !exists {
			return fmt.Errorf("unknown field %q", name)
		}
		if seen[name] {
			return fmt.Errorf("duplicate field %q", name)
		}
		seen[name] = true
		if err := validateJSONValue(decoder, field); err != nil {
			return fmt.Errorf("field %q: %w", name, err)
		}
	}
	_, err := decoder.Token()
	return err
}

// collectJSONFields records the JSON fields of shape. Untagged embedded structs
// are flattened the way encoding/json does, so request types can extend a
// shared base request by embedding it.
func collectJSONFields(fields map[string]reflect.Type, shape reflect.Type) {
	for i := range shape.NumField() {
		field := shape.Field(i)
		name := strings.SplitN(field.Tag.Get("json"), ",", 2)[0]
		if field.Anonymous && name == "" && field.Type.Kind() == reflect.Struct {
			collectJSONFields(fields, field.Type)
			continue
		}
		if name != "" && name != "-" {
			fields[name] = field.Type
		}
	}
}

func validateJSONArray(decoder *json.Decoder, elementType reflect.Type) error {
	for decoder.More() {
		if err := validateJSONValue(decoder, elementType); err != nil {
			return err
		}
	}
	_, err := decoder.Token()
	return err
}
