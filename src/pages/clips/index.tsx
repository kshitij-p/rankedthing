import { createServerSideHelpers } from "@trpc/react-query/server";
import { type InferGetStaticPropsType, type GetStaticProps } from "next";
import Link from "~/components/ui/Link";
import { useRouter } from "next/router";
import React, { useState, useRef } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";
import GameGridSelect from "~/components/GameGridSelect";
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
  gameId: z.string().min(1),
});

const ClipsIndexPage = ({
  games,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();

  const form = useForm({
    schema: GetClipSchema,

    criteriaMode: "all",
  });
  const noMoreClipsAvailableErr = form.formState.errors.root;

  const gameId = parseInt(form.watch("gameId"));

  const [queryEnabled, setQueryEnabled] = useState(false);

  const noClipsForGamesRef = useRef<Set<number>>(new Set());

  const {
    isLoading,
    isFetching,
    data: videoClip,
  } = api.game.getUnvotedClip.useQuery(
    { gameId },
    {
      enabled: queryEnabled,
      initialData: null,
      initialDataUpdatedAt: 0,
      staleTime: TIME_IN_MS.FIVE_MINUTES,
      onSettled: (clip, err) => {
        if (err) {
          return;
        }
        setQueryEnabled(false);

        if (clip) {
          void router.push(`/clips/${clip.id}`);
        } else {
          form.setError("root", {
            type: "404",
            message: "No more clips available for this game",
          });
          noClipsForGamesRef.current.add(gameId);
        }
      },
    }
  );

  const handleGet = () => {
    //Handle cached resp
    if (noMoreClipsAvailableErr) {
      return;
    }
    if (videoClip) {
      void router.push(`/clips/${videoClip.id}`);
      return;
    }
    setQueryEnabled(true);
  };

  return (
    <div className="p-6 md:p-10">
      <Form form={form} onSubmit={handleGet} disabled={isLoading || isFetching}>
        <div className="flex flex-col items-center gap-4 md:gap-10">
          <div className="flex flex-col items-center gap-1">
            <h2 className="self-center text-xl md:text-3xl">
              <b>Get clips of</b>
            </h2>
          </div>

          <Controller
            name={"gameId"}
            rules={{ required: true }}
            control={form.control}
            render={({ field }) => {
              return (
                <GameGridSelect
                  {...field}
                  value={field.value}
                  onChange={(gameId) => {
                    field.onChange(gameId);
                    if (noClipsForGamesRef.current.has(parseInt(gameId))) {
                      form.setError("root", {
                        type: "404",
                        message: "No more clips available for this game",
                      });
                    } else {
                      form.clearErrors("root");
                    }
                  }}
                  games={games}
                />
              );
            }}
          />
          {noMoreClipsAvailableErr ? (
            <b className="text-sm text-red-500 md:text-xl xl:text-3xl">
              {noMoreClipsAvailableErr.message}
            </b>
          ) : null}

          <div className="mt-3 flex flex-col items-center gap-2 md:gap-4">
            <Button
              className="mt-4 max-w-max text-base md:mt-8 md:px-6 md:py-8 md:text-3xl "
              type="submit"
              disabled={noMoreClipsAvailableErr !== undefined}
              variants={{ type: "secondary" }}
            >
              Get a clip
            </Button>
            <strong className="text-xs italic md:text-base">or</strong>
            <Link className="text-sm md:text-lg" href={"/clips/submit"}>
              Post your own clip
            </Link>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default ClipsIndexPage;