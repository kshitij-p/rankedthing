import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";

export const GAME_ID_SCHEMA = z.number().nonnegative();

const gameRouter = createTRPCRouter({
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
