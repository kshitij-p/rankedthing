import {
  type InferGetStaticPropsType,
  type GetStaticProps,
  type GetStaticPaths,
} from "next";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import { api, type RouterOutputs } from "~/utils/api";
import { useSession } from "next-auth/react";
import AuthButton from "~/components/util/AuthButton";
import { TIME_IN_MS, TIME_IN_SECS } from "~/utils/client";
import Link from "next/link";
import { z } from "zod";
import { type Game } from "@prisma/client";

export const getStaticPaths: GetStaticPaths = async () => {
  const caller = createServerSideHelpers({
    ctx: createInnerTRPCContext({ session: null }),
    router: appRouter,
  });

  const games = await caller.game.getAll.fetch();

  return {
    paths: games.map((game) => ({ params: { shortTitle: game.shortTitle } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<{
  game: RouterOutputs["game"]["getByShortTitle"];
}> = async (ctx) => {
  //To do add error page for handling this error
  const shortTitle = z.string().parse((ctx.params?.shortTitle as string) ?? "");

  const caller = createServerSideHelpers({
    ctx: createInnerTRPCContext({ session: null }),
    router: appRouter,
  });

  const game = await caller.game.getByShortTitle.fetch({ shortTitle });

  return {
    props: {
      game,
    },
    revalidate: TIME_IN_SECS.ONE_HOUR,
  };
};

const ProtectedArea = ({ game }: { game: Game }) => {
  const {
    isLoading,
    isFetching,
    data: unvotedClip,
  } = api.game.getUnvotedClip.useQuery(
    { gameId: game.id },
    {
      staleTime: TIME_IN_MS.FIVE_MINUTES,
    }
  );

  return (
    <div>
      <div>
        {!isFetching && !isLoading ? (
          <p>
            {unvotedClip ? (
              <Link href={""}>Get a random clip</Link>
            ) : (
              "No more clips available for this game ;-;"
            )}
          </p>
        ) : (
          "Loading.."
        )}
      </div>
      <Link href={`/clips/submit`}>Submit your clip</Link>
    </div>
  );
};

const GamePage = ({ game }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { status, data } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{game.title}</h2>

      {data?.user.id ? <ProtectedArea game={game} /> : <AuthButton />}
    </div>
  );
};

export default GamePage;
