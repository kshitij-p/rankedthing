import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

const userRouter = createTRPCRouter({
  promoteToAdmin: protectedProcedure
    .input(z.object({ secret: z.string().min(1) }))
    .mutation(
      async ({ ctx: { prisma, session }, input: { secret: inputSecret } }) => {
        if (inputSecret !== env.ADMIN_SECRET) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid admin secret",
          });
        }

        if (session.user.role !== UserRole.ADMIN) {
          await prisma.user.update({
            where: {
              id: session.user.id,
            },
            data: {
              role: UserRole.ADMIN,
            },
          });
        }

        return true;
      }
    ),
});

export default userRouter;
