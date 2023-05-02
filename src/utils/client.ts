import {
  type GetServerSidePropsContext,
  type GetStaticPropsContext,
} from "next";

export const TIME_IN_MS = {
  HALF_MINUTE: 100 * 30,
  ONE_MINUTE: 100 * 60,
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
