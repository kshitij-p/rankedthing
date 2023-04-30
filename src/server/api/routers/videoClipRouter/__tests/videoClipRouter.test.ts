import { expect, it, beforeEach, describe } from "vitest";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { mockClear, mockDeep } from "vitest-mock-extended";
import type { GameRank, PrismaClient, VideoClip } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  FakeRankDoesntExistError,
  RealRankDoesntExistError,
} from "../videoClipRouter";

const makeMockVideoClip = ({ ...rest }: Partial<VideoClip>) => {
  return {
    ...({
      fakeRankName: "diffRank",
      realRankName: "diffRank",
      gameId: 1,
      id: "1",
      submittedAt: new Date(),
      updatedAt: new Date(),
      title: "title",
      userId: "1",
      ytUrl: "url",
    } satisfies VideoClip),
    ...rest,
  };
};

describe("create", () => {
  const prismaMock = mockDeep<PrismaClient>();

  beforeEach(() => {
    mockClear(prismaMock);
  });

  it("fails to create clip with wrong ranks", async () => {
    const ctx = createInnerTRPCContext({
      session: {
        user: {
          id: "test-user-id",
        },
        expires: new Date().toISOString(),
      },
    });

    const mockClip = makeMockVideoClip({
      fakeRankName: "existentRank",
      realRankName: "existentRank",
      userId: ctx.session?.user.id,
    });

    prismaMock.gameRank.findUnique.mockResolvedValue({
      gameId: 1,
      name: "existentRank",
      maxElo: 1,
      minElo: 1,
    } satisfies GameRank);

    const caller = appRouter.createCaller({ ...ctx, prisma: prismaMock });

    await expect(
      caller.videoClip.create({
        gameId: mockClip.gameId,
        fakeRank: "nonExistentRank",
        realRank: "existentRank",
        title: mockClip.title,
        ytUrl: mockClip.ytUrl,
      })
    ).rejects.toThrow();

    await expect(
      caller.videoClip.create({
        gameId: mockClip.gameId,
        fakeRank: "existentRank",
        realRank: "nonExistentRank",
        title: mockClip.title,
        ytUrl: mockClip.ytUrl,
      })
    ).rejects.toThrow();
  });

  it("fails to update a clip with wrong ranks", async () => {
    const ctx = createInnerTRPCContext({
      session: {
        user: {
          id: "test-user-id",
        },
        expires: new Date().toISOString(),
      },
    });

    const clipToEdit = makeMockVideoClip({
      fakeRankName: "existentRank",
      realRankName: "existentRank",
      userId: ctx.session?.user.id,
    });

    prismaMock.videoClip.findUnique.mockResolvedValue(clipToEdit);

    prismaMock.gameRank.findUnique.mockResolvedValue({
      gameId: 1,
      name: "existentRank",
      maxElo: 1,
      minElo: 1,
    } satisfies GameRank);

    const caller = appRouter.createCaller({ ...ctx, prisma: prismaMock });

    await expect(
      caller.videoClip.update({
        ...clipToEdit,
        newRealRank: "nonExistentRank",
      })
    ).rejects.toThrowError(RealRankDoesntExistError);

    await expect(
      caller.videoClip.update({
        ...clipToEdit,
        newFakeRank: "nonExistentRank",
      })
    ).rejects.toThrowError(new TRPCError(FakeRankDoesntExistError));
  });
});
