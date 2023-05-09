import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { AnimatePresence, m } from "framer-motion";
import {
  defaultAnimationTransition,
  getAnimationVariant,
} from "~/utils/animationHelpers";
import { useRouter } from "next/router";
import PageSpinner from "../Loader/PageSpinner";

const Layout = ({ children }: React.PropsWithChildren) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let shldUpdate = true;

    const handleStart = () => {
      setLoading(true);
    };

    const handleComplete = () => {
      if (shldUpdate) {
        setLoading(false);
      }
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return function cleanup() {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
      shldUpdate = false;
    };
  }, [router.events]);

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        {loading ? (
          <PageSpinner />
        ) : (
          <m.main
            key={router.route}
            variants={getAnimationVariant({ type: "fade" })}
            initial={"hidden"}
            animate={"visible"}
            exit={"hidden"}
            transition={defaultAnimationTransition}
          >
            {children}
          </m.main>
        )}
      </AnimatePresence>
    </>
  );
};

export default Layout;
