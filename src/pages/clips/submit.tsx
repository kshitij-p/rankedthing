import { createServerSideHelpers } from "@trpc/react-query/server";
import { type InferGetStaticPropsType, type GetStaticProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import Form from "~/components/ui/Form";
import ProtectedPage from "~/components/util/ProtectedPage";
import useForm from "~/hooks/useForm";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { api, type RouterOutputs } from "~/utils/api";
import { TIME_IN_SECS } from "~/utils/client";

export const getStaticProps: GetStaticProps<{
  games: RouterOutputs["game"]["getAll"];
}> = async () => {
  const helpers = createServerSideHelpers({
    ctx: createInnerTRPCContext({ session: null }),
    router: appRouter,
  });

  const games = await helpers.game.getAll.fetch();

  return {
    props: {
      games,
    },
    revalidate: TIME_IN_SECS.ONE_HOUR,
  };
};

const CreateClipSchema = z.object({
  title: z.string().min(1),
  ytUrl: z.string().min(1),
  realRank: z.string().min(1),
  fakeRank: z.string().min(1),
});

type CreateClipFormValues = z.infer<typeof CreateClipSchema>;

const ClipSubmitPage = ({
  games,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const form = useForm({ schema: CreateClipSchema });

  const [gameId, setGameId] = useState(games[0]?.id.toString() ?? "");
  const [newClipId, setNewClipId] = useState("");
  const parsedGameId = parseInt(gameId);

  const { data: gameRanks } = api.game.getRanks.useQuery(
    { gameId: parsedGameId },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      initialData: [],
      initialDataUpdatedAt: 0,
      //Game ranks arent expected to change frequently
      staleTime: Infinity,
      enabled: !isNaN(parsedGameId),
    }
  );

  const fakeRank = form.watch("fakeRank", "");
  const realRank = form.watch("realRank", "");

  const { mutate: createClip, isLoading } = api.videoClip.create.useMutation({
    onSuccess: (newClip) => {
      setNewClipId(newClip.id);
    },
  });

  const handleSubmit = (data: CreateClipFormValues) => {
    if (data.fakeRank === data.realRank) {
      form.setError("fakeRank", { message: "Cant be same as real rank" });
      form.setError("realRank", { message: "Cant be same as fake rank" });
      return;
    }
    createClip({ gameId: parsedGameId, ...data });
  };

  //When fake rank changes, update real rank to something else if they are the same
  useEffect(() => {
    const fakeRankIdx = gameRanks?.findIndex((rank) => rank.name === fakeRank);

    if (fakeRankIdx < 0) {
      return;
    }

    if (fakeRank === realRank) {
      form.setValue(
        "realRank",
        gameRanks[fakeRankIdx + 1 >= gameRanks.length ? 0 : fakeRankIdx + 1]
          ?.name ?? ""
      );
    }
  }, [fakeRank, realRank, form, gameRanks]);

  //Update real rank and fake rank whenever gameRanks change to prevent broken values from trying to be sent
  useEffect(() => {
    if (!gameRanks) {
      return;
    }
    form.setValue("fakeRank", gameRanks[0]?.name ?? "");
    form.setValue("realRank", gameRanks[1]?.name ?? "");
  }, [gameRanks, form]);

  return (
    <div>
      <Form form={form} onSubmit={handleSubmit} disabled={isLoading}>
        <div className="flex max-w-[15rem] flex-col gap-4">
          Title - This will not be shown to anyone, its just for your ref
          <input {...form.register("title")} />
          Game id
          <select
            value={gameId}
            onChange={(e) => setGameId(e.currentTarget.value)}
          >
            {games.map((game) => (
              <option value={game.id} key={game.id}>
                {game.title}
              </option>
            ))}
          </select>
          Fake Rank
          <select {...form.register("fakeRank")}>
            {gameRanks.map((gameRank) => (
              <option value={gameRank.name} key={gameRank.name}>
                {gameRank.name}
              </option>
            ))}
          </select>
          Real Rank
          <select {...form.register("realRank")}>
            {gameRanks.map((gameRank) => {
              return (
                <option
                  value={gameRank.name}
                  key={gameRank.name}
                  disabled={gameRank.name === fakeRank}
                >
                  {gameRank.name}
                </option>
              );
            })}
          </select>
          Yt url
          <input {...form.register("ytUrl")} />
          <button type="submit">Create</button>
        </div>
      </Form>
      {newClipId ? (
        <Link href={`/clips/${newClipId}`}>Success! Created your clip</Link>
      ) : null}
    </div>
  );
};

export default ProtectedPage(ClipSubmitPage);
