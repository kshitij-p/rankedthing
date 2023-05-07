import { createServerSideHelpers } from "@trpc/react-query/server";
import {
  type InferGetStaticPropsType,
  type GetStaticProps,
  type GetStaticPaths,
} from "next";
import { useSession } from "next-auth/react";
import React, { useMemo } from "react";
import { z } from "zod";
import RankImage from "~/components/ranks/RankImage";
import Button from "~/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/Dialog";
import { DialogClose, DialogFooter } from "~/components/ui/Dialog/Dialog";
import AuthButton from "~/components/util/AuthButton";
import PageWithFallback from "~/components/util/PageWithFallback";
import { cn } from "~/lib/utils";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { api, type RouterInputs, type RouterOutputs } from "~/utils/api";
import { getFromParam, TIME_IN_MS, TIME_IN_SECS } from "~/utils/client";

const getEmbedUrl = (url: string) => {
  const id = url.split("?v=")?.[1] ?? url.split("shorts/")?.[1];

  if (!id) {
    return null;
  }

  return `https://www.youtube-nocookie.com/embed/${id}`;
};

const HowItWorksDialog = () => {
  return (
    <Dialog>
      <DialogTrigger className="text-lg text-neutral-700 underline underline-offset-4 transition hover:text-slate-400 focus:outline-0 focus-visible:text-slate-400 md:text-3xl md:underline-offset-8">
        How it works
      </DialogTrigger>
      <DialogContent className="flex h-auto max-h-max flex-col gap-4">
        <DialogHeader className="text-3xl">
          <b>How it works</b>
        </DialogHeader>
        <div className="text-lg text-slate-200">
          <p>
            The rank visible to you before you cast a vote is{" "}
            <b className="italic underline underline-offset-4">fake</b> and you
            must guess whether the person
            {"'"}s real rank is higher or lower. <br /> <br /> If you guess
            correctly you get points otherwise you get none. The real rank of
            the person is revealed after you vote.
          </p>
        </div>
        <DialogFooter className="mt-auto self-center">
          <DialogClose asChild>
            <Button variants={{ type: "secondary" }}>Ok got it</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
      enabled: status === "authenticated",
      staleTime: TIME_IN_MS.ONE_MINUTE,
    }
  );

  const { mutate: vote, isLoading: isLoadingVote } =
    api.clipVote.vote.useMutation({
      onSettled: () => {
        void utils.clipVote.getVoteForClip.invalidate({ clipId: clip.id });

        void utils.game.getUnvotedClip.invalidate({ gameId: clip.gameId });
        void utils.game.getAllUnvotedClips.invalidate();

        void utils.stats.invalidate();
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
    <div className="mt-2 flex w-full flex-col items-center gap-3 md:mt-4 md:gap-6">
      <p className="self-center">{"Player's real rank is"}</p>

      <div
        className={cn(
          "relative z-[1] flex items-start justify-center",
          existingVote && "min-h-[5rem] md:min-h-[6rem]"
        )}
      >
        {votingDisabled && (
          <div className="item-center absolute inset-0 z-10 flex h-full w-full justify-center bg-neutral-1000/60 backdrop-blur-[2px]">
            <div className="inline-flex items-center justify-center text-center text-lg font-bold text-slate-300 md:text-2xl">
              {status === "unauthenticated" ? (
                <AuthButton variants={{ type: "primary" }} />
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
              className="text-xl md:px-10 md:py-8 md:text-4xl"
              variants={{ size: "lg", type: "secondary" }}
              onClick={() => handleVoting({ id: clip.id, guessedHigher: true })}
            >
              Higher
            </Button>
            <Button
              className="text-xl md:px-10 md:py-8 md:text-4xl"
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
                allowFullScreen
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-popups allow-same-origin allow-scripts allow-presentation"
                src={getEmbedUrl(clip.ytUrl) ?? ""}
              />
            ) : (
              <b>This link is broken sadge ;-;</b>
            )}
          </div>
          <HowItWorksDialog />
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
