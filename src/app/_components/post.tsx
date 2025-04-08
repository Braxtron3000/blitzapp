"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  const workouts = api.workout.getWorkouts.useQuery();

  const [workoutsState, setWorkoutsState] = useState<
    {
      description: string | null;
      id: number;
      title: string;
      authorId: string;
      ownerId: string;
    }[]
  >(workouts.data ?? []);

  // !leave this in for now.
  // const something = api.workout.onWorkoutAdd.useSubscription(undefined, {
  //   onData: (event) => {
  //     setWorkoutsState((prev) => [...prev, event.data]);
  //   },
  // });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitWorkouts.mutate({
            description,
            routine: [],
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-[5rem] w-full resize-none overflow-hidden rounded-2xl px-4 py-2 text-black"
          />
          <button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20 disabled:text-gray-500"
            type="submit"
            disabled={submitWorkouts.isPending || !description || !title}
          >
            {submitWorkouts.isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
