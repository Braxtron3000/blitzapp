"use client";
import { useRef, useState } from "react";
import Fab from "@mui/material/Fab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import AddIcon from "@mui/icons-material/Add";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

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

const NewExerciseModal = ({
  onAdd,
}: {
  onAdd: (params: { muscles: musclesString; title: string }) => void;
}) => {
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [title, settitle] = useState("");
  //   const [url, setUrl] = useState(""); //! not gonna worry about the url rn.
  const [showNewExerciseModal, setShowNewExerciseModal] = useState(false);

  const clearFieldsAndClose = () => {
    settitle("");
    setSelectedMuscles([]);
    setShowNewExerciseModal(false);
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
        <DialogActions>
          <Button onClick={clearFieldsAndClose}>Cancel</Button>
          <Button
            disabled={!title}
            onClick={() => {
              onAdd({
                muscles: selectedMuscles.map((muscle) => ({ name: muscle })),
                title,
              });
              clearFieldsAndClose();
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewExerciseModal;
