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
import { getFromParam, TIME_IN_MS, TIME_IN_SECS } from "~/utils/client";
import Link from "~/components/ui/Link";
import { z } from "zod";
import PageWithFallback from "~/components/util/PageWithFallback";
import Image from "next/image";
import Button from "~/components/ui/Button";
import { useState } from "react";
import { useRouter } from "next/router";
import { ErrorTextPrimitive } from "~/components/ui/ErrorText/ErrorText";

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
  const shortTitle = getFromParam({
    key: "shortTitle",
    ctx,
    schema: z.string(),
  });

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

const GamePage = ({ game }: InferGetStaticPropsType<typeof getStaticProps>) => {
  console.log(game);
  const { status } = useSession();
  const router = useRouter();

  const isLoggedIn = status === "authenticated";

  const [noMoreClips, setNoMoreClips] = useState(false);

  const { data: totalClips } = api.stats.getClipsCountForGame.useQuery(
    { gameId: game.id },
    {
      staleTime: TIME_IN_MS.FIVE_MINUTES,
    }
  );

  const { data: votedClips } = api.stats.getVotedClipsCountForGame.useQuery(
    { gameId: game.id },
    {
      enabled: isLoggedIn,
      staleTime: TIME_IN_MS.FIVE_MINUTES,
    }
  );

  const { refetch } = api.game.getUnvotedClip.useQuery(
    {
      gameId: game.id,
    },
    {
      enabled: false,
      initialData: null,
      initialDataUpdatedAt: 0,
      staleTime: Infinity,
    }
  );

  const { data: scoreForGame } = api.stats.getScoreForGame.useQuery(
    { gameId: game.id },
    {
      enabled: isLoggedIn,
      staleTime: TIME_IN_MS.FIVE_MINUTES,
    }
  );

  const stats = [
    { name: "Total Clips", value: `${totalClips ?? "??"}` },

    {
      name: "Clips watched",
      value: `${votedClips ?? "??"}`,
    },
    {
      name: "Points scored",
      value: scoreForGame ?? "??",
    },
  ];

  const handleGetClip = () => {
    void (async function () {
      const { data: videoClip } = await refetch({ stale: false });
      if (videoClip) {
        void router.push(`/clips/${videoClip.id}`);
      } else {
        setNoMoreClips(true);
      }
    })();
  };

  return (
    <div className="px-6 py-8 md:px-14 md:py-16">
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col items-start gap-4 md:gap-4">
          <div className="relative aspect-[2/3] w-48 self-center md:w-60 xl:w-72">
            <Image
              className="object-cover"
              src={`/images/${game.shortTitle}/banner.jpg`}
              alt={`A banner image of ${game.title}`}
              fill
            />
          </div>
          <h2 className="text-start text-3xl font-bold md:text-4xl">
            {game.title}
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          {stats.map((stat, index) => {
            return (
              <p
                className="flex items-center gap-2 text-xl text-neutral-400 md:text-2xl"
                key={index}
              >
                <b className="font-semibold text-neutral-300">{stat.name}:</b>
                {stat.value}
              </p>
            );
          })}
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="relative mt-3 flex flex-col items-center gap-2 md:gap-4">
            {!isLoggedIn && (
              <div className="absolute inset-0 isolate z-[1] flex h-[105%] w-[105%] items-center justify-center bg-slate-900/10 backdrop-blur-[2px]">
                <AuthButton variants={{ type: "primary", size: "md" }} />
              </div>
            )}
            <ErrorTextPrimitive className="text-sm text-red-500 md:text-xl xl:text-3xl">
              {noMoreClips && "No more clips available"}
            </ErrorTextPrimitive>
            <Button
              disabled={noMoreClips}
              className="mt-4 max-w-max text-xl md:mt-8 md:px-6 md:py-8 md:text-3xl "
              variants={{ type: "secondary" }}
              onClick={handleGetClip}
            >
              Get a clip
            </Button>
            <strong className="text-sm italic md:text-base">or</strong>
            <Link
              disabled={!isLoggedIn}
              className="text-base md:text-lg"
              href={"/clips/submit"}
            >
              Post your own clip
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageWithFallback(GamePage);
