import Link from "next/link";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import WorkoutCard from "./_components/WorkoutCard";
import Image from "next/image";
import Button from "@mui/material/Button";
import SigninButtons from "./_components/SinginButtons";
import { Capacitor } from "@capacitor/core";

export default async function Home() {
  const platform = Capacitor.getPlatform();

  const latestSession = await api.auth.getSession({
    email: "braxdhancock@gmail.com",
    name: "braxton hancock",
  });

  const session = true ? latestSession : await auth();

  const workouts = await api.workout.getWorkouts();
  const tags = await api.workout.getAllTags();
  console.log("latestsession:", latestSession);
  return (
    <HydrateClient>
      <div className="min-h-screen w-full items-center justify-center bg-background py-4">
        <header className="flex w-full justify-center px-4">
          <div className="container flex h-16 w-full flex-row items-center justify-center gap-4">
            <div className="flex w-1/2 flex-grow items-center rounded-full bg-surface px-4 py-2 text-text">
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 bg-transparent outline-none placeholder:text-white"
              />
            </div>

            {session?.user.image && (
              <Link className="block shrink" href={"/api/auth/signout"}>
                <Image
                  className="h-10 w-10 rounded-full"
                  src={session.user.image}
                  alt="user image"
                  width={100}
                  height={100}
                />
              </Link>
            )}
            {!session &&
              (false ? (
                <SigninButtons />
              ) : (
                <Link className="text-white" href={"/api/auth/signin"}>
                  Sign in
                </Link>
              ))}
          </div>
        </header>
        <main className="flex min-h-screen w-full flex-col items-center px-4 text-white">
          <div className="container flex w-full flex-col items-center justify-center py-16">
            <div className="grid w-full grid-cols-2 justify-items-stretch gap-4 md:grid-cols-4 xl:grid-cols-6">
              <SigninButtons />
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
              className="rounded-full bg-primary px-10 py-3 font-semibold text-text no-underline transition hover:bg-secondary/20"
            >
              Create Workout
            </Link>
          )}
        </nav>
      </div>
    </HydrateClient>
  );
}
