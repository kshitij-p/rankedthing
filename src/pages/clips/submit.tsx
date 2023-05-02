import { createServerSideHelpers } from "@trpc/react-query/server";
import { type InferGetStaticPropsType, type GetStaticProps } from "next";
import { useState } from "react";
import { z } from "zod";
import Form from "~/components/ui/Form";
import ProtectedPage from "~/components/util/ProtectedPage";
import useForm from "~/hooks/useForm";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { api, type RouterOutputs } from "~/utils/api";
import { TIME_IN_MS, TIME_IN_SECS } from "~/utils/client";

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
  const parsedGameId = parseInt(gameId);

  const { data: gameRanks } = api.game.getRanks.useQuery(
    { gameId: parsedGameId },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      initialData: [],
      initialDataUpdatedAt: 0,
      staleTime: TIME_IN_MS.FIVE_MINUTES,
      enabled: !isNaN(parsedGameId),
    }
  );

  const { mutate: createClip, isLoading } = api.videoClip.create.useMutation();

  const handleSubmit = (data: CreateClipFormValues) => {
    createClip({ gameId: parsedGameId, ...data });
  };

  //To do add a state on success to go to the clip

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
            {gameRanks.map((gameRank) => (
              <option value={gameRank.name} key={gameRank.name}>
                {gameRank.name}
              </option>
            ))}
          </select>
          Yt url
          <input {...form.register("ytUrl")} />
          <button type="submit">Create</button>
        </div>
      </Form>
    </div>
  );
};

export default ProtectedPage(ClipSubmitPage);
