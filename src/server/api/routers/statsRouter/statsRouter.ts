/**
 * Important - This entire router's queries' cache is invalidated when we vote
 */

import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";
import { GAME_ID_SCHEMA } from "../gameRouter/gameRouter";

const statsRouter = createTRPCRouter({
  getTotalScore: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx: { prisma }, input: { id: userId } }) => {
      const totalScore =
        (
          await prisma.clipVote.aggregate({
            where: {
              userId,
            },
            _sum: {
              score: true,
            },
          })
        )._sum.score ?? 0;

      return totalScore;
    }),
  getClipsHistory: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      const clips = await prisma.clipVote.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          clip: {
            include: {
              game: true,
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
      });

      return clips;
    }
  ),
  getClipsCountForGame: publicProcedure
    .input(z.object({ gameId: GAME_ID_SCHEMA }))
    .query(async ({ ctx: { prisma }, input: { gameId } }) => {
      const query = await prisma.videoClip.aggregate({
        where: {
          gameId: gameId,
        },
        _count: true,
      });

      return query._count;
    }),
  getVotedClipsCountForGame: protectedProcedure
    .input(z.object({ gameId: GAME_ID_SCHEMA }))
    .query(async ({ ctx: { prisma, session }, input: { gameId } }) => {
      const query = await prisma.videoClip.aggregate({
        where: {
          gameId: gameId,
          ClipVote: {
            some: {
              userId: session.user.id,
            },
          },
        },
        _count: true,
      });

      return query._count;
    }),
  getScoreForGame: protectedProcedure
    .input(z.object({ gameId: GAME_ID_SCHEMA }))
    .query(async ({ ctx: { prisma, session }, input: { gameId } }) => {
      const query = await prisma.clipVote.aggregate({
        where: {
          userId: session.user.id,
          clip: {
            gameId: gameId,
          },
        },
        _sum: {
          score: true,
        },
      });

      return query._sum.score ?? 0;
    }),
});

export default statsRouter;
