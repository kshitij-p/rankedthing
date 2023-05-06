import NextLink from "next/link";
import React, { type ForwardedRef } from "react";
import { cn } from "~/lib/utils";

const Link = React.forwardRef(
  (
    { children, className, ...rest }: React.ComponentProps<typeof NextLink>,
    passedRef: ForwardedRef<HTMLAnchorElement>
  ) => {
    return (
      <NextLink
        {...rest}
        className={cn(
          "underline-teal-anim rounded-sm transition hover:text-teal-200 focus:outline-0 focus-visible:text-teal-200",
          className
        )}
        ref={passedRef}
      >
        {children}
      </NextLink>
    );
  }
);

Link.displayName = "Link";

export default Link;
