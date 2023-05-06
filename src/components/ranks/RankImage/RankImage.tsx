import { type Game } from "@prisma/client";
import Image from "next/image";
import React, { type ForwardedRef } from "react";
import { cn } from "~/lib/utils";

const RankImage = React.forwardRef(
  (
    {
      rankName,
      game,
      className,
      ...rest
    }: React.ComponentProps<"div"> & {
      game: Omit<Partial<Game>, "shortTitle" | "title"> &
        Pick<Game, "shortTitle" | "title">;
      rankName: string;
    },
    passedRef: ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <div
        {...rest}
        className={cn("relative aspect-video", className)}
        title={rankName}
        ref={passedRef}
      >
        <Image
          className="object-contain"
          src={`/images/${game.shortTitle}/ranks/${rankName}.png`}
          alt={`Icon of ${rankName} - a rank in ${game.shortTitle}`}
          fill
        />
      </div>
    );
  }
);

RankImage.displayName = "RankImage";

export default RankImage;
