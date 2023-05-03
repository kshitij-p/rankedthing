import React, { type ForwardedRef } from "react";
import { cn } from "~/lib/utils";

const NoiseFilter = React.forwardRef(
  (
    { className, ...rest }: React.ComponentProps<"svg">,
    passedRef: ForwardedRef<SVGSVGElement>
  ) => {
    return (
      <svg
        {...rest}
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-0 isolate z-50",
          className
        )}
        width="100%"
        height="100%"
        ref={passedRef}
      >
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          ></feTurbulence>
          <feColorMatrix type="saturate" values="0"></feColorMatrix>
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)"></rect>
      </svg>
    );
  }
);

NoiseFilter.displayName = "NoiseFilter";

export default NoiseFilter;
