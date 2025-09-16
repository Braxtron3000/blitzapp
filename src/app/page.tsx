import Link from "next/link";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import WorkoutCard from "./_components/WorkoutCard";
import Image from "next/image";

export default async function Home() {
  const session = await auth();

  const workouts = await api.workout.getWorkouts();

  return (
    <HydrateClient>
      <div className="min-h-screen w-full items-center justify-center bg-gradient-to-b from-[#2290F7] to-[#0d3b66] py-4">
        <header className="flex w-full justify-center px-4">
          <div className="container flex h-16 w-full flex-row items-center justify-end gap-4">
            {session?.user.image && (
              <Link href={"/api/auth/signout"}>
                <Image
                  className="h-12 w-12 rounded-full"
                  src={session.user.image}
                  alt="user image"
                  width={100}
                  height={100}
                />
              </Link>
            )}
            {!session && (
              <Link className="text-white" href={"/api/auth/signin"}>
                Sign in
              </Link>
            )}
          </div>
        </header>
        <main className="flex min-h-screen w-full flex-col items-center px-4 text-white">
          <div className="container flex w-full flex-col items-center justify-center py-16">
            <div className="grid w-full grid-cols-3 justify-items-stretch gap-4 md:grid-cols-4 xl:grid-cols-6">
              {workouts.map((workout, i) => (
                <Link key={i} id={i + ""} href={`/workoutInfo/${workout.id}`}>
                  <WorkoutCard workout={workout} />
                </Link>
              ))}
            </div>
          </div>
        </main>
        <nav className="fixed bottom-4 flex w-full items-center justify-center self-center">
          {session?.user && (
            <Link
              href={"/workoutInfo"}
              className="rounded-full bg-[#2290F7] px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
            >
              Create Workout
            </Link>
          )}
        </nav>
      </div>
    </HydrateClient>
  );
}
