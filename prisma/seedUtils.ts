import { type Prisma } from "@prisma/client";
import { existsSync } from "fs";
import path from "path";

export const SUPPORTED_GAMES: Array<Prisma.GameCreateInput> = [
  {
    title: "Counter-Strike: Global Offensive",
    shortTitle: "csgo",
    ranks: {
      createMany: {
        data: [
          { name: "Silver", minElo: 1, maxElo: 6 },
          { name: "Gold Nova", minElo: 7, maxElo: 10 },
          { name: "Master Guardian", minElo: 11, maxElo: 13 },
          { name: "Distinguished Master Guardian", minElo: 14, maxElo: 14 },
          { name: "Legendary Eagle", minElo: 15, maxElo: 16 },
          { name: "Supreme Master First Class", minElo: 17, maxElo: 17 },
          { name: "Global Elite", minElo: 18, maxElo: 18 },
        ],
      },
    },
  },
];

export const validateSupportedGames = () => {
  let isValid = true;
  for (const game of SUPPORTED_GAMES) {
    if (!game.ranks?.createMany?.data) {
      console.error(`Ranks not defined for ${game.title}`);
      isValid = false;
      continue;
    }

    (game.ranks.createMany.data as Array<Prisma.GameRankCreateInput>).forEach(
      (rank) => {
        if (rank.maxElo < rank.minElo) {
          console.error(
            `Rank ${rank.name} has maxElo ${rank.maxElo} < minElo ${rank.minElo} for ${game.shortTitle}`
          );
          isValid = false;
        }

        const imageName = path.resolve(
          "public",
          "images",
          game.shortTitle,
          "ranks",
          `${rank.name}.png`
        );

        if (!existsSync(imageName)) {
          console.error(
            `Rank ${rank.name} doesn't have an image. Please create ${imageName}`
          );
          isValid = false;
        }
      }
    );
  }
  return isValid;
};
