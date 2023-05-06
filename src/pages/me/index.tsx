import Link from "next/link";
import RankImage from "~/components/ranks/RankImage";
import ProtectedPage from "~/components/util/ProtectedPage";
import { api } from "~/utils/api";

const ProfilePage = () => {
  const { data: userVotes } = api.stats.getClipsHistory.useQuery(undefined, {
    staleTime: Infinity,
  });

  return (
    <div className="p-6 md:p-14 xl:px-28 xl:py-20">
      <div className="flex flex-col gap-6 md:gap-12">
        <h2 className="text-3xl font-bold md:text-5xl">Vote History</h2>
        <ul className="flex flex-col gap-5 md:gap-10">
          {userVotes?.map((vote) => {
            return (
              <li
                className="flex items-center gap-4 text-sm md:text-2xl"
                key={vote.id}
              >
                <RankImage
                  className="w-20 shrink-0 md:w-36"
                  rankName={vote.clip.fakeRankName}
                  game={vote.clip.game}
                />
                <div>
                  <Link
                    className="hover:text-teal-200 focus-visible:text-teal-200"
                    href={`/clips/${vote.clip.id}`}
                  >
                    <b>{vote.submittedAt.toDateString()}</b>
                  </Link>

                  <p className="text-sm text-neutral-400 md:text-xl">
                    Score: {vote.score}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ProtectedPage(ProfilePage);
