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

const WorkoutInfoId = (props: {
  mode: "read" | "start" | "create";
  id?: number;
  canEdit?: boolean;
  workout?: workoutProp;
}) => {
  // !leave this in for now.
  // const something = api.workout.onWorkoutAdd.useSubscription(undefined, {
  //   onData: (event) => {
  //     setWorkoutsState((prev) => [...prev, event.data]);
  //   },
  // });

  const [title, setTitle] = useState(props.workout ? props.workout.title : "");
  const [description, setDescription] = useState(
    props.workout ? props.workout.description : "",
  );

  type workoutNotNull = workoutProp;
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
      console.log("successful workout creation");
      setTitle("");
      setDescription("");
    },
    onError: async (e) => {
      console.error("error creating workout", e);
    },
  });

  const createWorkout = (
    overrideParams?: Partial<Parameters<typeof submitWorkouts.mutate>[0]>,
  ) =>
    submitWorkouts.mutate({
      title,
      description: description ?? "yamaa",
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
      ...overrideParams,
    });

  const deleteWorkout = api.workout.deleteWorkout.useMutation({
    onSuccess: async () => {
      console.log("successfully deleted workout");
      router.replace("/");
    },
    onError: async (e) => {
      console.error("error deleting workout, ", e);
    },
  });

  const [routine, setRoutine] = useState<editingRoutineType>(
    props.workout ? props.workout.routine : [],
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
        {props.mode == "read" && props.canEdit && props.id && (
          <div className="flex flex-row gap-2">
            <button className="rounded-full bg-purple-500 p-1">Start</button>
            <button
              onClick={() => {
                createWorkout({ title: "Copy -" + title });
                router.replace("/");
              }}
              className="rounded-full bg-purple-500 p-1"
            >
              Copy
            </button>
            <button className="rounded-full bg-purple-500 p-1">Edit</button>
            <button
              onClick={() => {
                if (!props.id) {
                  console.error("theres no props id");
                  return;
                }

                deleteWorkout.mutate({ id: props.id });
              }}
              className="rounded-full bg-purple-500 p-1"
            >
              Delete
            </button>
          </div>
        )}
      </header>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <form
          onSubmit={(e) => {
            if (!title) {
              console.error("title is ", title);
              return;
            }

            e.preventDefault();
            createWorkout();

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
                onDeleteSet={() => {}}
                onUpdateSet={(exercise) => updateExercise(i, exercise)}
                mode={props.mode}
                onRemoveExercise={() => {}}
              />
            ))}
          </div>
          {props.mode !== "read" && (
            <button
              className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20 disabled:text-gray-500"
              type="submit"
              disabled={
                submitWorkouts.isPending ||
                !title ||
                props.mode != "create" ||
                routine.length == 0 ||
                !routine.every(
                  (exercise) => exercise.sets && exercise.sets?.length > 0,
                  /*  &&
                    exercise.sets.every(
                      ({ reps, restTime, weight }) =>
                        Number(reps) > 0 &&
                        Number(restTime) > 0 &&
                        Number(weight) > 0,
                    ), */
                )
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
