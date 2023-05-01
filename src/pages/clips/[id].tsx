import { createServerSideHelpers } from "@trpc/react-query/server";
import {
  type InferGetStaticPropsType,
  type GetStaticProps,
  type GetStaticPaths,
} from "next";
import { z } from "zod";
import PageWithFallback from "~/components/util/PageWithFallback";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { type RouterOutputs } from "~/utils/api";
import { getFromParam, TIME_IN_SECS } from "~/utils/client";

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<{
  clip: Omit<
    RouterOutputs["videoClip"]["getById"],
    "updatedAt" | "submittedAt"
  > & {
    updatedAt: string;
    submittedAt: string;
  };
}> = async (ctx) => {
  const id = getFromParam({ key: "id", ctx, schema: z.string() });

  const caller = createServerSideHelpers({
    ctx: createInnerTRPCContext({ session: null }),
    router: appRouter,
  });

  const clip = await caller.videoClip.getById.fetch({ clipId: id });

  return {
    props: {
      clip: {
        ...clip,
        updatedAt: JSON.stringify(clip.updatedAt),
        submittedAt: JSON.stringify(clip.submittedAt),
      },
    },
    revalidate: TIME_IN_SECS.ONE_HOUR,
  };
};

const GameClipPage = ({
  clip,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <div>{clip.title}</div>;
};

export default PageWithFallback(GameClipPage);
