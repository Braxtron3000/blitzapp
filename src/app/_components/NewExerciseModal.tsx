import { useRef, useState } from "react";

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

  return (
    <div className="fixed bottom-0 z-10 flex w-full flex-col items-center gap-2 rounded-t-3xl bg-stone-700 py-4">
      <input
        type="text"
        placeholder="exercise name"
        value={title}
        onChange={(e) => settitle(e.target.value)}
        className="block w-11/12 rounded-full px-4 py-2 text-black"
      />

      {/* <input
        type="url"
        placeholder="video link"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="block w-11/12 rounded-full px-4 py-2 text-black"
      /> */}
      <div className="flex w-11/12 flex-wrap justify-evenly gap-1">
        {muscleGroups.map((muscle, i) => (
          <button
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
            className={`rounded-3xl ${selectedMuscles.includes(muscle) ? "bg-yellow-300" : "bg-yellow-100"} px-4 py-1 text-black`}
          >
            {muscle}
          </button>
        ))}
      </div>
      <button
        className="block rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20 disabled:text-gray-500"
        onClick={() => {
          onAdd({
            muscles: selectedMuscles.map((muscle) => ({ name: muscle })),
            title,
          });
          settitle("");
        }}
        disabled={!title}
      >
        Add Exercise
      </button>
    </div>
  );
};

export default NewExerciseModal;
