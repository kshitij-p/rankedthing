import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useState } from "react";
import { type Game } from "@prisma/client";

const CreateClipForm = ({ id }: { id: Game["id"] }) => {
  const { status } = useSession();

  const [title, setTitle] = useState("");
  const [fakeRank, setFakeRank] = useState("");
  const [realRank, setRealRank] = useState("");
  const [ytUrl, setYtUrl] = useState("");

  const [clipToEdit, setClipToEdit] = useState("");

  const { mutate: createClip } = api.videoClip.create.useMutation();
  const { mutate: updateClip } = api.videoClip.update.useMutation();
  const { mutate: deleteClip } = api.videoClip.delete.useMutation();
  const { data: ranks } = api.game.getRanks.useQuery(
    { id },
    {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );
  const { data: clips } = api.game.getAllClips.useQuery(
    { id },
    {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );
  const { data: unvotedClips } = api.user.getAllUnvotedClips.useQuery(
    { id },
    {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      enabled: status === "authenticated",
    }
  );

  const { mutate: vote } = api.clipVote.vote.useMutation();

  return (
    <>
      <p>{unvotedClips && `${unvotedClips.length}`}</p>
      <p>{clips && `${clips.length}`}</p>

      <form
        className="mt-16"
        onSubmit={(e) => {
          e.preventDefault();
          createClip({ fakeRank, title, realRank, ytUrl, gameId: id });
        }}
      >
        <h1>Create clip</h1>
        Title{" "}
        <input
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />
        FakeRank{" "}
        <input
          value={fakeRank}
          onChange={(e) => setFakeRank(e.currentTarget.value)}
        />
        RealRank{" "}
        <input
          value={realRank}
          onChange={(e) => setRealRank(e.currentTarget.value)}
        />
        Yturl{" "}
        <input
          value={ytUrl}
          onChange={(e) => setYtUrl(e.currentTarget.value)}
        />
        <ul className="mt-4 max-h-16 overflow-y-auto">
          {ranks?.map((rank) => (
            <li key={rank.name}>
              <p>{rank.name}</p>
            </li>
          ))}
        </ul>
        <button type="submit">Create</button>
      </form>

      <div className="mt-16">
        All clips
        <ul>
          {clips?.map((clip) => (
            <li key={clip.id} className="flex flex-col">
              <p>Title {clip.title}</p>
              <p>Real rank {clip.realRankName}</p>
              <p>Fake rank {clip.fakeRankName}</p>
              <p>ytUrl {clip.ytUrl}</p>
              <p>id {clip.id}</p>
              <button
                onClick={() => vote({ guessedHigher: true, id: clip.id })}
              >
                Higher
              </button>
              <button
                onClick={() => vote({ guessedHigher: false, id: clip.id })}
              >
                Lower
              </button>
              <button onClick={() => deleteClip({ id: clip.id })}>
                delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form
        className="mt-16"
        onSubmit={(e) => {
          e.preventDefault();
          updateClip({
            id: clipToEdit,
            newFakeRank: fakeRank,
            newRealRank: realRank,
            newTitle: title,
            newYtUrl: ytUrl,
          });
        }}
      >
        <h1>Edit clip</h1>
        Clip to edit{" "}
        <input
          value={clipToEdit}
          onChange={(e) => setClipToEdit(e.currentTarget.value)}
        />
        <button>Edit</button>
      </form>
    </>
  );
};

const Home: NextPage = () => {
  const { status, data } = useSession();

  const { data: games } = api.game.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const { data: totalScore } = api.user.getTotalScore.useQuery(
    { id: data?.user.id ?? "0" },
    {
      enabled: data != undefined,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-dark-teal">
        {totalScore !== undefined && <p>Total score: {`${totalScore}`}</p>}
        <div>
          Games we support:
          <ul>
            {games?.map((game) => (
              <li key={game.id}>
                <p>{game.title}</p>
                <CreateClipForm id={game.id} />
              </li>
            ))}
          </ul>
        </div>
        <button
          className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          onClick={
            status === "authenticated"
              ? () => void signOut()
              : () => void signIn()
          }
        >
          {status === "authenticated" ? "Sign out" : "Sign in"}
        </button>
      </main>
    </>
  );
};

export default Home;
