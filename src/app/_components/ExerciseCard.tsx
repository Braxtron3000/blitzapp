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
      weight: number | null;
      reps: number | null;
      restTime: number | null;
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
  onDeleteSet: () => void;
  onUpdateSet: (exercise: exerciseProps) => void;
  onRemoveExercise: () => void;
  mode: "read" | "create" | "start";
};

const ExerciseCard = (props: exerciseProps & exerciseCardProps) => {
  const editable = props.mode != "read";

  return (
    <div className="flex w-full max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4">
      {editable && (
        <button className="h-7 w-7 rounded-full bg-red-500">x</button>
      )}
      <h1>{props.exerciseName}</h1>

      {editable && (
        <button
          className="rounded-full bg-green-600 hover:bg-green-500"
          type="button"
          onClick={() => {
            const lastSet = props.sets?.at(-1);
            console.log("adding sets");
            props.onUpdateSet({
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
      )}
      {props.sets?.map((set, i) => (
        <div key={i.toString()} className="flex flex-row justify-evenly gap-1">
          <input
            placeholder="reps"
            type="number"
            className="w-1 flex-1 text-black"
            disabled={props.mode === "read"}
            onChange={({ target: { value } }) => {
              props.onUpdateSet({
                ...props,
                sets: props.sets?.slice(0, i).concat(
                  {
                    ...props.sets.at(i),
                    reps: value ? Number(value) : undefined,
                  },
                  props.sets.slice(i + 1),
                ),
              });
            }}
            value={set.reps ?? ""}
          />
          <input
            placeholder="weight"
            type="number"
            className="w-1 flex-1 text-black"
            value={set.weight ?? ""}
            disabled={props.mode === "read"}
            onChange={({ target: { value } }) => {
              props.onUpdateSet({
                ...props,
                sets: props.sets
                  ?.slice(0, i)
                  .concat(
                    {
                      ...props.sets.at(i),
                      weight: value ? Number(value) : undefined,
                    },
                    props.sets.slice(i + 1),
                  ),
              });
            }}
          />
          <input
            placeholder="restTime"
            type="number"
            className="w-1 flex-1 text-black"
            value={set.restTime ?? ""}
            disabled={props.mode === "read"}
            onChange={({ target: { value } }) => {
              props.onUpdateSet({
                ...props,
                sets: props.sets
                  ?.slice(0, i)
                  .concat(
                    {
                      ...props.sets.at(i),
                      restTime: value ? Number(value) : undefined,
                    },
                    props.sets.slice(i + 1),
                  ),
              });
            }}
          />
          {props.mode === "start" && <input type="checkbox" />}
          {props.mode == "create" && (
            <button
              onClick={() => {
                props.onUpdateSet({
                  ...props,
                  sets: props.sets?.slice(0, i).concat(props.sets.slice(i + 1)),
                });
              }}
            >
              X
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExerciseCard;
