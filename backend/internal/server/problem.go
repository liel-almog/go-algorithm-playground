package server

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

const problemRoutePrefix = "/api/problems"

// problem is the contract every algorithmic problem fulfils to appear in the
// API. The server core only knows this interface, so adding a problem means
// writing one file that implements it and listing it in defaultProblems.
type problem interface {
	// describe returns the problem's entry for GET /api/problems. Endpoints are
	// derived from the ID by the server and must be left empty.
	describe() problemDescription
	// algorithms lists the selectable algorithms and tools the problem offers
	// for GET /api/algorithms.
	algorithms() algorithmCatalog
	// register adds the problem's routes below its own /api/problems/{id} prefix.
	register(routes problemRoutes)
}

// problemRoutes registers the routes of a single problem under its prefix.
type problemRoutes struct {
	server *Server
	echo   *echo.Echo
	prefix string
}

func (r problemRoutes) generate(handler echo.HandlerFunc) {
	r.server.registerAPI(r.echo, http.MethodPost, r.prefix+"/generate", handler)
}

// solve registers a CPU-heavy route, bounded by the shared algorithm limiter.
func (r problemRoutes) solve(handler echo.HandlerFunc) {
	r.server.registerAPI(r.echo, http.MethodPost, r.prefix+"/solve", handler, r.server.limitAlgorithm)
}

func problemPath(id string) string      { return problemRoutePrefix + "/" + id }
func generateEndpoint(id string) string { return problemPath(id) + "/generate" }
func solveEndpoint(id string) string    { return problemPath(id) + "/solve" }

// defaultProblems is the single place that lists the problems the API serves.
func defaultProblems() []problem {
	return []problem{
		eightPuzzleProblem{},
		minimumCutProblem{},
		matrixVerificationProblem{},
		polynomialIdentityProblem{},
	}
}
