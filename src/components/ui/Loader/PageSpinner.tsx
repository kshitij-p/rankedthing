import React, { type ForwardedRef } from "react";
import { m } from "framer-motion";
import Loader from ".";
import {
  getAnimationVariant,
  defaultAnimationTransition,
} from "../../../utils/animationHelpers";

const PageSpinner = React.forwardRef(
  (
    { children }: React.PropsWithChildren,
    passedRef: ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <m.div
        className="pointer-events-none absolute inset-0 flex h-screen w-full items-center justify-center"
        variants={getAnimationVariant({
          type: "fade",
        })}
        initial={"hidden"}
        animate={"visible"}
        transition={defaultAnimationTransition}
        ref={passedRef}
      >
        <div className="flex max-w-max flex-col items-center gap-8 text-lg tracking-wider md:text-4xl">
          <Loader height="4em" width="4em" />
          {children}
        </div>
      </m.div>
    );
  }
);

PageSpinner.displayName = "PageSpinner";

export default PageSpinner;
