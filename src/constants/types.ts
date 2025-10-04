export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P];
};

export const muscleGroups = [
  "chest",
  "neck",
  "shoulders",
  "traps",
  "lats",
  "abs",
  "quads",
  "hamstrings",
  "glutes",
  "biceps",
  "triceps",
  "wrists",
  "cardio",
  "back",
  "calves",
];
