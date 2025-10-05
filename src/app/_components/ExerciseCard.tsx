"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import { RecursivePartial } from "~/constants/types";

type exerciseProps = RecursivePartial<
  {
    musclesTargeted: { name: string }[];
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
    supersetGroup?: string;
  }
>;

type exerciseCardProps = {
  onUpdateSet: (exercise: exerciseProps) => void;
  onRemoveExercise: () => void;
  mode: "read" | "create" | "start";
  onCheckBox: (param: { minutes: number; index: number }) => void;
};

const ExerciseCard = (props: exerciseProps & exerciseCardProps) => {
  const editable = props.mode !== "read";
  const [checkedSetIndexes, setCheckedSetIndexes] = useState<number[]>([]);

  const toggleCheckbox = (index: number) => {
    if (checkedSetIndexes.includes(index)) {
      setCheckedSetIndexes(checkedSetIndexes.filter((i) => i !== index));
    } else {
      setCheckedSetIndexes([...checkedSetIndexes, index]);
      props.onCheckBox({
        minutes: props.sets?.at(index)?.restTime ?? 1,
        index,
      });
    }
  };

  return (
    <Card
      sx={{
        margin: "auto",
        boxShadow: 3,
      }}
    >
      <CardHeader
        title={props.exerciseName}
        action={
          editable &&
          props.mode !== "start" && (
            <IconButton onClick={props.onRemoveExercise} color="error">
              <DeleteIcon />
            </IconButton>
          )
        }
      />
      <CardContent>
        {props.musclesTargeted && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {props.musclesTargeted.map((m) => m.name).join(", ")}
          </Typography>
        )}

        {props.sets?.map((set, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              marginBottom: 8,
            }}
          >
            <TextField
              label="Reps"
              type="number"
              size="small"
              variant="outlined"
              value={set.reps ?? ""}
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
              // sx={{ width: 80 }}
            />
            <TextField
              label="Weight"
              type="number"
              size="small"
              variant="outlined"
              value={set.weight ?? ""}
              disabled={props.mode === "read"}
              onChange={({ target: { value } }) => {
                props.onUpdateSet({
                  ...props,
                  sets: props.sets?.slice(0, i).concat(
                    {
                      ...props.sets.at(i),
                      weight: value ? Number(value) : undefined,
                    },
                    props.sets.slice(i + 1),
                  ),
                });
              }}
              // sx={{ width: 80 }}
            />
            <TextField
              label="Rest"
              type="number"
              size="small"
              variant="outlined"
              value={set.restTime ?? ""}
              disabled={props.mode === "read"}
              onChange={({ target: { value } }) => {
                props.onUpdateSet({
                  ...props,
                  sets: props.sets?.slice(0, i).concat(
                    {
                      ...props.sets.at(i),
                      restTime: value ? Number(value) : undefined,
                    },
                    props.sets.slice(i + 1),
                  ),
                });
              }}
              // sx={{ width: 80 }}
            />
            {props.mode === "start" && (
              <Checkbox
                checked={checkedSetIndexes.includes(i)}
                onChange={() => toggleCheckbox(i)}
                color="primary"
              />
            )}
            {props.mode === "create" && (
              <IconButton
                onClick={() => {
                  props.onUpdateSet({
                    ...props,
                    sets: props.sets
                      ?.slice(0, i)
                      .concat(props.sets.slice(i + 1)),
                  });
                }}
                color="error"
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </div>
        ))}
      </CardContent>
      {editable && (
        <CardActions>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            color="primary"
            onClick={() => {
              const lastSet = props.sets?.at(-1);
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
            Add Set
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default ExerciseCard;
