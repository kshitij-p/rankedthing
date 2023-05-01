import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";

export const GAME_ID_SCHEMA = z.number().nonnegative();

const gameRouter = createTRPCRouter({
  getByShortTitle: publicProcedure
    .input(z.object({ shortTitle: z.string() }))
    .query(async ({ ctx: { prisma }, input: { shortTitle } }) => {
      const game = await prisma.game.findUnique({ where: { shortTitle } });

      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Provided game id doesn't exist.",
        });
      }

      return game;
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.game.findMany();
  }),
  getAllClips: publicProcedure
    .input(z.object({ gameId: GAME_ID_SCHEMA }))
    .query(async ({ ctx: { prisma }, input: { gameId } }) => {
      return await prisma.videoClip.findMany({
        where: {
          gameId,
        },
      });
    }),
  getRanks: publicProcedure
    .input(z.object({ gameId: GAME_ID_SCHEMA }))
    .query(async ({ ctx: { prisma }, input: { gameId } }) => {
      return await prisma.gameRank.findMany({
        where: {
          gameId,
        },
      });
    }),
  getAllUnvotedClips: protectedProcedure
    .input(z.object({ gameId: GAME_ID_SCHEMA }))
    .query(async ({ ctx: { prisma, session }, input: { gameId } }) => {
      return await prisma.videoClip.findMany({
        where: {
          gameId,
          userId: {
            not: session.user.id,
          },
          AND: {
            ClipVote: {
              none: {
                userId: session.user.id,
              },
            },
          },
        },
      });
    }),
  getUnvotedClip: protectedProcedure
    .input(z.object({ gameId: GAME_ID_SCHEMA }))
    .query(async ({ ctx: { prisma, session }, input: { gameId } }) => {
      return await prisma.videoClip.findFirst({
        where: {
          gameId,
          userId: {
            not: session.user.id,
          },
          AND: {
            ClipVote: {
              none: {
                userId: session.user.id,
              },
            },
          },
        },
      });
    }),
});

export default gameRouter;
