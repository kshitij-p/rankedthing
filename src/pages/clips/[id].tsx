import { createServerSideHelpers } from "@trpc/react-query/server";
import {
  type InferGetStaticPropsType,
  type GetStaticProps,
  type GetStaticPaths,
} from "next";
import { useSession } from "next-auth/react";
import { z } from "zod";
import PageWithFallback from "~/components/util/PageWithFallback";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { api, type RouterInputs, type RouterOutputs } from "~/utils/api";
import { getFromParam, TIME_IN_MS, TIME_IN_SECS } from "~/utils/client";

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
      {canVote ? "canVote" : "cant vote"}
      <fieldset className="group" disabled={votingDisabled}>
        <div className={"relative z-[1]"}>
          {votingDisabled && (
            <div className="absolute inset-0 z-10 h-full w-full group-disabled:backdrop-blur-[2px]">
              <p>
                {!canVote
                  ? "You have already voted on this clip"
                  : status === "unauthenticated"
                  ? "You must be logged in to vote"
                  : //To do add a spinner here
                    "Loading..."}
              </p>
            </div>
          )}

          <button
            onClick={() => handleVoting({ id: clip.id, guessedHigher: true })}
          >
            Higher
          </button>
          <button
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
  return (
    <div>
      {clip.title}
      <VotingArea clip={clip} />
    </div>
  );
};

export default PageWithFallback(GameClipPage);
