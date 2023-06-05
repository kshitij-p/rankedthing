import { type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { isValidYtUrl } from "~/utils/client";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";
import { GAME_ID_SCHEMA } from "../gameRouter/gameRouter";

const isValidRank = async (id: string, prisma: PrismaClient) => {
  const rank = await prisma.gameRank.findUnique({ where: { id } });

  return rank?.id === id;
};

export const FakeRankDoesntExistError = new TRPCError({
  code: "NOT_FOUND",
  message: "Provided fake rank doesn't exist.",
});

export const RealRankDoesntExistError = new TRPCError({
  code: "NOT_FOUND",
  message: "Provided real rank doesn't exist.",
});

export const FakeRankSameAsRealRankError = new TRPCError({
  code: "BAD_REQUEST",
  message: "Fake rank can't be same as real rank.",
});

export const InvalidYtUrlError = new TRPCError({
  code: "BAD_REQUEST",
  message: "Provided youtube url is invalid.",
});

const videoClipRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ clipId: z.string() }))
    .query(async ({ ctx: { prisma }, input: { clipId } }) => {
      const clip = await prisma.videoClip.findUnique({
        where: {
          id: clipId,
        },
        include: {
          game: true,
          fakeRank: true,
          realRank: true,
        },
      });

      if (!clip) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Couldn't find a clip with the requested id ${clipId}.`,
        });
      }

      return clip;
    }),
  create: adminProcedure
    .input(
      z.object({
        title: z.string(),
        gameId: GAME_ID_SCHEMA,
        ytUrl: z.string(),
        realRank: z.string(),
        fakeRank: z.string(),
      })
    )
    .mutation(
      async ({
        ctx: { prisma, session },
        input: { realRank, fakeRank, ytUrl, title, gameId },
      }) => {
        if (!isValidYtUrl(ytUrl)) {
          throw InvalidYtUrlError;
        }

        if (fakeRank === realRank) {
          throw FakeRankSameAsRealRankError;
        }

        if (!(await isValidRank(realRank, prisma))) {
          throw RealRankDoesntExistError;
        }

        if (!(await isValidRank(fakeRank, prisma))) {
          throw FakeRankDoesntExistError;
        }

        const newClip = await prisma.videoClip.create({
          data: {
            userId: session.user.id,
            gameId,
            title,
            ytUrl,
            fakeRankId: fakeRank,
            realRankId: realRank,
          },
        });

        return newClip;
      }
    ),
  createPotentialClip: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        gameId: GAME_ID_SCHEMA,
        ytUrl: z.string(),
        realRank: z.string(),
        fakeRank: z.string(),
      })
    )
    .mutation(
      async ({
        ctx: { prisma, session },
        input: { realRank, fakeRank, ytUrl, title, gameId },
      }) => {
        if (!isValidYtUrl(ytUrl)) {
          throw InvalidYtUrlError;
        }

        if (fakeRank === realRank) {
          throw FakeRankSameAsRealRankError;
        }

        if (!(await isValidRank(realRank, prisma))) {
          throw RealRankDoesntExistError;
        }

        if (!(await isValidRank(fakeRank, prisma))) {
          throw FakeRankDoesntExistError;
        }

        const newClip = await prisma.potentialClip.create({
          data: {
            userId: session.user.id,
            gameId,
            title,
            ytUrl,
            fakeRankId: fakeRank,
            realRankId: realRank,
          },
        });

        return newClip;
      }
    ),
  getAllPotentialClips: adminProcedure.query(async ({ ctx: { prisma } }) => {
    return await prisma.potentialClip.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        newTitle: z.string().optional(),
        newYtUrl: z.string().optional(),
        newRealRank: z.string().optional(),
        newFakeRank: z.string().optional(),
      })
    )
    .mutation(
      async ({
        ctx: { prisma, session },
        input: { id, newFakeRank, newRealRank, newTitle, newYtUrl },
      }) => {
        if (newYtUrl && !isValidYtUrl(newYtUrl)) {
          throw InvalidYtUrlError;
        }

        if (newFakeRank && !(await isValidRank(newFakeRank, prisma))) {
          throw FakeRankDoesntExistError;
        }

        if (newRealRank && !(await isValidRank(newRealRank, prisma))) {
          throw RealRankDoesntExistError;
        }

        if (newFakeRank && newRealRank && newFakeRank === newFakeRank) {
          throw FakeRankSameAsRealRankError;
        }

        const toUpdate = await prisma.videoClip.findUnique({
          where: {
            id,
          },
          include: {
            user: true,
          },
        });

        if (!toUpdate) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Couldn't find the clip that was requested to be updated",
          });
        }

        if (toUpdate.userId !== session.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You aren't authorized to do this",
          });
        }

        return await prisma.videoClip.update({
          where: {
            id: toUpdate.id,
          },
          data: {
            fakeRankId: newFakeRank,
            realRankId: newRealRank,
            title: newTitle,
            ytUrl: newYtUrl,
          },
        });
      }
    ),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx: { prisma, session }, input: { id } }) => {
      const toDelete = await prisma.videoClip.findUnique({
        where: {
          id,
        },
        include: {
          user: true,
        },
      });

      if (!toDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Couldn't find the clip that was requested to be deleted",
        });
      }

      if (toDelete.userId !== session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You aren't authorized to do this",
        });
      }

      return await prisma.videoClip.delete({
        where: {
          id: toDelete.id,
        },
      });
    }),
});

export default videoClipRouter;
