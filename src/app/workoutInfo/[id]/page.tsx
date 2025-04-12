import WorkoutInfoId from "~/app/_components/WorkoutInfo";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

const WorkoutInfoIdPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const session = await auth();
  const { id } = await params;
  const numberedId = Number(id);

  if (Number(id) < 0) {
    return <h1>we couldnt find this workout</h1>;
  }

  const workout = await api.workout.findWorkoutById({ id: numberedId });

  if (!workout) {
    return <h1>we couldnt find this workout</h1>;
  }
  return (
    <WorkoutInfoId
      mode={"read"}
      id={numberedId}
      workout={workout}
      canEdit={session?.user.id == workout.ownerId}
    />
  );
};

export default WorkoutInfoIdPage;
