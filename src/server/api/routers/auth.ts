import { skipToken } from "@tanstack/react-query";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import type { Session } from "@auth/core/types";

export const authRouter = createTRPCRouter({
  loginAndroid: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        token: z.string(),
        name: z.string(),
        image: z.string().url().nullable(),
        providerAccountId: z.string(),
        provider: z.string(),
        type: z.string(),
        expires: z.date(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        email,
        token,
        name,
        image,
        providerAccountId,
        provider,
        type,
        expires,
      } = input;

      // adjust parsing to match how `expires` is sent (ISO string assumed)

      let update: { name: typeof name; image?: typeof image } = { name: name };
      if (image !== null) {
        update = { ...update, image: image };
      }

      // Upsert user (creates user if missing, updates name/image otherwise)
      const user = await ctx.db.user.upsert({
        where: { email },
        update,
        create: { email, name, image },
      });

      //might need a trycatch if the schema uses a different unique constraint
      await ctx.db.account.upsert({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId, //!! don't commit this!!!!!!
          },
        },
        update: {
          access_token: token,
          type,
          expires_at: Math.floor(expires.getTime() / 1000),
          userId: user.id,
        },
        create: {
          userId: user.id,
          provider,
          providerAccountId,
          type,
          access_token: token,
          expires_at: Math.floor(expires.getTime() / 1000),
        },
      });
      /* 
} catch {
        // Fallback if the composite unique name differs from provider_providerAccountId
        const existing = await ctx.prisma.account.findFirst({
          where: { provider, providerAccountId },
        });
        if (existing) {
          await ctx.prisma.account.update({
            where: { id: existing.id },
            data: {
              access_token: token,
              type,
              expires_at: expiresAt,
              userId: user.id,
            },
          });
        } else {
          await ctx.prisma.account.create({
            data: {
              userId: user.id,
              provider,
              providerAccountId,
              type,
              access_token: token,
              expires_at: expiresAt,
            },
          });
        }
      }
        */

      // Create a session record. This uses the incoming `token` as the sessionToken.
      // If you generate a separate session token, replace `token` with the generated value.
      const session = await ctx.db.session.create({
        data: {
          sessionToken: token,
          userId: user.id,
          expires: expires ?? undefined,
        },
      });

      return session;
    }),

  getSession: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // const session: Session | null = {
      //   user: {
      //     id: "cmgcjlbkc0000bm3h03zsmmag",
      //     name: "braxton hancock",
      //     email: "braxdhancock@gmail.com",
      //     // emailVerified: null,
      //     image:
      //       "https://lh3.googleusercontent.com/a/ACg8ocJuNrzlqEYn6ZlvINVVYjtGIOuAyIEVpSpRaTmGanPoivpi4A=s96-c",
      //   },
      //   expires: new Date("2026-02-27 01:53:26.128").toISOString(),
      // };

      const querySession = await ctx.db.user.findFirst({
        where: {
          AND: {
            email: input.email,
            name: input.name,
          },
        },
        include: {
          sessions: {
            where: {
              expires: { gt: new Date() },
            },
          },
        },
      });

      if (
        !querySession ||
        querySession.sessions.length === 0 ||
        !querySession.sessions[0] ||
        !querySession.id
      ) {
        return null;
      }

      const session: Session = {
        user: {
          id: querySession.id,
          name: querySession.name,
          email: querySession.email,
          image: querySession?.image ?? undefined,
        },
        expires: querySession.sessions[0].expires.toISOString(),
      };

      return session;
    }),
});
