import { auth } from "~/server/auth";
import { LatestPost } from "../_components/post";
import WorkoutInfoId from "./WorkoutInfo";

export default async function WorkoutInfo() {
  const session = await auth();

  return <WorkoutInfoId mode="create" />;
}
