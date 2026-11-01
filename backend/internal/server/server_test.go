package server

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHealthAndCORS(t *testing.T) {
	server := New(nil, []string{"http://localhost:3000"})

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
	server := New(nil, nil)
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
	server := New(nil, nil)
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
