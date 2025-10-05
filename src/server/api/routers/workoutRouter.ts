import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

//subscription helper
import type { TrackedEnvelope } from "@trpc/server";
import { isTrackedEnvelope, tracked } from "@trpc/server";

export const workoutRouter = createTRPCRouter({
  seed: protectedProcedure.mutation(async ({ ctx, input }) => {
    const workouts = await ctx.db.workout.createManyAndReturn({
      data: [
        {
          authorId: ctx.session.user.id,
          ownerId: ctx.session.user.id,
          title: "supercool workout",
          description:
            "some workout info here. blah. blah. blah. blah blah blah bleebloo blah.",
        },
      ],
      select: {
        id: true,
      },
    });

    let firstindex = workouts.at(0);

    if (!firstindex?.id) {
      console.error("no workout returned");

      return;
    }

    const workoutLogs = await ctx.db.workoutLog.createManyAndReturn({
      data: [{ workoutId: firstindex.id }],
    });

    const workoutLogfirstIndex = workoutLogs.at(0);
    if (!workoutLogfirstIndex?.id) {
      console.error("no workoutlog returned");
      return;
    }

    const workoutExercises = await ctx.db.workoutExercise.createManyAndReturn({
      data: [
        {
          workoutId: firstindex.id,
          exerciseName: "bench",
          workoutLogId: workoutLogfirstIndex.id,
        },
        {
          workoutId: firstindex.id,
          exerciseName: "squat",
          workoutLogId: workoutLogfirstIndex.id,
        },
      ],
      select: { id: true },
    });

    firstindex = workoutExercises.at(0);
    if (!firstindex?.id) {
      console.error("no workout exercises returned");
      return;
    }

    const exerciseSets = await ctx.db.singleSet.createMany({
      data: [
        {
          reps: 15,
          restTime: 1,
          weight: 15,
          workoutExerciseId: firstindex.id,
        },
        {
          reps: 17,
          restTime: 1,
          weight: 15,
          workoutExerciseId: firstindex.id,
        },
      ],
    });
    return exerciseSets;
  }),
  createWorkout: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().nullable(),
        routine: z
          .object({
            exerciseName: z.string(),
            musclesTargeted: z.string().array(),
            sets: z
              .object({
                weight: z.number().nullable(),
                reps: z.number().nullable(),
                restTime: z.number().nullable(),
              })
              .array(),
          })
          .array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workouts = await ctx.db.workout.createManyAndReturn({
        data: [
          {
            authorId: ctx.session.user.id,
            ownerId: ctx.session.user.id,
            title: input.title,
            description: input.description,
          },
        ],
        select: {
          id: true,
        },
      });

      let firstindex = workouts.at(0);

      if (!firstindex?.id) {
        console.error("no workout returned");

        return;
      }

      const workoutLogs = await ctx.db.workoutLog.createManyAndReturn({
        data: [{ workoutId: firstindex.id }],
      });

      const workoutLogfirstIndex = workoutLogs.at(0);
      if (!workoutLogfirstIndex?.id) {
        console.error("no workoutlog returned");
        return;
      }

      const workoutExercises = await ctx.db.workoutExercise.createManyAndReturn(
        {
          data: input.routine.map((workoutExercise) => {
            return {
              workoutId: firstindex!.id, //returns above if its undefined.
              workoutLogId: workoutLogfirstIndex.id,
              exerciseName: workoutExercise.exerciseName,
              // musclesTargeted: workoutExercise.musclesTargeted,
            };
          }),
          select: { id: true },
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      workoutExercises.forEach((id, index) =>
        ctx.db.workoutExercise.update({
          //! prisma doesnt allow m-t-m fields in create many or update many. might as well update all here.
          where: { id: id.id },
          data: {
            musclesTargeted: {
              connect:
                input.routine
                  .at(index)
                  ?.musclesTargeted.map((muscle) => ({ name: muscle })) ?? [],
            },
          },
        }),
      );

      firstindex = workoutExercises.at(0);
      if (!workoutExercises || !firstindex?.id) {
        console.error("no workout exercises returned");
        return;
      }

      const exerciseSets = await ctx.db.singleSet.createMany({
        data: workoutExercises.flatMap((id, i) => {
          const exercise = input.routine.at(i);
          if (!exercise) {
            console.warn("no exercise found for id ", id, "at index ", i);
            return [];
          } else
            return exercise.sets.map((set) => {
              return {
                weight: set.weight,
                reps: set.reps,
                restTime: set.restTime,
                workoutExerciseId: id.id,
              };
            });
        }),
      });

      return exerciseSets;
    }),

  //! this needs to have a limit. this gets all public workouts. should use pages and take an input number of the page to get.
  getWorkouts: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.workout.findMany({});
  }),

  deleteWorkout: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("deleted workout ", input.id);

      return await ctx.db.$transaction([
        ctx.db.workout.deleteMany({
          where: { id: input.id },
        }),
        ctx.db.workoutLog.deleteMany({
          where: { workoutId: input.id },
        }),
        ctx.db.workoutExercise.deleteMany({
          where: { workoutId: input.id },
        }),
        ctx.db.singleSet.deleteMany({
          where: { workoutExercise: { workoutId: input.id } },
        }),
      ]);
    }),

  updateWorkout: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        description: z.string().nullable(),
        routine: z
          .object({
            exerciseName: z.string(),
            musclesTargeted: z.string().array(),
            sets: z
              .object({
                weight: z.number().nullable(),
                reps: z.number().nullable(),
                restTime: z.number().nullable(),
              })
              .array(),
          })
          .array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //! Todo: see unstable_concat. ideally this should call delete then create.
      try {
        //CREATE
        const workouts = await ctx.db.workout.createManyAndReturn({
          data: [
            {
              authorId: ctx.session.user.id,
              ownerId: ctx.session.user.id,
              title: input.title,
              description: input.description,
            },
          ],
          select: {
            id: true,
          },
        });

        let firstindex = workouts.at(0);

        if (!firstindex?.id) {
          console.error("no workout returned");

          return;
        }

        const workoutLogs = await ctx.db.workoutLog.createManyAndReturn({
          data: [{ workoutId: firstindex.id }],
        });

        const workoutLogfirstIndex = workoutLogs.at(0);
        if (!workoutLogfirstIndex?.id) {
          console.error("no workoutlog returned");
          return;
        }

        const workoutExercises =
          await ctx.db.workoutExercise.createManyAndReturn({
            data: input.routine.map((workoutExercise) => {
              return {
                workoutId: firstindex!.id, //returns above if its undefined.
                workoutLogId: workoutLogfirstIndex.id,
                exerciseName: workoutExercise.exerciseName,
              };
            }),
            select: { id: true },
          });

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        workoutExercises.forEach((id, index) =>
          ctx.db.workoutExercise.update({
            //! prisma doesnt allow m-t-m fields in create many or update many. might as well update all here.
            where: { id: id.id },
            data: {
              musclesTargeted: {
                connect:
                  input.routine
                    .at(index)
                    ?.musclesTargeted.map((muscle) => ({ name: muscle })) ?? [],
              },
            },
          }),
        );

        firstindex = workoutExercises.at(0);
        if (!workoutExercises || !firstindex?.id) {
          console.error("no workout exercises returned");
          return;
        }

        const exerciseSets = await ctx.db.singleSet.createMany({
          data: workoutExercises.flatMap((id, i) => {
            const exercise = input.routine.at(i);
            if (!exercise) {
              console.warn("no exercise found for id ", id, "at index ", i);
              return [];
            } else
              return exercise.sets.map((set) => {
                return {
                  weight: set.weight,
                  reps: set.reps,
                  restTime: set.restTime,
                  workoutExerciseId: id.id,
                };
              });
          }),
        });

        //DELETE

        console.log("deleted workout ", input.id);

        await ctx.db.$transaction([
          ctx.db.workout.deleteMany({
            where: { id: input.id },
          }),
          ctx.db.workoutLog.deleteMany({
            where: { workoutId: input.id },
          }),
          ctx.db.workoutExercise.deleteMany({
            where: { workoutId: input.id },
          }),
          ctx.db.singleSet.deleteMany({
            where: { workoutExercise: { workoutId: input.id } },
          }),
        ]);

        // ee.emit("add", {
        //   id: workouts.at(0),
        //   title: input.title,
        //   description: input.description,
        //   authorId: ctx.session.user.id,
        //   ownerId: ctx.session.user.id,
        // });

        return exerciseSets;
      } catch (error) {
        console.error("error updating workout " + input.id, error);
      }
    }),

  findWorkoutById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (Number(input.id) < 0) {
        console.warn("searching for workoutid that isnt a number ", input.id);
        return;
      }

      return await ctx.db.workout.findFirst({
        where: {
          id: Number(input.id),
        },
        include: {
          author: true,
          owner: true,
          routine: {
            include: {
              musclesTargeted: true,
              sets: true,
            },
          },
          WorkoutLog: true, //! we want to get the last one. not all of them.
        },
      });
    }),
  getAllTags: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.tag.findMany({});
  }),
});

