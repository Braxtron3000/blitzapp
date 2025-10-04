import { type Workout } from "@prisma/client";

const WorkoutCard = ({
  //   title,
  workout,
}: {
  //   title: string;
  workout: Workout;
}) => {
  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl md:max-w-sm">
      <div className="bg-primary from-primary to-secondary flex h-40 items-center justify-center bg-gradient-to-tr">
        <span className="text-5xl" role="img" aria-label="Workout">
          💪
        </span>
      </div>
      <div className="p-6">
        <h1 className="mb-2 text-xl font-bold text-gray-800">
          {workout.title}
        </h1>
        <h3 className="text-base text-gray-600">{workout.description}</h3>
      </div>
    </div>
  );
};

export default WorkoutCard;
