package server

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/liel-almog/go-algorithm-playground/internal/playground"
	"github.com/liel-almog/go-algorithm-playground/internal/solver"
)

func TestAPIAndCORS(t *testing.T) {
	server := New(playground.New(solver.DefaultRegistry()), []string{"http://localhost:3000"})

	request := httptest.NewRequest(http.MethodGet, "/api/algorithms", nil)
	request.Header.Set("Origin", "http://localhost:3000")
	response := httptest.NewRecorder()
	server.Handler().ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d", response.Code)
	}
	if got := response.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:3000" {
		t.Fatalf("CORS origin = %q", got)
	}

	var body struct {
		Algorithms []solver.Metadata `json:"algorithms"`
	}
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if len(body.Algorithms) != 4 {
		t.Fatalf("algorithm count = %d, want 4", len(body.Algorithms))
	}
}

func TestMinimumCut(t *testing.T) {
	server := New(playground.New(nil), nil)
	body := `{"vertices":["A","B","C"],"edges":[{"from":"A","to":"B"},{"from":"B","to":"C"},{"from":"C","to":"A"}],"trials":20}`
	response := performJSON(server, "/api/graphs/min-cut", body)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d: %s", response.Code, response.Body.String())
	}
	var result struct {
		CutSize int `json:"cutSize"`
	}
	if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
		t.Fatal(err)
	}
	if result.CutSize != 2 {
		t.Fatalf("cut size = %d, want 2", result.CutSize)
	}
}

func TestSolveAndCompare(t *testing.T) {
	server := New(playground.New(solver.DefaultRegistry()), nil)
	solveBody := `{"algorithm":"astar","size":3,"tiles":[1,2,3,4,5,6,0,7,8]}`
	response := performJSON(server, "/api/solve", solveBody)
	if response.Code != http.StatusOK {
		t.Fatalf("solve status = %d: %s", response.Code, response.Body.String())
	}
	var result solver.Result
	if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
		t.Fatal(err)
	}
	if result.MoveCount != 2 {
		t.Fatalf("move count = %d, want 2", result.MoveCount)
	}

	compareBody := `{"algorithms":["astar","bfs","greedy"],"size":3,"tiles":[1,2,3,4,5,6,0,7,8]}`
	response = performJSON(server, "/api/compare", compareBody)
	if response.Code != http.StatusOK {
		t.Fatalf("compare status = %d: %s", response.Code, response.Body.String())
	}
	var compared playground.Comparison
	if err := json.NewDecoder(response.Body).Decode(&compared); err != nil {
		t.Fatal(err)
	}
	if len(compared.Results) != 3 || compared.Winner == "" {
		t.Fatalf("unexpected comparison: %+v", compared)
	}
}

func TestStaticAppIsServed(t *testing.T) {
	server := New(playground.New(nil), nil)
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

func performJSON(server *Server, path, body string) *httptest.ResponseRecorder {
	request := httptest.NewRequest(http.MethodPost, path, strings.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	server.Handler().ServeHTTP(response, request)
	return response
}
