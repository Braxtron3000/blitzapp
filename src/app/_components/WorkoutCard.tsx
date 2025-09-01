import { type Workout } from "@prisma/client";

const WorkoutCard = ({
  //   title,
  workout,
}: {
  //   title: string;
  workout: Workout;
}) => {
  return (
    <div>
      <div className={"w-full rounded-xl bg-[#1f8fff] pb-[95%]"} />
      <h1>{workout.title}</h1>
      <h3>{workout.description}</h3>
    </div>
  );
};

export default WorkoutCard;
