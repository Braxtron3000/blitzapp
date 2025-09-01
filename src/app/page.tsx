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
      <div className="bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <header className="flex w-full justify-center">
          <div className="container flex h-16 w-full flex-row items-center gap-4">
            {/* <input type="search" className="h-12 grow rounded-3xl" /> */}
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
            {!session && <Link href={"/api/auth/signin"}>Sign in</Link>}
          </div>
        </header>
        <main className="flex min-h-screen w-full flex-col items-center text-white">
          <div className="container flex w-full flex-col items-center justify-center py-16">
            {/* <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4"> */}
            <div className="bgred grid w-full grid-cols-3 justify-items-stretch gap-4 md:grid-cols-4 xl:grid-cols-6">
              {workouts.map((workout, i) => (
                <Link key={i} id={i + ""} href={`/workoutInfo/${workout.id}`}>
                  <WorkoutCard workout={workout} />
                </Link>
              ))}
            </div>
          </div>
        </main>
        <nav>
          {session?.user && (
            // <div className=" grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              href={"/workoutInfo"}
              className="fixed bottom-4 right-4 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            >
              Create Workout
            </Link>
            // </div>
          )}
        </nav>
      </div>
    </HydrateClient>
  );
}
