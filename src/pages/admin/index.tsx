import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import React from "react";
import ClipPlayer from "~/components/clips/ClipPlayer";
import RankImage from "~/components/ranks/RankImage";
import Button from "~/components/ui/Button";
import PageSpinner from "~/components/ui/Loader/PageSpinner";
import ProtectedPage from "~/components/util/ProtectedPage";
import { api } from "~/utils/api";
import { TIME_IN_MS } from "~/utils/client";

const ClipApprovalPanel = () => {
  const utils = api.useContext();

  const { mutate: rejectClip } = api.videoClip.rejectPotentialClip.useMutation({
    onMutate: async ({ id }) => {
      await utils.videoClip.getAllPotentialClips.cancel();

      const prevClips = utils.videoClip.getAllPotentialClips.getData();

      if (!prevClips) return;

      utils.videoClip.getAllPotentialClips.setData(
        undefined,
        prevClips.filter((clip) => clip.id !== id)
      );

      return { prevClips };
    },
    onSettled: () => {
      void utils.videoClip.getAllPotentialClips.invalidate();
    },
    onError: (err, clipId, ctx) => {
      if (!ctx?.prevClips) return;
      utils.videoClip.getAllPotentialClips.setData(undefined, ctx.prevClips);
    },
  });

  const { mutate: acceptClip } = api.videoClip.acceptPotentialClip.useMutation({
    onMutate: async ({ id }) => {
      await utils.videoClip.getAllPotentialClips.cancel();

      const prevClips = utils.videoClip.getAllPotentialClips.getData();

      if (!prevClips) return;

      utils.videoClip.getAllPotentialClips.setData(
        undefined,
        prevClips.filter((clip) => clip.id !== id)
      );

      return { prevClips };
    },
    onSettled: () => {
      void utils.videoClip.getAllPotentialClips.invalidate();
      void utils.game.getAllClips.invalidate();
      void utils.game.getAllUnvotedClips.invalidate();
      void utils.game.getUnvotedClip.invalidate();
    },
    onError: (err, clipId, ctx) => {
      if (!ctx?.prevClips) return;
      utils.videoClip.getAllPotentialClips.setData(undefined, ctx.prevClips);
    },
  });

  const { data: allPotentialClips } =
    api.videoClip.getAllPotentialClips.useQuery(undefined, {
      refetchOnWindowFocus: false,
      staleTime: TIME_IN_MS.FIVE_MINUTES,
    });

  return (
    <div className="flex flex-col gap-6 md:gap-14">
      {allPotentialClips ? (
        allPotentialClips.length > 0 ? (
          allPotentialClips.map((clip) => {
            return (
              <div className="flex flex-col gap-4 md:flex-row" key={clip.id}>
                <div className="aspect-video w-full max-w-sm xl:max-w-lg">
                  <ClipPlayer clip={clip} />
                </div>
                <div className="flex flex-col text-lg text-slate-400 md:gap-1 xl:text-xl">
                  <p>
                    <b className="font-semibold text-slate-300">ID: </b>
                    {clip.id}
                  </p>
                  <p>
                    <b className="font-semibold text-slate-300">Game: </b>
                    {clip.game.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <b className="font-semibold text-slate-300">Fake Rank: </b>
                    <RankImage
                      className="w-[25%] max-w-[8rem]"
                      game={clip.fakeRank.Game}
                      rankName={clip.fakeRank.name}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <b className="font-semibold text-slate-300">Real Rank: </b>
                    <RankImage
                      className="w-[25%] max-w-[8rem]"
                      game={clip.realRank.Game}
                      rankName={clip.realRank.name}
                    />
                  </div>
                  <p>
                    <b className="font-semibold text-slate-300">
                      Submitted by:{" "}
                    </b>
                    {clip.user.name}
                  </p>
                  <p>
                    <b className="font-semibold text-slate-300">
                      Submitted at:{" "}
                    </b>
                    {clip.submittedAt.toLocaleString()}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2 md:justify-start md:gap-4">
                    <Button
                      className="text-lg"
                      variants={{ type: "danger" }}
                      onClick={() => {
                        rejectClip({ id: clip.id });
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      className="text-lg"
                      variants={{ type: "secondary" }}
                      onClick={() => {
                        acceptClip({ id: clip.id });
                      }}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex w-full justify-center py-6 md:py-24">
            <b className="text-xl font-semibold md:text-3xl">
              No more potential clips left
            </b>
          </div>
        )
      ) : null}
    </div>
  );
};

const Content = () => {
  const { data, status } = useSession();

  if (status === "loading") return <PageSpinner />;

  if (status === "unauthenticated" || !data) {
    return <div>You must be logged in</div>;
  }

  if (data.user.role !== UserRole.ADMIN) {
    return <div>You must be an admin to use this panel</div>;
  }

  return (
    <div>
      <ClipApprovalPanel />
    </div>
  );
};

const AdminPage = () => {
  return (
    <div className="p-6 md:gap-8 md:p-10">
      <Content />
    </div>
  );
};

export default ProtectedPage(AdminPage);
