package server

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/liel-almog/go-algorithm-playground/internal/playground"
)

type Server struct {
	playground     *playground.Service
	allowedOrigins []string
	handler        http.Handler
	validator      *validator.Validate
	algorithmSlots chan struct{}
}

type boardRequest struct {
	Size  int   `json:"size" validate:"required,min=2,max=4"`
	Tiles []int `json:"tiles" validate:"required,min=4,max=16,dive,gte=0,lte=15"`
}
type solveRequest struct {
	boardRequest
	Algorithm string `json:"algorithm" validate:"required"`
}
type randomRequest struct {
	Size     int `json:"size" validate:"omitempty,min=2,max=4"`
	Scramble int `json:"scramble" validate:"omitempty,min=1,max=200"`
}
type compareRequest struct {
	boardRequest
	Algorithms []string `json:"algorithms" validate:"omitempty,max=4,dive,required"`
}
type experimentRequest struct {
	Size       int      `json:"size" validate:"omitempty,min=2,max=3"`
	Scramble   int      `json:"scramble" validate:"omitempty,min=1,max=100"`
	Runs       int      `json:"runs" validate:"omitempty,min=1,max=5"`
	Algorithms []string `json:"algorithms" validate:"omitempty,max=4,dive,required"`
}
type minCutRequest struct {
	Vertices []string `json:"vertices" validate:"required,min=2,max=50,dive,required,max=100"`
	Edges    []struct {
		From string `json:"from" validate:"required,max=100"`
		To   string `json:"to" validate:"required,max=100"`
	} `json:"edges" validate:"required,min=1,max=1000,dive"`
	Trials int `json:"trials" validate:"required,min=1,max=500"`
}

func New(service *playground.Service, allowedOrigins []string) *Server {
	if service == nil {
		service = playground.New(nil)
	}
	if len(allowedOrigins) == 0 {
		allowedOrigins = []string{"*"}
	}
	server := &Server{
		playground: service, allowedOrigins: allowedOrigins,
		validator: newValidator(), algorithmSlots: algorithmSlots(),
	}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /{$}", server.index)
	mux.HandleFunc("GET /api/health", server.health)
	mux.HandleFunc("GET /api/algorithms", server.algorithms)
	mux.HandleFunc("POST /api/puzzles/random", server.randomPuzzle)
	mux.HandleFunc("POST /api/solve", server.limitAlgorithm(server.solve))
	mux.HandleFunc("POST /api/compare", server.limitAlgorithm(server.compare))
	mux.HandleFunc("POST /api/experiments/random", server.limitAlgorithm(server.experiment))
	mux.HandleFunc("POST /api/graphs/min-cut", server.limitAlgorithm(server.minimumCut))
	server.registerProblemRoutes(mux)
	server.handler = server.recoverPanic(server.cors(server.logRequests(mux)))
	return server
}

func (s *Server) Handler() http.Handler { return s.handler }

func (s *Server) index(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("<!doctype html><title>Algorithm Playground</title><h1>Algorithm Playground API</h1>"))
}

func AllowedOriginsFromEnv() []string {
	value := strings.TrimSpace(os.Getenv("CORS_ALLOWED_ORIGINS"))
	if value == "" {
		return []string{"*"}
	}
	result := make([]string, 0)
	for _, part := range strings.Split(value, ",") {
		if origin := strings.TrimSpace(part); origin != "" {
			result = append(result, origin)
		}
	}
	return result
}

func (s *Server) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "goVersion": strings.TrimPrefix(runtimeVersion(), "go"), "algorithms": s.playground.AlgorithmCount()})
}

var runtimeVersion = runtime.Version

func (s *Server) algorithms(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"algorithms": s.playground.Algorithms(),
		"tools":      []map[string]any{{"id": "karger", "name": "Karger randomized minimum cut", "category": "graph", "endpoint": problemRoutePrefix + "/minimum-cut/solve"}},
	})
}

func (s *Server) minimumCut(w http.ResponseWriter, r *http.Request) {
	var request minCutRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	if len(request.Edges)*request.Trials > maxMinCutWork {
		writeError(w, http.StatusBadRequest, errors.New("edges multiplied by trials must not exceed 250000"))
		return
	}
	edges := make([]playground.Edge, len(request.Edges))
	for i, edge := range request.Edges {
		edges[i] = playground.Edge{From: edge.From, To: edge.To}
	}
	result, err := s.playground.MinimumCut(r.Context(), playground.MinCutRequest{Vertices: request.Vertices, Edges: edges, Trials: request.Trials})
	writeResult(w, result, err)
}

