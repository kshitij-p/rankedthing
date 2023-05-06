import { type Game } from "@prisma/client";
import * as RadioGroup from "@radix-ui/react-radio-group";
import Image from "next/image";
import React, { type ForwardedRef } from "react";
import { cn } from "~/lib/utils";
import NoiseFilter from "./util/NoiseFilter";

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
            "group relative aspect-[2/3] w-24 rounded-lg p-2 shadow shadow-black/50 focus:outline-0 max-[370px]:w-20 md:w-[10.5rem] md:rounded-xl md:p-4 xl:w-60"
          }
          value={`${game.id}`}
          key={game.id}
        >
          <RadioGroup.RadioGroupIndicator className="after:z-1 absolute inset-0 z-[1] flex aspect-square h-full w-full flex-col items-center justify-center gap-1 rounded-[inherit] bg-teal-600/50 backdrop-blur-[2px] after:absolute after:inset-0 after:rounded-[inherit] after:bg-gradient-radial after:from-transparent after:to-black/50 after:content-['']">
            <NoiseFilter className="rounded-[inherit] opacity-[0.15] mix-blend-overlay" />
            <b className="max-h-full max-w-full overflow-x-hidden text-ellipsis text-xs md:text-2xl">
              {game.title}
            </b>
          </RadioGroup.RadioGroupIndicator>
          {game.comingSoon && (
            <b className="relative z-10 max-h-full max-w-full overflow-x-hidden text-ellipsis text-center text-xs md:text-2xl">
              Coming soon
            </b>
          )}
          <Image
            className={cn(
              "relative flex rounded-[inherit] object-cover object-center blur-[1px] brightness-50 transition group-enabled:group-hover:-translate-y-1 group-enabled:group-hover:blur-0 group-enabled:group-hover:brightness-105 group-enabled:group-focus-visible:-translate-y-1 group-enabled:group-focus-visible:outline group-enabled:group-focus-visible:outline-2 group-enabled:group-focus-visible:outline-teal-600 group-enabled:group-focus-visible:blur-0 group-enabled:group-focus-visible:brightness-105 group-disabled:opacity-50 group-radix-state-checked:ring-2 group-radix-state-checked:ring-teal-500 group-radix-state-checked:ring-offset-2 group-radix-state-checked:ring-offset-neutral-950 group-radix-state-checked:brightness-105 md:group-radix-state-checked:ring-offset-4"
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

export default GameGridSelect;
