package karger

// disjointSet tracks contracted vertices using path compression and union by rank.
// A successful union corresponds to exactly one graph contraction.
type disjointSet struct {
	parents []int
	ranks   []int
}

func newDisjointSet(size int) *disjointSet {
	sets := &disjointSet{parents: make([]int, size), ranks: make([]int, size)}
	for index := range sets.parents {
		sets.parents[index] = index
	}
	return sets
}

func (sets *disjointSet) find(vertex int) int {
	if sets.parents[vertex] != vertex {
		sets.parents[vertex] = sets.find(sets.parents[vertex])
	}
	return sets.parents[vertex]
}

func (sets *disjointSet) union(first, second int) bool {
	first, second = sets.find(first), sets.find(second)
	if first == second {
		return false
	}
	if sets.ranks[first] < sets.ranks[second] {
		first, second = second, first
	}
	sets.parents[second] = first
	if sets.ranks[first] == sets.ranks[second] {
		sets.ranks[first]++
	}
	return true
}
