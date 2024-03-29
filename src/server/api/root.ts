import { createTRPCRouter } from "~/server/api/trpc";
import gameRouter from "./routers/gameRouter/gameRouter";
import userRouter from "./routers/userRouter/userRouter";
import clipVoteRouter from "./routers/clipVoteRouter/clipVoteRouter";
import videoClipRouter from "./routers/videoClipRouter/videoClipRouter";
import statsRouter from "./routers/statsRouter/statsRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  game: gameRouter,
  videoClip: videoClipRouter,
  user: userRouter,
  clipVote: clipVoteRouter,
  stats: statsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
