import { createServerSideHelpers } from "@trpc/react-query/server";
import {
  type InferGetStaticPropsType,
  type GetStaticProps,
  type GetStaticPaths,
} from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useMemo } from "react";
import { z } from "zod";
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
  const { data: sessionData, status } = useSession();

  const { data: canVote } = api.clipVote.canVoteOn.useQuery(
    { clipId: clip.id },
    {
      staleTime: TIME_IN_MS.ONE_MINUTE,
    }
  );

  const { mutate: vote, isLoading: isLoadingVote } =
    api.clipVote.vote.useMutation();

  const votingDisabled = !sessionData || isLoadingVote || !canVote;

  const handleVoting = (voteData: RouterInputs["clipVote"]["vote"]) => {
    if (votingDisabled) {
      return;
    }
    vote(voteData);
  };

  return (
    <div>
      <fieldset className="group" disabled={votingDisabled}>
        <div className={"relative z-[1] flex justify-evenly"}>
          {votingDisabled && (
            <div className="item-center absolute inset-0 z-10 flex h-full w-full justify-center backdrop-blur-[3px] ">
              <b className="">
                {!canVote
                  ? "You have already voted on this clip"
                  : status === "unauthenticated"
                  ? "You must be logged in to vote"
                  : //To do add a spinner here
                    "Loading..."}
              </b>
            </div>
          )}
          <button
            className="text-2xl"
            onClick={() => handleVoting({ id: clip.id, guessedHigher: true })}
          >
            Higher
          </button>
          <button
            className="text-2xl"
            onClick={() => handleVoting({ id: clip.id, guessedHigher: false })}
          >
            Lower
          </button>
        </div>
      </fieldset>
    </div>
  );
};

const GameClipPage = ({
  clip,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const embedUrl = useMemo(() => getEmbedUrl(clip.ytUrl), [clip.ytUrl]);

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 text-lg">
        <h3 className="text-xl font-bold">{clip.game.title}</h3>
        <div className="flex aspect-video w-[38rem] max-w-[75vw] items-center justify-center self-center">
          {embedUrl ? (
            <iframe
              className="h-full w-full"
              src={getEmbedUrl(clip.ytUrl) ?? ""}
            />
          ) : (
            <b>This link is broken sadge ;-;</b>
          )}
        </div>

        {/* <p>{clip.fakeRankName}</p> */}
        <div className="relative aspect-square w-16 self-center object-contain">
          <Image
            src={"/images/csgo/ranks/Gold Nova III.png"}
            alt={"gold nova"}
            fill
          />
        </div>
        <b>{"Player's real rank is"} </b>
        <VotingArea clip={clip} />
      </div>
    </div>
  );
};

export default PageWithFallback(GameClipPage);
