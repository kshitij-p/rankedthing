import { type GameRank } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

const CORRECT_SCORE_REWARD = 10;

const getScore = ({
  fakeRank,
  realRank,
  guessedHigher,
}: {
  fakeRank: Pick<GameRank, "minElo" | "maxElo">;
  realRank: Pick<GameRank, "minElo" | "maxElo">;
  guessedHigher: boolean;
}) => {
  let score = 0;

  //Check if REALRANK is LOWER than FAKERANK and in this case reward players who vote lower
  //E.g. Real rank = Silver, Fake Rank = Gold, only reward ppl who voted lower
  if (realRank.maxElo <= fakeRank.minElo) {
    if (!guessedHigher) {
      score += CORRECT_SCORE_REWARD;
    }

    //Check if REALRANK is HIGHER than FAKERANK and in this case reward players who vote higher
    //E.g. Real rank = Gold, Fake Rank = Silver, only reward ppl who voted higher
  } else if (realRank.minElo >= fakeRank.maxElo) {
    if (guessedHigher) {
      score += CORRECT_SCORE_REWARD;
    }
  }

  //videoClipRouter methods ensure invalid combination of fakeRank and realRanks aren't created so those cases arent handled here

  return score;
};

const clipVoteRouter = createTRPCRouter({
  vote: protectedProcedure
    .input(z.object({ id: z.string(), guessedHigher: z.boolean() }))
    .mutation(
      async ({
        ctx: { prisma, session },
        input: { id: clipid, guessedHigher },
      }) => {
        const toVoteOn = await prisma.videoClip.findUnique({
          where: {
            id: clipid,
          },
          include: {
            fakeRank: {
              select: {
                minElo: true,
                maxElo: true,
              },
            },
            realRank: {
              select: {
                minElo: true,
                maxElo: true,
              },
            },
          },
        });

        if (!toVoteOn) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Provided clip to vote on doesn't exist.",
          });
        }

        const score = getScore({
          fakeRank: toVoteOn.fakeRank,
          realRank: toVoteOn.realRank,
          guessedHigher,
        });

        const clipVote = await prisma.clipVote.create({
          data: {
            userId: session.user.id,
            guessedHigher,
            score,
            videoClipId: toVoteOn.id,
          },
        });

        return clipVote;
      }
    ),
});

export default clipVoteRouter;
