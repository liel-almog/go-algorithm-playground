package services

const problemRoutePrefix = "/api/problems"

func problemPath(id string) string      { return problemRoutePrefix + "/" + id }
func generateEndpoint(id string) string { return problemPath(id) + "/generate" }
func solveEndpoint(id string) string    { return problemPath(id) + "/solve" }
func algorithmSolveEndpoint(id, algorithm string) string {
	return problemPath(id) + "/" + algorithm + "/solve"
}

type problemDescription struct {
	ID               string   `json:"id"`
	Title            string   `json:"title"`
	Algorithm        string   `json:"algorithm"`
	Description      string   `json:"description"`
	SolutionApproach string   `json:"solutionApproach"`
	GenerateEndpoint string   `json:"generateEndpoint"`
	SolveEndpoint    string   `json:"solveEndpoint"`
	Limits           []string `json:"limits"`
}

type problemsResponse struct {
	Problems []problemDescription `json:"problems"`
}

type algorithmOption struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Optimal     bool   `json:"optimal"`
	Category    string `json:"category"`
}

// algorithmTool is an algorithm that is exposed as a problem endpoint itself.
type algorithmTool struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Category string `json:"category"`
	Endpoint string `json:"endpoint"`
}

type algorithmCatalog struct {
	Algorithms []algorithmOption `json:"algorithms"`
	Tools      []algorithmTool   `json:"tools"`
}

type Catalog struct{ problems []catalogProblem }
type catalogProblem interface {
	describe() problemDescription
	algorithms() algorithmCatalog
}

func NewCatalog() *Catalog {
	return &Catalog{problems: []catalogProblem{eightPuzzleProblem{}, minimumCutProblem{}, matrixVerificationProblem{}, polynomialIdentityProblem{}}}
}

func (c *Catalog) ListProblems() problemsResponse {
	descriptions := make([]problemDescription, 0, len(c.problems))
	for _, p := range c.problems {
		description := p.describe()
		if description.GenerateEndpoint == "" {
			description.GenerateEndpoint = generateEndpoint(description.ID)
		}
		if description.SolveEndpoint == "" {
			description.SolveEndpoint = solveEndpoint(description.ID)
		}
		descriptions = append(descriptions, description)
	}
	return problemsResponse{Problems: descriptions}
}

func (c *Catalog) Algorithms() algorithmCatalog {
	result := algorithmCatalog{Algorithms: []algorithmOption{}, Tools: []algorithmTool{}}
	for _, p := range c.problems {
		offered := p.algorithms()
		result.Algorithms = append(result.Algorithms, offered.Algorithms...)
		result.Tools = append(result.Tools, offered.Tools...)
	}
	return result
}

func (c *Catalog) AlgorithmCount() int {
	result := c.Algorithms()
	return len(result.Algorithms) + len(result.Tools)
}
