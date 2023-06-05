import React, { useMemo } from "react";
import { cn } from "~/lib/utils";

const getEmbedUrl = (url: string) => {
  const id = url.split("?v=")?.[1] ?? url.split("shorts/")?.[1];

  if (!id) {
    return null;
  }

  return `https://www.youtube-nocookie.com/embed/${id}`;
};

const ClipPlayer = ({
  clip,
  className,
  fallback = <b>This link is broken sadge ;-;</b>,
  ...rest
}: Omit<React.ComponentProps<"iframe">, "sandbox" | "allow" | "src"> & {
  clip: {
    ytUrl: string;
  };
  fallback?: React.ReactNode;
}) => {
  const embedUrl = useMemo(() => getEmbedUrl(clip.ytUrl), [clip.ytUrl]);

  return (
    <>
      {embedUrl ? (
        <iframe
          {...rest}
          className={cn("h-full w-full", className)}
          allowFullScreen
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-popups allow-same-origin allow-scripts allow-presentation"
          src={embedUrl}
        />
      ) : (
        fallback
      )}
    </>
  );
};

export default ClipPlayer;
