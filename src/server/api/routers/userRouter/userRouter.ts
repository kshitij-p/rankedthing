import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";
import { GAME_ID_SCHEMA } from "../gameRouter/gameRouter";

const userRouter = createTRPCRouter({
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
  getAllUnvotedClips: protectedProcedure
    .input(z.object({ id: GAME_ID_SCHEMA }))
    .query(async ({ ctx: { prisma, session }, input: { id: gameId } }) => {
      return await prisma.videoClip.findMany({
        where: {
          gameId,
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

export default userRouter;
