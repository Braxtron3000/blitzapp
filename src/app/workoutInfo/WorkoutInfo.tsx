"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { api as apiServer } from "~/trpc/server";
import NewExerciseModal from "../_components/NewExerciseModal";
import ExerciseCard from "../_components/ExerciseCard";
import { RecursivePartial } from "~/constants/types";

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
  const [editMode, setEditMode] = useState(props.mode == "create");

  // !leave this in for now.
  // const something = api.workout.onWorkoutAdd.useSubscription(undefined, {
  //   onData: (event) => {
  //     setWorkoutsState((prev) => [...prev, event.data]);
  //   },
  // });

  const [title, setTitle] = useState(props.workout?.title);
  const [description, setDescription] = useState(props.workout?.description);

  type workoutNotNull = NonNullable<typeof props.workout>;
  type routineType = RecursivePartial<workoutNotNull["routine"][number]>[];

  const [routine, setRoutine] = useState<routineType>(
    props.workout?.routine ?? [],
  );
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

  const updateExercise = (
    index: number,
    exercise: (typeof routine)[number],
  ) => {
    // const newRoutine = routine.slice(undefined,index).concat([exercise,...routine.splice()])
    let newRoutine = [...routine];
    newRoutine.splice(index, 1, exercise);
    console.log("new exercise ", exercise);
    setRoutine(newRoutine);
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
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
              description,
              routine: [
                { exerciseName: "bench", musclesTargeted: [], sets: [] },
              ],
              title,
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
              className="w-full rounded-full px-4 py-2 text-black"
            />

            <textarea
              placeholder="Description"
              maxLength={93}
              rows={3}
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              className="h-[5rem] w-full resize-none overflow-hidden rounded-2xl px-4 py-2 text-black"
            />
            <button
              className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20 disabled:text-gray-500"
              type="submit"
              disabled={
                submitWorkouts.isPending || !description || !title || !editMode
              }
            >
              {submitWorkouts.isPending ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
        {props.mode != "read" && (
          <button
            type="button"
            onClick={() => {}}
            className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-red-600"
          >
            +
          </button>
        )}
      </div>

      {routine.map((exercise, i) => (
        <ExerciseCard
          {...exercise}
          key={i + ""}
          onDelete={() => {}}
          onUpdate={(exercise) => updateExercise(i, exercise)}
        />
      ))}

      <NewExerciseModal
        onAdd={
          ({ muscles, title }) => {
            setRoutine([
              ...routine,
              { exerciseName: title, musclesTargeted: muscles },
            ]);
          }
          // setRoutine([...routine, { exerciseName: title, }])
        }
      />
    </main>
  );
};

export default WorkoutInfoId;
