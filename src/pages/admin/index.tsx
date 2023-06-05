import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import React from "react";
import ClipPlayer from "~/components/clips/ClipPlayer";
import Button from "~/components/ui/Button";
import PageSpinner from "~/components/ui/Loader/PageSpinner";
import ProtectedPage from "~/components/util/ProtectedPage";
import { api } from "~/utils/api";
import { TIME_IN_MS } from "~/utils/client";

const ClipApprovalPanel = () => {
  const { data: allPotentialClips } =
    api.videoClip.getAllPotentialClips.useQuery(undefined, {
      refetchOnWindowFocus: false,
      staleTime: TIME_IN_MS.FIVE_MINUTES,
    });

  return (
    <div className="flex flex-col">
      {allPotentialClips?.map((clip) => {
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
                <b className="font-semibold text-slate-300">Submitted by: </b>
                {clip.user.name}
              </p>
              <p>
                <b className="font-semibold text-slate-300">Submitted at: </b>
                {clip.submittedAt.toLocaleString()}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 md:justify-start md:gap-4">
                <Button className="text-lg" variants={{ type: "danger" }}>
                  Reject
                </Button>
                <Button className="text-lg" variants={{ type: "secondary" }}>
                  Approve
                </Button>
              </div>
            </div>
          </div>
        );
      })}
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
