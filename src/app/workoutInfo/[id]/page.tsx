import WorkoutInfoId from "~/app/workoutInfo/WorkoutInfo";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

const WorkoutInfoIdPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const session = await auth();
  const { id } = await params;
  const workout = await api.workout.findWorkoutById({ id });

  if (!workout) {
    return <h1>we couldnt find this workout</h1>;
  }
  return (
    <WorkoutInfoId
      mode={"read"}
      id={id}
      workout={workout}
      canEdit={session?.user.id == workout.ownerId}
    />
  );
};

export default WorkoutInfoIdPage;
