import {
  type GetServerSidePropsContext,
  type GetStaticPropsContext,
} from "next";

export const TIME_IN_MS = {
  HALF_MINUTE: 1000 * 30,
  ONE_MINUTE: 1000 * 60,
  FIVE_MINUTES: 1000 * 60 * 5,
} as const;

export const TIME_IN_SECS = {
  ONE_HOUR: 3600,
};

export const getFromParam = <TValue>({
  key,
  schema,
  ctx,
}: {
  key: string;
  schema: Zod.Schema<TValue>;
  ctx: GetServerSidePropsContext | GetStaticPropsContext;
}) => {
  return schema.parse(ctx.params?.[key]);
};

/**
 * Returns an embeddable version of the provided yt url
 */
export const getEmbedUrl = (url: string) => {
  const id = url.split("?v=")?.[1] ?? url.split("shorts/")?.[1];

  if (!id) {
    return null;
  }

  return `https://www.youtube.com/embed/${id}`;
};

/**
 * Checks if a yt url is a valid yt video or a yt short video
 */
export const isValidYtUrl = (url: string) => {
  return getEmbedUrl(url) !== null;
};
