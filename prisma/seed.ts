import { Prisma, PrismaClient } from "@prisma/client";
import { SUPPORTED_GAMES, validateSupportedGames } from "./seedUtils";

void (async function () {
  if (!validateSupportedGames()) {
    return;
  }

  const prisma = new PrismaClient();

  // region -- Delete all existing games and reset the auto incrementer
  await prisma.game.deleteMany();

  await prisma.gameRank.deleteMany();

  //Reset the auto increment counter
  await prisma.$queryRaw(Prisma.sql`ALTER TABLE Game AUTO_INCREMENT = 1`);

  await Promise.all(
    SUPPORTED_GAMES.map((game) => prisma.game.create({ data: game }))
  );

  await prisma.$disconnect();
})();

//To make isolated modules happy
export {};
