import { type Game, Prisma, PrismaClient } from "@prisma/client";

const SUPPORTED_GAMES: Array<Omit<Game, "id">> = [
  {
    title: "Counter-Strike: Global Offensive",
  },
];

void (async function () {
  const prisma = new PrismaClient();

  // region -- Delete all existing games and reset the auto incrementer
  await prisma.game.deleteMany();

  //Reset the auto increment counter
  await prisma.$queryRaw(Prisma.sql`ALTER TABLE Game AUTO_INCREMENT = 1`);

  await prisma.game.createMany({
    data: SUPPORTED_GAMES,
  });

  await prisma.$disconnect();
})();

//To make isolated modules happy
export {};
