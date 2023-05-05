import { type Game } from "@prisma/client";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { type InferGetStaticPropsType, type GetStaticProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { type ForwardedRef, useState, useRef } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";
import Button from "~/components/ui/Button";
import Form from "~/components/ui/Form";
import NoiseFilter from "~/components/util/NoiseFilter";
import useForm from "~/hooks/useForm";
import { cn } from "~/lib/utils";
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

const GameGridSelect = React.forwardRef(
  (
    {
      games,
      value,
      onChange,
    }: {
      games: Game[];
      value: string;
      onChange: (gameId: string) => void;
    },
    passedRef: ForwardedRef<HTMLDivElement>
  ) => {
    const renderItem = (
      game: Game & {
        comingSoon?: boolean;
      }
    ) => {
      return (
        <RadioGroup.RadioGroupItem
          disabled={game.comingSoon}
          className={
            "group relative aspect-[2/3] w-24 rounded-lg shadow shadow-black/50 md:w-[10.5rem] md:rounded-xl xl:w-60"
          }
          value={`${game.id}`}
          key={game.id}
        >
          <RadioGroup.RadioGroupIndicator className="after:z-1 absolute inset-0 z-10 flex aspect-square h-full w-full flex-col items-center justify-center gap-1 rounded-[inherit] bg-teal-600/50 p-2 backdrop-blur-[2px] after:absolute after:inset-0 after:rounded-[inherit] after:bg-gradient-radial after:from-transparent after:to-black/50 after:content-[''] md:p-4">
            <NoiseFilter className="rounded-[inherit] opacity-[0.15] mix-blend-overlay" />
            <b className="max-h-full max-w-full overflow-x-hidden text-ellipsis text-xs md:text-2xl">
              {game.title}
            </b>
          </RadioGroup.RadioGroupIndicator>
          {game.comingSoon && (
            <b className="relative z-10 max-h-full max-w-full overflow-x-hidden text-ellipsis text-xs md:text-2xl">
              Coming soon
            </b>
          )}
          <Image
            className={cn(
              "relative flex rounded-[inherit] object-cover object-center blur-[1px] brightness-50 transition group-enabled:group-hover:blur-0 group-enabled:group-hover:brightness-100 group-enabled:group-focus:outline group-enabled:group-focus:outline-2 group-enabled:group-focus:outline-teal-600 group-enabled:group-focus:blur-0 group-enabled:group-focus:brightness-100 group-disabled:opacity-50 group-radix-state-checked:ring-2 group-radix-state-checked:ring-teal-500 group-radix-state-checked:ring-offset-2 group-radix-state-checked:ring-offset-neutral-950 group-radix-state-checked:brightness-100 md:group-radix-state-checked:ring-offset-4"
            )}
            src={`/images/${game.shortTitle}/banner.jpg`}
            alt={`A banner image of ${game.title}`}
            fill
          />
        </RadioGroup.RadioGroupItem>
      );
    };

    return (
      <div className="flex justify-center">
        <RadioGroup.Root
          className="grid max-w-max grid-cols-3 gap-3 gap-y-4 md:gap-4 md:gap-y-6 lg:grid-cols-4 lg:place-items-center [&>*]:shrink-0"
          value={value}
          onValueChange={onChange}
          ref={passedRef}
        >
          {games.map((game) => {
            return renderItem(game);
          })}
          {renderItem({
            id: -1,
            shortTitle: "apex",
            title: "Apex legends",
            comingSoon: true,
          })}
          {renderItem({
            id: -2,
            shortTitle: "overwatch2",
            title: "Overwatch 2",
            comingSoon: true,
          })}
        </RadioGroup.Root>
      </div>
    );
  }
);

GameGridSelect.displayName = "GameGridSelect";

const ClipsIndexPage = ({
  games,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();

  const form = useForm({
    schema: GetClipSchema,
    defaultValues: {
      gameId: games[0]?.id.toString(),
    },
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
          <h2 className="self-center text-xl md:text-3xl">
            <b>Get random clips</b>
          </h2>
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

          <Button
            type="submit"
            disabled={noMoreClipsAvailableErr !== undefined}
            className="mt-4 max-w-max text-sm md:mt-8 md:px-6 md:py-8 md:text-3xl "
            variants={{ type: "secondary" }}
          >
            Get clip
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ClipsIndexPage;
