/*
  Warnings:

  - The primary key for the `SingleSet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `routineId` on the `SingleSet` table. All the data in the column will be lost.
  - Added the required column `workoutExerciseId` to the `SingleSet` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SingleSet" (
    "workoutExerciseId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weight" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "restTime" INTEGER NOT NULL,
    CONSTRAINT "SingleSet_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "Routine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SingleSet" ("reps", "restTime", "weight") SELECT "reps", "restTime", "weight" FROM "SingleSet";
DROP TABLE "SingleSet";
ALTER TABLE "new_SingleSet" RENAME TO "SingleSet";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
