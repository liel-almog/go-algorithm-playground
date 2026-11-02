export type ProblemFamily = 'Search' | 'Graph' | 'Verification'
export type ProblemArtKind = 'puzzle' | 'graph' | 'matrix' | 'polynomial'
export type ProblemPath =
  | '/problems/eight-puzzle'
  | '/problems/minimum-cut'
  | '/problems/matrix-verification'
  | '/problems/polynomial-identity'

export interface Problem {
  number: string
  title: string
  method: string
  type: string
  family: ProblemFamily
  description: string
  keywords: string
  art: ProblemArtKind
  tone: number
  to: ProblemPath
}

export const problems: Problem[] = [
  {
    number: '01',
    title: 'The 8-puzzle',
    method: 'A* search',
    type: 'Deterministic',
    family: 'Search',
    description:
      'Search a state space and slide eight tiles into order with an optimal path.',
    keywords: 'astar heuristic sliding tiles state space shortest path',
    art: 'puzzle',
    tone: 0,
    to: '/problems/eight-puzzle',
  },
  {
    number: '02',
    title: 'Minimum cut',
    method: "Karger's algorithm",
    type: 'Randomized',
    family: 'Graph',
    description:
      'Find the fewest edges that separate a graph into two disconnected groups.',
    keywords: 'karger graph cut edges contraction partition randomized',
    art: 'graph',
    tone: 1,
    to: '/problems/minimum-cut',
  },
  {
    number: '03',
    title: 'Matrix multiplication',
    method: "Freivalds' algorithm",
    type: 'Monte Carlo',
    family: 'Verification',
    description:
      'Verify A × B = C in quadratic time without multiplying every entry again.',
    keywords: 'freivalds matrix product multiplication randomized equality',
    art: 'matrix',
    tone: 2,
    to: '/problems/matrix-verification',
  },
  {
    number: '04',
    title: 'Polynomial identities',
    method: 'Schwartz–Zippel',
    type: 'Probabilistic',
    family: 'Verification',
    description:
      'Test whether two polynomials are identical by evaluating random field points.',
    keywords: 'schwartz zippel polynomial identity finite field evaluation',
    art: 'polynomial',
    tone: 3,
    to: '/problems/polynomial-identity',
  },
]

export const families = ['All', 'Search', 'Graph', 'Verification'] as const

export type ProblemFamilyFilter = (typeof families)[number]
