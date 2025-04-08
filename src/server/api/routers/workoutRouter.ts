import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { Workout } from "@prisma/client";

//subscription helper
import type { TrackedEnvelope } from "@trpc/server";
import { isTrackedEnvelope, tracked } from "@trpc/server";
import EventEmitter, { on } from "events";
import type { Post } from "@prisma/client";

const ee = new EventEmitter();

//! delete me.
function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const seedWorktoutTitles = [
  "back and biceps",
  "biceps day warmup",
  "leg day",
  "hypertrophsy leg day",
];

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

    if (!firstindex || !firstindex.id) {
      console.error("no workout returned");

      return;
    }

    const workoutLogs = await ctx.db.workoutLog.createManyAndReturn({
      data: [{ workoutId: firstindex.id }],
    });

    let workoutLogfirstIndex = workoutLogs.at(0);
    if (!workoutLogfirstIndex || !workoutLogfirstIndex.id) {
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
    if (!firstindex || !firstindex.id) {
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
        description: z.string(),
        routine: z
          .object({
            exerciseName: z.string(),
            musclesTargeted: z.string().array(),
            sets: z
              .object({
                weight: z.number(),
                reps: z.number(),
                restTime: z.number(),
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

      if (!firstindex || !firstindex.id) {
        console.error("no workout returned");

        return;
      }

      const workoutLogs = await ctx.db.workoutLog.createManyAndReturn({
        data: [{ workoutId: firstindex.id }],
      });

      let workoutLogfirstIndex = workoutLogs.at(0);
      if (!workoutLogfirstIndex || !workoutLogfirstIndex.id) {
        console.error("no workoutlog returned");
        return;
      }

      // const workoutExercises = await ctx.db.workoutExercise.createManyAndReturn(
      //   {
      //     data: input.routine.map((workoutExercise) => {
      //       return {
      //         workoutId: firstindex!.id, //returns above if its undefined.
      //         workoutLogId: workoutLogfirstIndex.id,
      //         exerciseName: workoutExercise.exerciseName,
      //         musclesTargeted: workoutExercise.musclesTargeted,
      //       };
      //     }),
      //     select: { id: true },
      //   },
      // );

      const workoutExercises = await ctx.db.workoutExercise.createManyAndReturn(
        {
          data: [
            {
              workoutLogId: workoutLogfirstIndex.id,
              exerciseName: "bench",
              workoutId: firstindex.id,
            },
          ],
          select: { id: true },
        },
      );

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
      if (!workoutExercises || !firstindex || !firstindex.id) {
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

      // ee.emit("add", {
      //   id: workouts.at(0),
      //   title: input.title,
      //   description: input.description,
      //   authorId: ctx.session.user.id,
      //   ownerId: ctx.session.user.id,
      // });

      return exerciseSets;
    }),

  //! this needs to have a limit. this gets all public workouts.
  getWorkouts: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.workout.findMany();
  }),

  findWorkoutById: publicProcedure
    .input(z.object({ id: z.string() }))
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

  //!leave this in for now.
  // onWorkoutAdd: protectedProcedure
  //   .output(
  //     zAsyncIterable({
  //       yield: z.object({
  //         title: z.string(),
  //         description: z.string().nullable(),
  //         id: z.number(),
  //         authorId: z.string(),
  //         ownerId: z.string(),
  //       }),
  //       tracked: true,
  //     }),
  //   )
  //   .subscription(async function* (opts) {
  //     for await (const [data] of on(ee, "add", {
  //       signal: opts.signal,
  //     })) {
  //       const workout = data as Workout;
  //       yield tracked(workout.id.toString(), workout);
  //     }
  //   }),

  // hello: publicProcedure
  //   .input(z.object({ text: z.string() }))
  //   .query(({ input }) => {
  //     return {
  //       greeting: `Hello ${input.text}`,
  //     };
  //   }),

  // create: protectedProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     return ctx.db.post.create({
  //       data: {
  //         name: input.name,
  //         createdBy: { connect: { id: ctx.session.user.id } },
  //       },
  //     });
  //   }),

  // getLatest: protectedProcedure.query(async ({ ctx }) => {
  //   const post = await ctx.db.post.findFirst({
  //     orderBy: { createdAt: "desc" },
  //     where: { createdBy: { id: ctx.session.user.id } },
  //   });

  //   return post ?? null;
  // }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
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
  yield: z.ZodType<TYieldIn, any, TYieldOut>;
  /**
   * Validate the return value of the async generator
   * @remark not applicable for subscriptions
   */
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
    any,
    AsyncIterable<
      Tracked extends true ? TrackedEnvelope<TYieldOut> : TYieldOut,
      TReturnOut,
      unknown
    >
  >;
}
