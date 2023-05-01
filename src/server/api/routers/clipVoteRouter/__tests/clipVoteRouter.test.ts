import { it, expect } from "vitest";
import { getScore, rankIsGTE, rankIsLTE } from "../clipVoteRouter";

it("compares ranks correctly", () => {
  //LTE shld RanksOne's maxElo <= RankTwo's minElo
  expect(rankIsLTE({ maxElo: 5, minElo: 3 }, { maxElo: 10, minElo: 5 })).toBe(
    true
  );
  expect(rankIsLTE({ maxElo: 5, minElo: 3 }, { maxElo: 10, minElo: 7 })).toBe(
    true
  );
  expect(rankIsLTE({ maxElo: 5, minElo: 3 }, { maxElo: 10, minElo: 4 })).toBe(
    false
  );

  //GTE shld RanksOne's minElo >= RankTwo's maxElo
  expect(rankIsGTE({ maxElo: 10, minElo: 6 }, { maxElo: 6, minElo: 1 })).toBe(
    true
  );
  expect(rankIsGTE({ maxElo: 10, minElo: 7 }, { maxElo: 6, minElo: 1 })).toBe(
    true
  );
  expect(rankIsGTE({ maxElo: 10, minElo: 7 }, { maxElo: 8, minElo: 1 })).toBe(
    false
  );
});

it("calculates scores correctly", () => {
  //If FakeRank's minElo is HIGHER OR EQUAL to RealRank's max elo and guessedHigher, score should be 0
  expect(
    getScore({
      fakeRank: { maxElo: 5, minElo: 3 },
      realRank: { maxElo: 3, minElo: 2 },
      guessedHigher: true,
    })
  ).toBe(0);

  //If FakeRank's minElo is HIGHER OR EQUAL to RealRank's max elo and NOT guessedHigher, score should NOT be 0
  expect(
    getScore({
      fakeRank: { maxElo: 5, minElo: 3 },
      realRank: { maxElo: 3, minElo: 2 },
      guessedHigher: false,
    })
  ).not.toBe(0);

  //If FakeRank's maxElo is LESS OR EQUAL to RealRank's minElo and guessedHigher, score should NOT be 0
  expect(
    getScore({
      fakeRank: { maxElo: 3, minElo: 2 },
      realRank: { maxElo: 5, minElo: 3 },
      guessedHigher: true,
    })
  ).not.toBe(0);

  //If FakeRank's maxElo is LESS OR EQUAL to RealRank's minElo and NOT guessedHigher, score should be 0
  expect(
    getScore({
      fakeRank: { maxElo: 3, minElo: 2 },
      realRank: { maxElo: 5, minElo: 3 },
      guessedHigher: false,
    })
  ).toBe(0);
});
