import { expect, it, beforeEach, describe } from "vitest";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { mockClear, mockDeep } from "vitest-mock-extended";
import type { GameRank, PrismaClient, VideoClip } from "@prisma/client";

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

    const mockOutput: VideoClip = {
      fakeRankName: "diffRank",
      realRankName: "diffRank",
      gameId: 1,
      id: "1",
      submittedAt: new Date(),
      updatedAt: new Date(),
      title: "title",
      userId: ctx.session?.user.id ?? "",
      ytUrl: "url",
    };

    prismaMock.gameRank.findUnique.mockResolvedValue({
      gameId: 1,
      name: "rank",
      maxElo: 1,
      minElo: 1,
    } satisfies GameRank);

    prismaMock.videoClip.create.mockResolvedValue(mockOutput);

    const caller = appRouter.createCaller({ ...ctx, prisma: prismaMock });

    await expect(
      caller.videoClip.create({
        gameId: mockOutput.gameId,
        fakeRank: mockOutput.fakeRankName,
        realRank: mockOutput.realRankName,
        title: mockOutput.title,
        ytUrl: mockOutput.ytUrl,
      })
    ).rejects.toThrow();
  });
});
