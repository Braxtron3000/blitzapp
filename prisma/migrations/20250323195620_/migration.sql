/*
  Warnings:

  - The primary key for the `SingleSet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `SingleSet` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SingleSet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workoutExerciseId" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "restTime" INTEGER NOT NULL,
    CONSTRAINT "SingleSet_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "Routine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SingleSet" ("reps", "restTime", "weight", "workoutExerciseId") SELECT "reps", "restTime", "weight", "workoutExerciseId" FROM "SingleSet";
DROP TABLE "SingleSet";
ALTER TABLE "new_SingleSet" RENAME TO "SingleSet";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
