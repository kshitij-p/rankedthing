import { type Game } from "@prisma/client";
import { createServerSideHelpers } from "@trpc/react-query/server";
import clsx from "clsx";
import {
  type InferGetStaticPropsType,
  type GetStaticProps,
  type GetStaticPaths,
} from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { type ForwardedRef, useMemo } from "react";
import { z } from "zod";
import Button from "~/components/ui/Button";
import AuthButton from "~/components/util/AuthButton";
import PageWithFallback from "~/components/util/PageWithFallback";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { api, type RouterInputs, type RouterOutputs } from "~/utils/api";
import { getFromParam, TIME_IN_MS, TIME_IN_SECS } from "~/utils/client";

const getEmbedUrl = (url: string) => {
  const id = url.split("?v=")?.[1];

  if (!id) {
    return null;
  }

  return `https://www.youtube.com/embed/${id}`;
};

const RankImage = React.forwardRef(
  (
    {
      rankName,
      game,
      className,
      ...rest
    }: React.ComponentProps<"div"> & {
      game: Omit<Partial<Game>, "shortTitle" | "title"> &
        Pick<Game, "shortTitle" | "title">;
      rankName: string;
    },
    passedRef: ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <div
        {...rest}
        className={clsx("relative aspect-video", className)}
        ref={passedRef}
      >
        <Image
          className="object-contain"
          src={`/images/${game.shortTitle}/ranks/${rankName}.png`}
          alt={`Icon of ${rankName} - a rank in ${game.shortTitle}`}
          fill
        />
      </div>
    );
  }
);

RankImage.displayName = "RankImage";

type PageClip = Omit<
  RouterOutputs["videoClip"]["getById"],
  "updatedAt" | "submittedAt"
> & {
  updatedAt: string;
  submittedAt: string;
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<{
  clip: PageClip;
}> = async (ctx) => {
  const id = getFromParam({ key: "id", ctx, schema: z.string() });

  const caller = createServerSideHelpers({
    ctx: createInnerTRPCContext({ session: null }),
    router: appRouter,
  });

  const clip = await caller.videoClip.getById.fetch({ clipId: id });

  return {
    props: {
      clip: {
        ...clip,
        updatedAt: JSON.stringify(clip.updatedAt),
        submittedAt: JSON.stringify(clip.submittedAt),
      },
    },
    revalidate: TIME_IN_SECS.ONE_HOUR,
  };
};

const VotingArea = ({ clip }: { clip: PageClip }) => {
  const utils = api.useContext();

  const { data: sessionData, status } = useSession();

  const { data: existingVote } = api.clipVote.getVoteForClip.useQuery(
    { clipId: clip.id },
    {
      staleTime: TIME_IN_MS.ONE_MINUTE,
    }
  );

  const { mutate: vote, isLoading: isLoadingVote } =
    api.clipVote.vote.useMutation({
      onSettled: () => {
        void utils.clipVote.getVoteForClip.invalidate({ clipId: clip.id });
      },
    });

  const clipOwnedByUser = clip.userId === sessionData?.user.id;

  const votingDisabled =
    !sessionData || clipOwnedByUser || isLoadingVote || existingVote !== null;

  const handleVoting = (voteData: RouterInputs["clipVote"]["vote"]) => {
    if (votingDisabled) {
      return;
    }
    vote(voteData);
  };

  return (
    <div className="flex w-full flex-col items-center gap-3 md:gap-6">
      <p className="self-center">{"Player's real rank is"}</p>

      <div
        className={
          "relative z-[1] flex min-h-[5rem] items-start justify-center md:min-h-[6rem]"
        }
      >
        {votingDisabled && (
          <div className="item-center absolute inset-0 z-10 flex h-full w-full justify-center bg-neutral-1000/60 backdrop-blur-[2px]">
            <div className="inline-flex items-center justify-center text-center text-lg font-bold text-slate-300 md:text-2xl">
              {status === "unauthenticated" ? (
                <AuthButton />
              ) : existingVote ? (
                <div className="flex flex-col items-center font-normal">
                  <RankImage
                    className="w-16 md:w-24"
                    game={clip.game}
                    rankName={clip.realRankName}
                  />
                  <p>{`Your score: ${existingVote.score}`}</p>
                  <p>{`You guessed ${
                    existingVote.guessedHigher ? "higher" : "lower"
                  }`}</p>
                </div>
              ) : clipOwnedByUser ? (
                "Can't vote on your own clip!"
              ) : (
                //To do add a spinner here
                "Loading..."
              )}
            </div>
          </div>
        )}

        <fieldset disabled={votingDisabled}>
          <div className={"flex items-center justify-center gap-6 md:gap-14"}>
            <Button
              className="text-xl md:px-10 md:py-9 md:text-4xl"
              variants={{ size: "lg", type: "secondary" }}
              onClick={() => handleVoting({ id: clip.id, guessedHigher: true })}
            >
              Higher
            </Button>
            <Button
              className="text-xl md:px-10 md:py-9 md:text-4xl"
              variants={{ size: "lg", type: "secondary" }}
              onClick={() =>
                handleVoting({ id: clip.id, guessedHigher: false })
              }
            >
              Lower
            </Button>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

const GameClipPage = ({
  clip,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const embedUrl = useMemo(() => getEmbedUrl(clip.ytUrl), [clip.ytUrl]);

  return (
    <div className="p-6 pt-12 md:p-14 md:pt-28">
      <div className="flex flex-col items-center gap-4 text-2xl text-slate-200 md:gap-6 md:text-4xl">
        <h3 className="text-3xl font-extrabold md:text-5xl">{`Higher or Lower`}</h3>
        <div className="mt-2 flex flex-col items-center gap-1 md:mt-4 md:gap-2">
          <div className="flex aspect-video w-[50rem] max-w-[75vw] items-center justify-center">
            {embedUrl ? (
              <iframe
                className="h-full w-full"
                src={getEmbedUrl(clip.ytUrl) ?? ""}
              />
            ) : (
              <b>This link is broken sadge ;-;</b>
            )}
          </div>
          <p className="text-lg text-slate-500 md:text-3xl">How it works</p>
        </div>
        <div className="flex flex-col items-center self-center">
          <RankImage
            className="w-28 md:w-44"
            game={clip.game}
            rankName={clip.fakeRankName}
          />
          <p className="text-xl text-slate-300 md:text-3xl">
            {clip.fakeRankName}
          </p>
        </div>
        <VotingArea clip={clip} />
      </div>
    </div>
  );
};

export default PageWithFallback(GameClipPage);
