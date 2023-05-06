import { type NextPage } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import Link from "next/link";
import AuthButton from "~/components/util/AuthButton";

const Home: NextPage = () => {
  const { data } = useSession();

  const { data: games } = api.game.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const { data: totalScore } = api.stats.getTotalScore.useQuery(
    { id: data?.user.id ?? "0" },
    {
      enabled: data !== undefined,
      refetchOnWindowFocus: false,
      //Cached for infinity because we know exactly when this shld change and this can be an expensive query at scale
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
                <Link prefetch={false} href={`/games/${game.shortTitle}`}>
                  {game.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <AuthButton />
      </main>
    </>
  );
};

export default Home;
