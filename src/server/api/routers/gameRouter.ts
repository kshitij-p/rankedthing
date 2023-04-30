import { createTRPCRouter, publicProcedure } from "../trpc";

const gameRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.game.findMany();
  }),
});

export default gameRouter;
