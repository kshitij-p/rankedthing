import { createServerSideHelpers } from "@trpc/react-query/server";
import { type InferGetStaticPropsType, type GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { z } from "zod";
import Button from "~/components/ui/Button";
import Form from "~/components/ui/Form";
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

const GetClipSchema = z.object({
  gameId: z.string(),
});

const ClipsIndexPage = ({
  games,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();

  const form = useForm({
    schema: GetClipSchema,
  });

  const gameId = parseInt(form.watch("gameId"));

  const [queryEnabled, setQueryEnabled] = useState(false);

  const { isLoading, isFetching } = api.game.getUnvotedClip.useQuery(
    { gameId },
    {
      enabled: queryEnabled,
      initialData: null,
      initialDataUpdatedAt: 0,
      staleTime: TIME_IN_MS.FIVE_MINUTES,
      onSettled: (clip) => {
        setQueryEnabled(false);

        if (clip) {
          void router.push(`/clips/${clip.id}`);
        }
      },
    }
  );

  const handleGet = () => {
    setQueryEnabled(true);
  };

  return (
    <div>
      <Form form={form} onSubmit={handleGet} disabled={isLoading || isFetching}>
        <div className="flex flex-col">
          <select {...form.register("gameId")}>
            {games.map((game) => {
              return (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              );
            })}
          </select>
          <Button variants={{ type: "secondary" }}>Get a random clip</Button>
        </div>
      </Form>
    </div>
  );
};

export default ClipsIndexPage;
