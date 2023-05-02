import { type GameRank } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

const CORRECT_SCORE_REWARD = 10;

type RankRange = Pick<GameRank, "minElo" | "maxElo">;

export const rankIsGTE = (rankOne: RankRange, rankTwo: RankRange) => {
  return rankOne.minElo >= rankTwo.maxElo;
};

export const rankIsLTE = (rankOne: RankRange, rankTwo: RankRange) => {
  return rankOne.maxElo <= rankTwo.minElo;
};

export const getScore = ({
  fakeRank,
  realRank,
  guessedHigher,
}: {
  fakeRank: RankRange;
  realRank: RankRange;
  guessedHigher: boolean;
}) => {
  let score = 0;

  //Check if RealRank is LOWER than FakeRank and in this case reward players who vote lower
  //E.g. Real rank = Silver, Fake Rank = Gold, only reward ppl who voted lower
  if (rankIsLTE(realRank, fakeRank)) {
    if (!guessedHigher) {
      score += CORRECT_SCORE_REWARD;
    }

    //Check if RealRank is HIGHER than FakeRank and in this case reward players who vote higher
    //E.g. Real rank = Gold, Fake Rank = Silver, only reward ppl who voted higher
  } else if (rankIsGTE(realRank, fakeRank)) {
    if (guessedHigher) {
      score += CORRECT_SCORE_REWARD;
    }
  }

  //videoClipRouter methods ensure invalid combination of fakeRank and realRanks aren't created so those cases arent handled here

  return score;
};

const clipVoteRouter = createTRPCRouter({
  getVoteForClip: protectedProcedure
    .input(z.object({ clipId: z.string() }))
    .query(async ({ ctx: { prisma, session }, input: { clipId } }) => {
      const vote = await prisma.clipVote.findFirst({
        where: {
          videoClipId: clipId,
          AND: {
            userId: session.user.id,
          },
        },
      });

      return vote;
    }),
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

        if (toVoteOn.userId === session.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Cannot vote on your own clip.",
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
