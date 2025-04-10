-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SingleSet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workoutExerciseId" INTEGER NOT NULL,
    "weight" INTEGER,
    "reps" INTEGER,
    "restTime" INTEGER,
    CONSTRAINT "SingleSet_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "Routine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SingleSet" ("id", "reps", "restTime", "weight", "workoutExerciseId") SELECT "id", "reps", "restTime", "weight", "workoutExerciseId" FROM "SingleSet";
DROP TABLE "SingleSet";
ALTER TABLE "new_SingleSet" RENAME TO "SingleSet";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
