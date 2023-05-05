/**
 * Important - This entire router's queries' cache is invalidated when we vote
 */

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../trpc";

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
});

export default statsRouter;