function isAsyncIterable<TValue, TReturn = unknown>(
  value: unknown,
): value is AsyncIterable<TValue, TReturn> {
  return !!value && typeof value === "object" && Symbol.asyncIterator in value;
}
const trackedEnvelopeSchema =
  z.custom<TrackedEnvelope<unknown>>(isTrackedEnvelope);
/**
 * A Zod schema helper designed specifically for validating async iterables. This schema ensures that:
 * 1. The value being validated is an async iterable.
 * 2. Each item yielded by the async iterable conforms to a specified type.
 * 3. The return value of the async iterable, if any, also conforms to a specified type.
 */
export function zAsyncIterable<
  TYieldIn,
  TYieldOut,
  TReturnIn = void,
  TReturnOut = void,
  Tracked extends boolean = false,
>(opts: {
  /**
   * Validate the value yielded by the async generator
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yield: z.ZodType<TYieldIn, any, TYieldOut>;
  /**
   * Validate the return value of the async generator
   * @remark not applicable for subscriptions
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return?: z.ZodType<TReturnIn, any, TReturnOut>;
  /**
   * Whether if the yielded values are tracked
   * @remark only applicable for subscriptions
   */
  tracked?: Tracked;
}) {
  return z
    .custom<
      AsyncIterable<
        Tracked extends true ? TrackedEnvelope<TYieldIn> : TYieldIn,
        TReturnIn
      >
    >((val) => isAsyncIterable(val))
    .transform(async function* (iter) {
      const iterator = iter[Symbol.asyncIterator]();
      try {
        let next;
        while ((next = await iterator.next()) && !next.done) {
          if (opts.tracked) {
            const [id, data] = trackedEnvelopeSchema.parse(next.value);
            yield tracked(id, await opts.yield.parseAsync(data));
            continue;
          }
          yield opts.yield.parseAsync(next.value);
        }
        if (opts.return) {
          return await opts.return.parseAsync(next.value);
        }
        return;
      } finally {
        await iterator.return?.();
      }
    }) as z.ZodType<
    AsyncIterable<
      Tracked extends true ? TrackedEnvelope<TYieldIn> : TYieldIn,
      TReturnIn,
      unknown
    >,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    AsyncIterable<
      Tracked extends true ? TrackedEnvelope<TYieldOut> : TYieldOut,
      TReturnOut,
      unknown
    >
  >;
}
