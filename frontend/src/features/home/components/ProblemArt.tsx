import type { ProblemArtKind } from './problemCatalogData'
import { GraphArt } from './art/GraphArt'
import { MatrixArt } from './art/MatrixArt'
import { PolynomialArt } from './art/PolynomialArt'
import { PuzzleArt } from './art/PuzzleArt'

interface ProblemArtProps {
  kind: ProblemArtKind
}

export function ProblemArt({ kind }: ProblemArtProps) {
  switch (kind) {
    case 'puzzle':
      return <PuzzleArt />
    case 'graph':
      return <GraphArt />
    case 'matrix':
      return <MatrixArt />
    case 'polynomial':
      return <PolynomialArt />
  }
}
