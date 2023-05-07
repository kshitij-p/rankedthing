import { SelectTrigger, SelectValue, SelectItem } from "~/components/ui/Select";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { type InferGetStaticPropsType, type GetStaticProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";
import GameGridSelect from "~/components/GameGridSelect";
import Button from "~/components/ui/Button";
import Form from "~/components/ui/Form";
import Input from "~/components/ui/Input";
import { Select, SelectContent } from "~/components/ui/Select";
import ProtectedPage from "~/components/util/ProtectedPage";
import useForm from "~/hooks/useForm";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { api, type RouterOutputs } from "~/utils/api";
import { isValidYtUrl, TIME_IN_SECS } from "~/utils/client";
import Label from "~/components/ui/Label";
import { Eye, EyeOff } from "lucide-react";
import ErrorText from "~/components/ui/ErrorText";

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
  gameId: z.string({ required_error: "Choose a game" }).min(1),

  title: z
    .string({ required_error: "Must have atleast 1 character" })
    .min(1, { message: "Must have atleast 1 character" }),

  realRank: z
    .string({ required_error: "Select a rank" })
    .min(1, { message: "Select a rank" }),

  fakeRank: z
    .string({ required_error: "Select a valid rank" })
    .min(1, { message: "Select a rank" }),

  ytUrl: z
    .string({ required_error: "Must have atleast 1 character" })
    .min(1, { message: "Must have atleast 1 character" })
    .refine(isValidYtUrl, {
      message: "Must be a valid youtube url",
    }),
});

type CreateClipFormValues = z.infer<typeof CreateClipSchema>;

const ClipSubmitPage = ({
  games,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const utils = api.useContext();

  const form = useForm({
    schema: CreateClipSchema,
  });

  const gameId = form.watch("gameId");
  const parsedGameId = parseInt(gameId);

  const [newClipId, setNewClipId] = useState("");

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
    onSettled: () => {
      void utils.stats.getClipsCountForGame.invalidate();
    },
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
    createClip({ ...data, gameId: parseInt(data.gameId) });
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
    if (gameRanks[0]) {
      form.clearErrors("fakeRank");
    }
    if (gameRanks[1]) {
      form.clearErrors("realRank");
    }
  }, [gameRanks, form]);

  return (
    <div>
      <Form form={form} onSubmit={handleSubmit} disabled={isLoading}>
        <div className="flex items-center justify-center">
          <div className="flex max-w-max flex-col gap-6 p-4 text-lg md:gap-8 md:py-10 md:text-xl">
            <Label className="flex flex-col items-baseline gap-1 font-light md:gap-2">
              <span className="flex items-center gap-2">
                Title
                <span title="Not shown to others ever">
                  <EyeOff className="w-[1rem] text-neutral-500" />
                </span>
              </span>
              <Input className="w-full max-w-3xl" {...form.register("title")} />
              <ErrorText className="text-sm md:text-lg" inputName="title" />
            </Label>
            <Controller
              name={"gameId"}
              rules={{ required: true }}
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <GameGridSelect
                    {...field}
                    error={fieldState.error}
                    value={field.value}
                    onChange={(gameId) => {
                      field.onChange(gameId);
                    }}
                    games={games}
                  />
                );
              }}
            />
            <Controller
              name="fakeRank"
              render={({ field }) => {
                const disabled = !gameId?.length;
                return (
                  <Label className="flex flex-col items-baseline gap-1 font-light md:gap-2">
                    <span className="flex items-center gap-2">
                      Fake Rank
                      <span title="Visible to others">
                        <Eye className="w-[1rem] text-neutral-300" />
                      </span>
                    </span>
                    <Select
                      disabled={disabled}
                      //Placeholder doesnt work unless value is set
                      value={field.value ? field.value : undefined}
                      onValueChange={field.onChange}
                      name={field.name}
                    >
                      <SelectTrigger className="truncate">
                        <SelectValue
                          placeholder={
                            disabled
                              ? "Select a game to see ranks"
                              : "Select a game"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {gameRanks.map((gameRank) => (
                          <SelectItem value={gameRank.name} key={gameRank.name}>
                            {gameRank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ErrorText
                      className="text-sm md:text-lg"
                      inputName="fakeRank"
                    />
                  </Label>
                );
              }}
              control={form.control}
            />
            <Controller
              name="realRank"
              render={({ field }) => {
                const disabled = !gameId?.length;
                return (
                  <Label className="flex flex-col items-baseline gap-1 font-light md:gap-2">
                    <span className="flex items-center gap-2">
                      Real Rank
                      <span title="Not shown to others until they vote">
                        <EyeOff className="w-[1rem] text-neutral-500" />
                      </span>
                    </span>
                    <Select
                      disabled={disabled}
                      //Placeholder doesnt work unless value is set
                      value={field.value ? field.value : undefined}
                      onValueChange={field.onChange}
                      name={field.name}
                    >
                      <SelectTrigger className="truncate">
                        <SelectValue
                          placeholder={
                            disabled
                              ? "Select a game to see ranks"
                              : "Select a game"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {gameRanks.map((gameRank) => (
                          <SelectItem
                            value={gameRank.name}
                            key={gameRank.name}
                            disabled={gameRank.name === fakeRank}
                          >
                            {gameRank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ErrorText
                      className="text-sm md:text-lg"
                      inputName="realRank"
                    />
                  </Label>
                );
              }}
              control={form.control}
            />
            <Label className="flex flex-col items-baseline gap-1 font-light md:gap-2">
              Youtube link of your clip
              <Input className="w-full max-w-3xl" {...form.register("ytUrl")} />
              <ErrorText className="text-sm md:text-lg" inputName="ytUrl" />
            </Label>

            <Button
              className="max-w-max self-center"
              type="submit"
              variants={{ type: "secondary" }}
            >
              Create
            </Button>

            {newClipId ? (
              <Link href={`/clips/${newClipId}`}>
                Success! Created your clip
              </Link>
            ) : null}
          </div>
        </div>
      </Form>
    </div>
  );
};

export default ProtectedPage(ClipSubmitPage);
