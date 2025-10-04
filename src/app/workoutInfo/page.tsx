import { auth } from "~/server/auth";
import WorkoutInfoId from "../_components/WorkoutInfo";

export default async function WorkoutInfo() {
  return <WorkoutInfoId mode="create" />;
}
