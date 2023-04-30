import { Prisma, PrismaClient } from "@prisma/client";

const SUPPORTED_GAMES: Array<Prisma.GameCreateInput> = [
  {
    title: "Counter-Strike: Global Offensive",
    ranks: {
      createMany: {
        data: [
          "Silver I",
          "Silver II",
          "Silver III",
          "Silver IV",
          "Silver Elite",
          "Silver Elite Master",
          "Gold Nova I",
          "Gold Nova II",
          "Gold Nova III",
          "Gold Nova Master",
          "Master Guardian I",
          "Master Guardian II",
          "Master Guardian Elite",
          "Distinguished Master Guardian",
          "Legendary Eagle",
          "Legendary Eagle Master",
          "Supreme Master First Class",
          "Global Elite",
        ].map((name, idx) => ({
          name,
          minElo: idx + 1,
          maxElo: idx + 1,
        })),
      },
    },
  },
];

void (async function () {
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
