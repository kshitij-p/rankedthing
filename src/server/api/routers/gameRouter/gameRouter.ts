import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../trpc";

export const GAME_ID_SCHEMA = z.number().nonnegative();

const gameRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.game.findMany();
  }),

  getAllClips: publicProcedure
    .input(z.object({ id: GAME_ID_SCHEMA }))
    .query(async ({ ctx: { prisma }, input: { id: gameId } }) => {
      return await prisma.videoClip.findMany({
        where: {
          gameId,
        },
      });
    }),

  getRanks: publicProcedure
    .input(z.object({ id: GAME_ID_SCHEMA }))
    .query(async ({ ctx: { prisma }, input: { id: gameId } }) => {
      return await prisma.gameRank.findMany({
        where: {
          gameId,
        },
      });
    }),
});

export default gameRouter;
