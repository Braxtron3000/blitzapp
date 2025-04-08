-- CreateTable
CREATE TABLE "Workout" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "authorId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "routineId" INTEGER NOT NULL,
    CONSTRAINT "Workout_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Workout_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Routine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "exerciseName" TEXT NOT NULL,
    "workoutId" INTEGER NOT NULL,
    "workoutLogId" INTEGER,
    CONSTRAINT "Routine_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Routine_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MuscleGroups" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "SingleSet" (
    "routineId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weight" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "restTime" INTEGER NOT NULL,
    CONSTRAINT "SingleSet_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workoutId" INTEGER NOT NULL,
    CONSTRAINT "WorkoutLog_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_MuscleGroupsToWorkoutExercise" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_MuscleGroupsToWorkoutExercise_A_fkey" FOREIGN KEY ("A") REFERENCES "MuscleGroups" ("name") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MuscleGroupsToWorkoutExercise_B_fkey" FOREIGN KEY ("B") REFERENCES "Routine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MuscleGroups_name_key" ON "MuscleGroups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_MuscleGroupsToWorkoutExercise_AB_unique" ON "_MuscleGroupsToWorkoutExercise"("A", "B");

-- CreateIndex
CREATE INDEX "_MuscleGroupsToWorkoutExercise_B_index" ON "_MuscleGroupsToWorkoutExercise"("B");
