"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { type api as apiServer } from "~/trpc/server";
import NewExerciseModal from "./NewExerciseModal";
import ExerciseCard from "./ExerciseCard";
import { type RecursivePartial } from "~/constants/types";
import RestTimer from "./RestTimer";

type workoutProp = NonNullable<
  Awaited<ReturnType<typeof apiServer.workout.findWorkoutById>>
>;

const WorkoutInfoId = (props: {
  mode: "read" | "start" | "create";
  id?: number;
  canEdit?: boolean;
  workout?: workoutProp;
}) => {
  const [stateMode, setStateMode] = useState<typeof props.mode>(props.mode);
  const [title, setTitle] = useState(props.workout ? props.workout.title : "");
  const [description, setDescription] = useState(
    props.workout ? props.workout.description : "",
  );

  useEffect(() => {
    if (props.mode === "start") {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications.");
        return;
      }

      Notification.requestPermission()
        .then((permission) => {
          if (permission === "granted") {
            new Notification("Hello! This is a test notification.");
          }
        })
        .catch((error) => {
          console.error("Error requesting notification permission:", error);
        });
    }
  }, []);

  const [showConfirmEditModal, setShowConfirmEditModal] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<{
    seconds: number;
    setIndex: number;
    exerciseIndex: number;
  }>();

  type workoutNotNull = workoutProp;
  type editingRoutineType = RecursivePartial<
    workoutNotNull["routine"][number]
  >[];

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

  const createWorkout = async (
    overrideParams?: Partial<Parameters<typeof submitWorkouts.mutate>[0]>,
  ) =>
    submitWorkouts.mutate({
      title,
      description: description,
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
    const newRoutine = [...routine];
    newRoutine.splice(index, 1, exercise);
    console.log("new exercise ", exercise);
    setRoutine(newRoutine);
  };

  const removeExercise = (index: number) => {
    const newRoutine = [...routine];
    newRoutine.splice(index);
    setRoutine(newRoutine);
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2290F7] to-[#0d3b66] text-white">
      <header
        className={`just z-50 flex h-20 w-full flex-row flex-wrap items-center justify-center justify-between bg-[#0d3b66]`}
      >
        <div className="flex items-center justify-center">
          <button
            onClick={() => router.replace("/")}
            className="h-16 w-16 items-center justify-center rounded-full"
          >
            {"<-"}
          </button>
        </div>
        <div className="flex h-full flex-grow items-center justify-center">
          <h1 className="whitespace-nowrap text-4xl font-bold">{title}</h1>
        </div>
        {stateMode == "read" && props.canEdit && props.id && (
          <div className="flex grow flex-row justify-evenly">
            <button
              onClick={() => setStateMode("start")}
              className="flex items-center justify-center rounded-xl bg-[#f4d35e] p-4 text-center text-[#2290F7]"
            >
              Start
            </button>
            <button
              onClick={async () => {
                await createWorkout({ title: "Copy -" + title });
                router.replace("/");
              }}
              className="flex items-center justify-center rounded-xl bg-[#f4d35e] p-4 text-[#2290F7]"
            >
              Copy
            </button>
            <button
              onClick={() => setStateMode("create")}
              className="flex items-center justify-center rounded-xl bg-[#f4d35e] p-4 text-[#2290F7]"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (!props.id) {
                  console.error("theres no props id");
                  return;
                }

                deleteWorkout.mutate({ id: props.id });
              }}
              className="flex items-center justify-center rounded-xl bg-[#f4d35e] p-4 text-[#2290F7]"
            >
              Delete
            </button>
          </div>
        )}
        {stateMode == "start" && (
          <RestTimer
            seconds={timerSeconds}
            notify={() => new Notification("get back to your workout")}
          />
        )}
      </header>
      <div className="container flex w-full max-w-xs flex-col gap-2 py-16">
        <form
          onSubmit={async (e) => {
            if (!title) {
              console.error("Title is undefined ", title);
              return;
            }

            e.preventDefault();

            if (props.mode === "read" && stateMode === "create")
              setShowConfirmEditModal(true);
            else if (props.mode == "read" && stateMode === "start") {
              console.log("log workouts. if i can.");
              router.push("/");
            } else {
              await createWorkout();
              router.push("/");
            }
          }}
          className="flex h-full w-full flex-col gap-2"
        >
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={stateMode !== "create"}
              className="w-full rounded-full px-4 py-2 text-black"
            />

            <textarea
              placeholder="Description"
              maxLength={93}
              rows={3}
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              disabled={stateMode !== "create"}
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
                onUpdateSet={(exercise) => updateExercise(i, exercise)}
                mode={stateMode}
                onRemoveExercise={() => removeExercise(i)}
                onCheckBox={({ minutes, index: setIndex }) =>
                  setTimerSeconds({
                    seconds: minutes * 60,
                    exerciseIndex: i,
                    setIndex,
                  })
                }
              />
            ))}
          </div>
          {stateMode !== "read" && (
            <button
              className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20 disabled:text-gray-500"
              type="submit"
              disabled={
                submitWorkouts.isPending ||
                !title ||
                routine.length == 0 ||
                !routine.every(
                  (exercise) => exercise.sets && exercise.sets?.length > 0,
                )
              }
            >
              {submitWorkouts.isPending ? "Submitting..." : "Submit"}
            </button>
          )}
          <div className="h-80" />
        </form>
      </div>
      {showConfirmEditModal && (
        <div className="absolute z-50 flex h-full w-full items-center justify-center bg-slate-400 bg-opacity-80">
          <div className="rounded-lg bg-slate-400 p-4">
            <h1>Are you sure?</h1>
            <p>editing this workout will delete all previous workout logs</p>
            <div className="flex flex-row justify-evenly py-4">
              <button onClick={() => setShowConfirmEditModal(false)}>No</button>
              <button
                onClick={async () => {
                  if (!props.id) {
                    console.error("theres no props id");
                    return;
                  }
                  await deleteWorkout.mutateAsync({ id: props.id });
                  await createWorkout();
                  router.replace("/");
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      {stateMode != "read" && (
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
