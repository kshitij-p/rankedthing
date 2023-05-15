import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Montserrat } from "next/font/google";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ThemeProvider } from "next-themes";
import Layout from "~/components/ui/Layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { domAnimation, LazyMotion } from "framer-motion";

const montserrat = Montserrat({
  subsets: ["latin"],
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ThemeProvider attribute="class" forcedTheme={"dark"}>
        <>
          <style jsx global>{`
            html {
              font-family: ${montserrat.style.fontFamily};
            }
          `}</style>
          <LazyMotion features={domAnimation} strict>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </LazyMotion>
        </>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
