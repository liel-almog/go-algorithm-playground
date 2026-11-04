package server

import (
	"encoding/json"
	"maps"
	"net/http"
	"net/http/httptest"
	"slices"
	"strings"
	"testing"
)

func TestHealthAndCORS(t *testing.T) {
	server := New([]string{"http://localhost:3000"})

	request := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	request.Header.Set("Origin", "http://localhost:3000")
	response := httptest.NewRecorder()
	server.Handler().ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d", response.Code)
	}
	if got := response.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:3000" {
		t.Fatalf("CORS origin = %q", got)
	}
}

func TestStaticAppIsServed(t *testing.T) {
	server := New(nil)
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	response := httptest.NewRecorder()
	server.Handler().ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d", response.Code)
	}
	if !strings.Contains(response.Body.String(), "Algorithm Playground") {
		t.Fatal("missing app markup")
	}
}

func TestPuzzleProblemAcceptsRowAndColumn(t *testing.T) {
	server := New(nil)
	request := httptest.NewRequest(
		http.MethodPost,
		"/api/problems/eight-puzzle/generate",
		strings.NewReader(`{"row":2,"column":3,"scramble":4}`),
	)
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()

	server.Handler().ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
	if body := response.Body.String(); !strings.Contains(body, `"row":2`) || !strings.Contains(body, `"column":3`) {
		t.Fatalf("response does not contain requested dimensions: %s", body)
	}
}

