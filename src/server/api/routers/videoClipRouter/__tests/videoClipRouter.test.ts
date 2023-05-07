import { expect, it, beforeEach, describe } from "vitest";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { mockClear, mockDeep } from "vitest-mock-extended";
import type { GameRank, PrismaClient, VideoClip } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  FakeRankDoesntExistError,
  FakeRankSameAsRealRankError,
  InvalidYtUrlError,
  RealRankDoesntExistError,
} from "../videoClipRouter";

const makeMockVideoClip = (clip?: Partial<VideoClip>) => {
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
      ytUrl: "https://www.youtube.com/watch?v=ILMHmEADlwY",
    } satisfies VideoClip),
    ...clip,
  };
};

const makeMockRank = (rank?: Partial<GameRank>) => {
  return {
    ...({
      name: "rank",
      gameId: 1,
      maxElo: 1,
      minElo: 1,
    } satisfies GameRank),
    ...rank,
  };
};

describe("create", () => {
  const prismaMock = mockDeep<PrismaClient>();

  beforeEach(() => {
    mockClear(prismaMock);
  });

  it("fails to create with invalid yt url", async () => {
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
      ytUrl: "invalidurl",
    });

    prismaMock.gameRank.findUnique.mockResolvedValue(
      makeMockRank({
        name: mockClip.fakeRankName,
      })
    );

    const caller = appRouter.createCaller({ ...ctx, prisma: prismaMock });

    await expect(
      caller.videoClip.create({
        ...mockClip,
        gameId: mockClip.gameId,
        fakeRank: mockClip.fakeRankName,
        realRank: mockClip.realRankName,
        title: mockClip.title,
        ytUrl: mockClip.ytUrl,
      })
    ).rejects.toThrowError(InvalidYtUrlError);
  });

  it("fails to create clip with invalid ranks", async () => {
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

    prismaMock.gameRank.findUnique.mockResolvedValue(
      makeMockRank({
        name: "existentRank",
      })
    );

    const caller = appRouter.createCaller({ ...ctx, prisma: prismaMock });

    await expect(
      caller.videoClip.create({
        gameId: mockClip.gameId,
        fakeRank: "nonExistentRank",
        realRank: "existentRank",
        title: mockClip.title,
        ytUrl: mockClip.ytUrl,
      })
    ).rejects.toThrowError(FakeRankDoesntExistError);

    await expect(
      caller.videoClip.create({
        gameId: mockClip.gameId,
        fakeRank: "existentRank",
        realRank: "nonExistentRank",
        title: mockClip.title,
        ytUrl: mockClip.ytUrl,
      })
    ).rejects.toThrowError(RealRankDoesntExistError);
  });

  it("fails to update a clip with invalid ranks", async () => {
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

  it("fails to create a clip with the same rank", async () => {
    const ctx = createInnerTRPCContext({
      session: {
        user: {
          id: "test-user-id",
        },
        expires: new Date().toISOString(),
      },
    });

    const mockClip = makeMockVideoClip();

    prismaMock.videoClip.create.mockResolvedValue(mockClip);

    const caller = appRouter.createCaller({ ...ctx, prisma: prismaMock });

    await expect(
      caller.videoClip.create({
        gameId: mockClip.gameId,
        title: mockClip.title,
        ytUrl: mockClip.ytUrl,
        fakeRank: "sameRank",
        realRank: "sameRank",
      })
    ).rejects.toThrowError(FakeRankSameAsRealRankError);
  });

  it("fails to update a clip with the same rank", async () => {
    const ctx = createInnerTRPCContext({
      session: {
        user: {
          id: "test-user-id",
        },
        expires: new Date().toISOString(),
      },
    });

    const mockClip = makeMockVideoClip({ userId: ctx.session?.user.id });

    prismaMock.videoClip.findUnique.mockResolvedValue(mockClip);
    prismaMock.gameRank.findUnique.mockResolvedValue({
      gameId: mockClip.gameId,
      maxElo: 1,
      minElo: 1,
      name: "sameRank",
    });
    prismaMock.videoClip.update.mockResolvedValue(mockClip);

    const caller = appRouter.createCaller({ ...ctx, prisma: prismaMock });

    await expect(
      caller.videoClip.update({
        newFakeRank: "sameRank",
        newRealRank: "sameRank",
        id: mockClip.id,
      })
    ).rejects.toThrowError(FakeRankSameAsRealRankError);
  });
});
