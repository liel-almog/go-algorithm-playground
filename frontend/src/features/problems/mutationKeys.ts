export const problemMutationKeys = {
  all: ['problems'] as const,
  problem: (problemId: string) =>
    [...problemMutationKeys.all, problemId] as const,
  generate: (problemId: string) =>
    [...problemMutationKeys.problem(problemId), 'generate'] as const,
  solve: (problemId: string) =>
    [...problemMutationKeys.problem(problemId), 'solve'] as const,
}
