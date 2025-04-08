"use client";

import { useState } from "react";
import { RecursivePartial } from "~/constants/types";

type exerciseProps = RecursivePartial<
  {
    musclesTargeted: {
      name: string;
    }[];
    sets: {
      id: number;
      weight: number;
      reps: number;
      restTime: number;
      workoutExerciseId: number;
    }[];
  } & {
    id: number;
    exerciseName: string;
    workoutId: number;
    workoutLogId: number | null;
  }
>;

type exerciseCardProps = {
  onDelete: () => void;
  onUpdate: (exercise: exerciseProps) => void;
};

const ExerciseCard = (props: exerciseProps & exerciseCardProps) => {
  const [editMode, setEditMode] = useState(false);

  const addSet = () => {};

  return (
    <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4">
      {editMode ? (
        <input className="text-black" type="text" placeholder="Exercise Name" />
      ) : (
        <h1>{props.exerciseName}</h1>
      )}
      <p>{JSON.stringify(props)}</p>
      <button
        onClick={() => setEditMode(!editMode)}
        className={`${editMode ? "bg-yellow-500" : "bg-yellow-600"}`}
      >
        edit
      </button>

      {editMode && (
        <div className="flex flex-row justify-between">
          <button
            className="rounded-full bg-red-600 px-10 py-3 hover:bg-red-500"
            type="button"
            onClick={props.onDelete}
          >
            Delete
          </button>
          <button
            className="rounded-full bg-green-600 px-10 py-3 hover:bg-green-500"
            type="button"
            onClick={() => {
              const lastSet = props.sets?.at(-1);
              console.log("adding sets");
              props.onUpdate({
                ...props,
                sets: props.sets?.concat({
                  reps: lastSet?.reps,
                  restTime: lastSet?.restTime,
                  weight: lastSet?.weight,
                }) ?? [
                  {
                    reps: lastSet?.reps,
                    restTime: lastSet?.restTime,
                    weight: lastSet?.weight,
                  },
                ],
              });
            }}
          >
            Add
          </button>
        </div>
      )}
      {props.sets?.map((set, i) => (
        <div className="flex flex-row justify-evenly gap-1">
          <input
            placeholder="reps"
            type="number"
            className="w-1 flex-1"
            onChange={({ target: { value } }) => {
              props.onUpdate({
                ...props,
                sets: props.sets
                  ?.slice(0, i)
                  .concat(
                    { ...props.sets.at(i), reps: Number(value) },
                    props.sets.slice(i + 1),
                  ),
              });
            }}
            value={set.reps}
          />
          <input
            placeholder="weight"
            type="number"
            className="w-1 flex-1"
            value={set.weight}
            onChange={({ target: { value } }) => {
              props.onUpdate({
                ...props,
                sets: props.sets
                  ?.slice(0, i)
                  .concat(
                    { ...props.sets.at(i), weight: Number(value) },
                    props.sets.slice(i + 1),
                  ),
              });
            }}
          />
          <input
            placeholder="restTime"
            type="number"
            className="w-1 flex-1"
            value={set.restTime}
            onChange={({ target: { value } }) => {
              props.onUpdate({
                ...props,
                sets: props.sets
                  ?.slice(0, i)
                  .concat(
                    { ...props.sets.at(i), restTime: Number(value) },
                    props.sets.slice(i + 1),
                  ),
              });
            }}
          />
          <button
            onClick={() => {
              props.onUpdate({
                ...props,
                sets: props.sets?.slice(0, i).concat(props.sets.slice(i + 1)),
              });
            }}
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
};

export default ExerciseCard;