func (s *Server) randomPuzzle(w http.ResponseWriter, r *http.Request) {
	var request randomRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := s.playground.RandomPuzzle(playground.RandomPuzzleRequest{Rows: request.Size, Columns: request.Size, Scramble: request.Scramble})
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (s *Server) solve(w http.ResponseWriter, r *http.Request) {
	var request solveRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := s.playground.Solve(r.Context(), playground.SolveRequest{
		BoardRequest: playground.BoardRequest{Rows: request.Size, Columns: request.Size, Tiles: request.Tiles}, Algorithm: request.Algorithm,
	})
	if err != nil {
		switch {
		case playground.IsSolverTimeout(err):
			writeSolverError(w, err)
		case errors.Is(err, playground.ErrUnsolvable):
			writeError(w, http.StatusUnprocessableEntity, err)
		case errors.Is(err, playground.ErrAlgorithmNotFound):
			writeError(w, http.StatusNotFound, err)
		default:
			writeError(w, http.StatusUnprocessableEntity, err)
		}
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (s *Server) compare(w http.ResponseWriter, r *http.Request) {
	var request compareRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := s.playground.Compare(r.Context(), playground.CompareRequest{
		BoardRequest: playground.BoardRequest{Rows: request.Size, Columns: request.Size, Tiles: request.Tiles}, Algorithms: request.Algorithms,
	})
	if err != nil {
		if playground.IsSolverTimeout(err) {
			writeSolverError(w, err)
		} else if strings.Contains(err.Error(), "not solvable") {
			writeError(w, http.StatusUnprocessableEntity, err)
		} else {
			writeError(w, http.StatusBadRequest, err)
		}
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (s *Server) experiment(w http.ResponseWriter, r *http.Request) {
	var request experimentRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := s.playground.Experiment(r.Context(), playground.ExperimentRequest{
		Size: request.Size, Scramble: request.Scramble, Runs: request.Runs, Algorithms: request.Algorithms,
	})
	if err != nil {
		if playground.IsSolverTimeout(err) {
			writeSolverError(w, err)
		} else {
			writeError(w, http.StatusBadRequest, err)
		}
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func decode(w http.ResponseWriter, r *http.Request, destination any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBytes)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		writeError(w, http.StatusBadRequest, fmt.Errorf("invalid JSON: %w", err))
		return false
	}
	if decoder.Decode(&struct{}{}) != io.EOF {
		writeError(w, http.StatusBadRequest, errors.New("invalid JSON: request body must contain exactly one JSON object"))
		return false
	}
	return true
}

func writeSolverError(w http.ResponseWriter, err error) {
	status := http.StatusUnprocessableEntity
	if playground.IsSolverTimeout(err) {
		status = http.StatusRequestTimeout
	}
	writeError(w, status, err)
}
func writeError(w http.ResponseWriter, status int, err error) {
	writeJSON(w, status, map[string]any{"error": publicError(err), "status": status})
}
func publicError(err error) string {
	if errors.Is(err, context.DeadlineExceeded) {
		return "the algorithm exceeded its 5 second time limit"
	}
	return err.Error()
}
func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func (s *Server) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" && s.originAllowed(origin) {
			if len(s.allowedOrigins) == 1 && s.allowedOrigins[0] == "*" {
				w.Header().Set("Access-Control-Allow-Origin", "*")
			} else {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Add("Vary", "Origin")
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Max-Age", "86400")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
func (s *Server) originAllowed(origin string) bool {
	for _, allowed := range s.allowedOrigins {
		if allowed == "*" || allowed == origin {
			return true
		}
	}
	return false
}
func (s *Server) logRequests(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		if strings.HasPrefix(r.URL.Path, "/api/") {
			slog.Info("request", "method", r.Method, "path", r.URL.Path, "duration", time.Since(start))
		}
	})
}
func (s *Server) recoverPanic(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				slog.Error("request panic", "error", recovered)
				writeError(w, http.StatusInternalServerError, errors.New("internal server error"))
			}
		}()
		next.ServeHTTP(w, r)
	})
}
func ParsePort() string {
	port := strings.TrimSpace(os.Getenv("PORT"))
	if port == "" {
		return "8080"
	}
	if value, err := strconv.Atoi(port); err != nil || value < 1 || value > 65535 {
		return "8080"
	}
	return port
}
