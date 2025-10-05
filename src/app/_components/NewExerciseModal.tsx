"use client";
import { useRef, useState } from "react";
import Fab from "@mui/material/Fab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import AddIcon from "@mui/icons-material/Add";
import AddLinkIcon from "@mui/icons-material/AddLinkRounded";
import AddExerciseIcon from "@mui/icons-material/SportsGymnastics";
import ConfirmSuperSetIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Snackbar from "@mui/material/Snackbar";
import Switch from "@mui/material/Switch";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { randomUUID } from "crypto";
import { v4 as uuid } from "uuid";

//! todo these should come from the db.
//! and the create modal should be using saved exercises with youtube videos/thumbnails.
const muscleGroups = [
  "shoulders",
  "chest",
  "abs",
  "hamstring",
  "neck",
  "calves",
  "biceps",
  "triceps",
  "quads",
  "glutes",
  "back",
  "lats",
  "total body",
  "cardio",
];
type musclesString = { name: string }[];
type newExercise = {
  muscles: musclesString;
  title: string;
  supersetGroup?: string;
};

const RoutineEditorModal = ({
  onAddAll,
  // onSelectNewSuperset,
  // onConfirmNewSuperSet,
}: {
  onAddAll: (params: newExercise[]) => void;
  // onSelectNewSuperset: () => void;
  // onConfirmNewSuperSet: () => void;
}) => {
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [title, settitle] = useState("");
  const [isSuperset, setIsSuperset] = useState(false);
  const [exercisesList, setExercisesList] = useState<newExercise[]>([]);

  //   const [url, setUrl] = useState(""); //! not gonna worry about the url rn.
  const [showNewExerciseModal, setShowNewExerciseModal] = useState(false);

  const clearFields = () => {
    settitle("");
    setSelectedMuscles([]);
    setIsSuperset(false);
    setExercisesList([]);
  };

  return (
    <>
      <div className="fixed bottom-8 right-4" color="bg-primary">
        <Fab
          aria-label="add"
          color="primary"
          onClick={() => {
            setShowNewExerciseModal(true);
          }}
        >
          <AddIcon />
        </Fab>
      </div>
      {/* <RoutineEditorFab
        onAddExercise={() => setShowNewExerciseModal(true)}
        onConfirmNewSuperSet={onSelectNewSuperset}
        onSelectNewSuperset={onConfirmNewSuperSet}
      /> */}
      <Dialog
        open={showNewExerciseModal}
        onClose={() => setShowNewExerciseModal(false)}
      >
        <DialogTitle>Add Exercise</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Exercise Name"
            variant="standard"
            value={title}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              settitle(event.target.value);
            }}
          />
        </DialogContent>
        <DialogContent>
          <DialogContentText>Muscle Groups</DialogContentText>
          <div className="flex flex-wrap justify-evenly gap-1">
            {muscleGroups.map((muscle, i) => (
              <Chip
                key={i.toString()}
                onClick={() => {
                  if (selectedMuscles.includes(muscle)) {
                    setSelectedMuscles(
                      selectedMuscles.filter((item) => item != muscle),
                    );
                  } else {
                    setSelectedMuscles([...selectedMuscles, muscle]);
                  }
                }}
                label={muscle}
                color={selectedMuscles.includes(muscle) ? "primary" : undefined}
              />
            ))}
          </div>
        </DialogContent>
        <DialogContent>
          <FormGroup>
            <Button
              variant="contained"
              disabled={!title}
              onClick={() => {
                setExercisesList(
                  exercisesList.concat({
                    muscles: selectedMuscles.map((muscle) => ({
                      name: muscle,
                    })),
                    title,
                  }),
                );
                settitle("");
                setSelectedMuscles([]);
              }}
            >
              Add
            </Button>

            <FormControlLabel
              control={
                <Switch
                  aria-label="Switch make superset"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setIsSuperset(event.target.checked);
                  }}
                />
              }
              label={"Make Superset " + (isSuperset ? "(on)" : "(off")}
            />
          </FormGroup>
          <List>
            {exercisesList.map((exercise, index) => (
              <ListItem
                key={exercise.title}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="remove from list"
                    onClick={() => {
                      const newExerciseList = [...exercisesList];
                      newExerciseList.splice(index, 1);
                      setExercisesList(newExerciseList);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                disablePadding
              >
                <ListItemText primary={exercise.title} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              clearFields();
              setShowNewExerciseModal(false);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={!exercisesList.length}
            onClick={() => {
              const supersetId = isSuperset
                ? uuid().toLocaleLowerCase()
                : undefined;

              onAddAll(
                exercisesList.map((exercise) => ({
                  ...exercise,
                  supersetGroup: supersetId,
                })),
              );
              clearFields();
              setShowNewExerciseModal(false);
            }}
          >
            Add All
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// const RoutineEditorFab = ({
//   onAddExercise,
//   onSelectNewSuperset,
//   onConfirmNewSuperSet,
// }: {
//   onAddExercise: () => void;
//   onSelectNewSuperset: () => void;
//   onConfirmNewSuperSet: () => void;
// }) => {
//   /* the fab starts out in a plus.
// when clicked this shows the smaller createSuperset button and the plus icon changes to workoutman with text new exercise
// When superset is clicked the plus icon changes to a check mark with a text of number exercises selected and "link X exercises" and the superset button disappears.

// When add button is clicked the new modal shows up.
// */

//   enum Mode {
//     initial,
//     options,
//     confirmSuperset,
//   }
//   const [mode, setMode] = useState<Mode>(Mode.initial);

//   const [showSnackbar, setShowSnackbar] = useState(false);

//   const onMajorFabClick = () => {
//     switch (mode) {
//       case Mode.initial:
//         setMode(Mode.options);
//         break;
//       case Mode.options:
//         onAddExercise();
//         setMode(Mode.initial);
//         break;
//       case Mode.confirmSuperset:
//         setShowSnackbar(true);
//         setMode(Mode.initial);
//         break;
//     }
//   };

//   let majorFabIcon = <AddIcon />;

//   switch (mode) {
//     case Mode.initial:
//       majorFabIcon = <AddIcon />;
//       break;
//     case Mode.options:
//       majorFabIcon = <AddExerciseIcon />;
//       break;
//     case Mode.confirmSuperset:
//       majorFabIcon = <ConfirmSuperSetIcon />;
//       break;
//   }

//   return (
//     <>
//       <div
//         className="fixed bottom-8 right-4 flex flex-row items-center gap-4"
//         color="bg-primary"
//       >
//         {mode === Mode.options && "New Exercise"}

//         <Fab onClick={onMajorFabClick} color="primary" aria-label="add">
//           {majorFabIcon}
//         </Fab>
//       </div>
//       {mode === Mode.options && (
//         <div
//           className="fixed bottom-28 right-6 flex flex-row items-center gap-4"
//           color="bg-primary"
//         >
//           New Superset
//           <Fab
//             color="secondary"
//             aria-label="add"
//             size="small"
//             onClick={() => {
//               setMode(Mode.confirmSuperset);
//               onSelectNewSuperset();
//             }}
//           >
//             <AddLinkIcon />
//           </Fab>
//         </div>
//       )}
//       <Snackbar
//         open={showSnackbar}
//         autoHideDuration={6000}
//         onClose={() => setShowSnackbar(false)}
//         message="Superset created"
//       />
//     </>
//   );
// };

export default RoutineEditorModal;