func TestMatrixVerificationRoutesValidateRequests(t *testing.T) {
	server := New(nil)
	routes := []string{
		"/api/problems/matrix-verification/solve",
		"/api/problems/matrix-verification/freivalds/solve",
	}
	validRequests := []struct {
		name, body string
		legacy     bool
		trials     int
	}{
		{"c claim", `{"a":[[1]],"b":[[0]],"c":[[0]]}`, true, 0},
		{"product with default rounds", `{"a":[[1]],"b":[[0]],"product":[[0]]}`, false, 1},
		{"product with multiple rounds", `{"a":[[1]],"b":[[0]],"product":[[0]],"rounds":15}`, false, 15},
	}
	invalidRequests := map[string]string{
		"missing a":              `{"b":[[0]],"product":[[0]]}`,
		"missing b":              `{"a":[[1]],"product":[[0]]}`,
		"missing claim":          `{"a":[[1]],"b":[[0]]}`,
		"empty a":                `{"a":[],"b":[[0]],"product":[[0]]}`,
		"empty b":                `{"a":[[1]],"b":[],"product":[[0]]}`,
		"empty c":                `{"a":[[1]],"b":[[0]],"c":[]}`,
		"empty product":          `{"a":[[1]],"b":[[0]],"product":[]}`,
		"non-square a":           `{"a":[[1,0]],"b":[[0]],"product":[[0]]}`,
		"non-square b":           `{"a":[[1]],"b":[[0,1]],"product":[[0]]}`,
		"non-square c":           `{"a":[[1]],"b":[[0]],"c":[[0,1]]}`,
		"non-square product":     `{"a":[[1]],"b":[[0]],"product":[[0,1]]}`,
		"mismatched dimensions":  `{"a":[[1]],"b":[[1,0],[0,1]],"product":[[1]]}`,
		"mismatched c":           `{"a":[[1]],"b":[[0]],"c":[[1,0],[0,1]]}`,
		"negative value":         `{"a":[[-1]],"b":[[0]],"product":[[0]]}`,
		"value above one":        `{"a":[[2]],"b":[[0]],"product":[[0]]}`,
		"invalid c value":        `{"a":[[1]],"b":[[0]],"c":[[2]]}`,
		"fractional value":       `{"a":[[0.5]],"b":[[0]],"product":[[0]]}`,
		"null matrix":            `{"a":null,"b":[[0]],"product":[[0]]}`,
		"null row":               `{"a":[null],"b":[[0]],"product":[[0]]}`,
		"null value":             `{"a":[[null]],"b":[[0]],"product":[[0]]}`,
		"null claim":             `{"a":[[1]],"b":[[0]],"c":null}`,
		"null rounds":            `{"a":[[1]],"b":[[0]],"product":[[0]],"rounds":null}`,
		"scalar matrix":          `{"a":1,"b":[[0]],"product":[[0]]}`,
		"string cell":            `{"a":[["1"]],"b":[[0]],"product":[[0]]}`,
		"boolean cell":           `{"a":[[true]],"b":[[0]],"product":[[0]]}`,
		"c and product":          `{"a":[[1]],"b":[[0]],"c":[[0]],"product":[[0]]}`,
		"c and rounds":           `{"a":[[1]],"b":[[0]],"c":[[0]],"rounds":1}`,
		"zero rounds":            `{"a":[[1]],"b":[[0]],"product":[[0]],"rounds":0}`,
		"too many rounds":        `{"a":[[1]],"b":[[0]],"product":[[0]],"rounds":16}`,
		"fractional rounds":      `{"a":[[1]],"b":[[0]],"product":[[0]],"rounds":1.5}`,
		"unknown field":          `{"a":[[1]],"b":[[0]],"product":[[0]],"extra":true}`,
		"incorrect field casing": `{"A":[[1]],"b":[[0]],"product":[[0]]}`,
		"duplicate field":        `{"a":[[1]],"a":[[1]],"b":[[0]],"product":[[0]]}`,
		"trailing JSON":          `{"a":[[1]],"b":[[0]],"product":[[0]]}{}`,
		"oversized matrix": `{"a":[` + strings.Repeat(`[0],`, 100) + `[0]],` +
			`"b":[[0]],"product":[[0]]}`,
		"oversized row": `{"a":[[` + strings.Repeat(`0,`, 100) + `0]],` +
			`"b":[[0]],"product":[[0]]}`,
	}

	for _, route := range routes {
		t.Run(route, func(t *testing.T) {
			for _, tc := range validRequests {
				t.Run(tc.name, func(t *testing.T) {
					response := performJSONRequest(server, route, tc.body)
					if response.Code != http.StatusOK {
						t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
					}
					if got := response.Header().Get("Content-Type"); !strings.HasPrefix(got, "application/json") {
						t.Fatalf("Content-Type = %q", got)
					}
					var result map[string]json.RawMessage
					if err := json.Unmarshal(response.Body.Bytes(), &result); err != nil {
						t.Fatalf("invalid JSON response: %v", err)
					}
					if tc.legacy {
						for _, field := range []string{"vector", "left", "right", "equal"} {
							if _, ok := result[field]; !ok {
								t.Errorf("missing legacy response field %q", field)
							}
						}
						if _, ok := result["trials"]; ok {
							t.Error("legacy response unexpectedly contains trials")
						}
						if string(result["equal"]) != "true" {
							t.Errorf("equal = %s, want true", result["equal"])
						}
						return
					}
					if string(result["accepted"]) != "true" || string(result["algorithm"]) != `"freivalds"` {
						t.Errorf("unexpected verification result: %s", response.Body.String())
					}
					var trials []json.RawMessage
					if err := json.Unmarshal(result["trials"], &trials); err != nil {
						t.Fatalf("invalid trials: %v", err)
					}
					if len(trials) != tc.trials {
						t.Errorf("trials = %d, want %d", len(trials), tc.trials)
					}
				})
			}

			for _, name := range slices.Sorted(maps.Keys(invalidRequests)) {
				body := invalidRequests[name]
				t.Run(name, func(t *testing.T) {
					response := performJSONRequest(server, route, body)
					if response.Code != http.StatusBadRequest {
						t.Fatalf("invalid request returned status %d: %s", response.Code, response.Body.String())
					}
					var apiError struct {
						Status int    `json:"status"`
						Error  string `json:"error"`
					}
					if err := json.Unmarshal(response.Body.Bytes(), &apiError); err != nil {
						t.Fatalf("invalid JSON error response: %v", err)
					}
					if apiError.Status != http.StatusBadRequest || apiError.Error == "" {
						t.Errorf("invalid error response: %+v", apiError)
					}
				})
			}
		})
	}
}

func performJSONRequest(server *Server, route, body string) *httptest.ResponseRecorder {
	request := httptest.NewRequest(http.MethodPost, route, strings.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	server.Handler().ServeHTTP(response, request)
	return response
}
