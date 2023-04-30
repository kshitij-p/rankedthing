import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { GAME_ID_SCHEMA } from "../gameRouter/gameRouter";

const isValidRank = async (name: string) => {
  const rank = await prisma.gameRank.findUnique({ where: { name } });
  return rank !== null && rank !== undefined;
};

const videoClipRouter = createTRPCRouter({
  create: protectedProcedure
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
        if (!(await isValidRank(realRank))) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Provided real rank doesn't exist",
          });
        }

        if (!(await isValidRank(fakeRank))) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Provided fake rank doesn't exist",
          });
        }

        const newClip = await prisma.videoClip.create({
          data: {
            userId: session.user.id,
            gameId,
            title,
            ytUrl,
            fakeRankName: fakeRank,
            realRankName: realRank,
          },
        });

        return newClip;
      }
    ),
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

        if (toUpdate.userId != session.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You aren't authorized to do this",
          });
        }

        if (newFakeRank && !(await isValidRank(newFakeRank))) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Provided fake rank doesn't exist.",
          });
        }

        if (newRealRank && !(await isValidRank(newRealRank))) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Provided real rank doesn't exist.",
          });
        }

        return await prisma.videoClip.update({
          where: {
            id: toUpdate.id,
          },
          data: {
            fakeRankName: newFakeRank,
            realRankName: newRealRank,
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

      if (toDelete.userId != session.user.id) {
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
