"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { api as apiServer } from "~/trpc/server";
import NewExerciseModal from "./NewExerciseModal";
import ExerciseCard from "./ExerciseCard";
import { RecursivePartial } from "~/constants/types";
import { set } from "zod";
import Link from "next/link";

type workoutProp = NonNullable<
  Awaited<ReturnType<typeof apiServer.workout.findWorkoutById>>
>;

const WorkoutInfoId = (
  props:
    | { mode: "create"; workout?: undefined }
    | {
        mode: "read" | "start";
        id: string;
        canEdit: boolean;
        workout: workoutProp;
      },
) => {
  // !leave this in for now.
  // const something = api.workout.onWorkoutAdd.useSubscription(undefined, {
  //   onData: (event) => {
  //     setWorkoutsState((prev) => [...prev, event.data]);
  //   },
  // });

  const [title, setTitle] = useState(props.workout?.title);
  const [description, setDescription] = useState(props.workout?.description);

  type workoutNotNull = NonNullable<typeof props.workout>;
  type editingRoutineType = RecursivePartial<
    workoutNotNull["routine"][number]
  >[];

  // const submitWorkouts = api.workout.seed.useMutation({
  //   onSuccess: async () => {
  //     console.log("successful workout creations");
  //     setTitle("");
  //     setDescription("");
  //   },
  //   onError: async (e) => {
  //     console.error("error creating workouts", e);
  //   },
  // });

  const router = useRouter();

  const submitWorkouts = api.workout.createWorkout.useMutation({
    onSuccess: async () => {
      console.log("successful workout creations");
      setTitle("");
      setDescription("");
    },
    onError: async (e) => {
      console.error("error creating workouts", e);
    },
  });

  const [routine, setRoutine] = useState<editingRoutineType>(
    props.workout?.routine ?? [],
  );

  const updateExercise = (
    index: number,
    exercise: (typeof routine)[number],
  ) => {
    let newRoutine = [...routine];
    newRoutine.splice(index, 1, exercise);
    console.log("new exercise ", exercise);
    setRoutine(newRoutine);
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <header className="just flex w-full flex-row justify-between bg-gray-600 py-3">
        <div>
          <Link href={"/"}>{"<- "}</Link>
          {props.mode}
        </div>
        <div className="flex flex-row gap-2">
          <button className="rounded-full bg-purple-500 p-1">Start</button>
          <button className="rounded-full bg-purple-500 p-1">Copy</button>
          {props.mode == "read" && props.canEdit && (
            <>
              <button className="rounded-full bg-purple-500 p-1">Edit</button>
              <button className="rounded-full bg-purple-500 p-1">Delete</button>
            </>
          )}
        </div>
      </header>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <form
          onSubmit={(e) => {
            if (!description) {
              console.error("description is ", description);
              return;
            }

            if (!title) {
              console.error("title is ", title);
              return;
            }

            e.preventDefault();

            submitWorkouts.mutate({
              title,
              description,
              routine: routine.map((exercise) => ({
                exerciseName: exercise.exerciseName ?? "",
                musclesTargeted:
                  exercise.musclesTargeted?.map(({ name }) => name ?? "") ?? [],
                sets:
                  exercise.sets?.map((set) => ({
                    weight: set.weight ?? 0,
                    reps: set.reps ?? 0,
                    restTime: set.restTime ?? 1,
                  })) ?? [],
              })),
            });

            router.push("/");
          }}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={props.mode === "read"}
              className="w-full rounded-full px-4 py-2 text-black"
            />

            <textarea
              placeholder="Description"
              maxLength={93}
              rows={3}
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              disabled={props.mode === "read"}
              className="h-[5rem] w-full resize-none overflow-hidden rounded-2xl px-4 py-2 text-black"
            />

            {routine.map((exercise, i) => (
              <ExerciseCard
                key={i.toString()}
                exerciseName={exercise.exerciseName}
                musclesTargeted={exercise.musclesTargeted}
                workoutId={exercise.workoutId}
                workoutLogId={exercise.workoutLogId}
                sets={exercise.sets}
                onDelete={() => {}}
                onUpdate={(exercise) => updateExercise(i, exercise)}
                editMode={props.mode != "read"}
              />
            ))}
          </div>
          {props.mode !== "read" && (
            <button
              className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20 disabled:text-gray-500"
              type="submit"
              disabled={
                submitWorkouts.isPending ||
                !description ||
                !title ||
                props.mode != "create" ||
                routine.length == 0
              }
            >
              {submitWorkouts.isPending ? "Submitting..." : "Submit"}
            </button>
          )}
        </form>
      </div>
      {props.mode != "read" && (
        <NewExerciseModal
          onAdd={({ muscles, title }) => {
            setRoutine([
              ...routine,
              { exerciseName: title, musclesTargeted: muscles },
            ]);
          }}
        />
      )}
    </main>
  );
};

export default WorkoutInfoId;
