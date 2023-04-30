import { createTRPCRouter } from "~/server/api/trpc";
import gameRouter from "./routers/gameRouter/gameRouter";
import videoClipRouter from "./routers/videoClipRouter/videoClipRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  game: gameRouter,
  videoClip: videoClipRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
