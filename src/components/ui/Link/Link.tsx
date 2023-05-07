import NextLink from "next/link";
import React, { type ForwardedRef } from "react";
import { cn } from "~/lib/utils";

const Link = React.forwardRef(
  (
    {
      children,
      className,
      disabled = false,
      ...rest
    }: React.ComponentProps<typeof NextLink> & {
      disabled?: boolean;
    },
    passedRef: ForwardedRef<HTMLAnchorElement>
  ) => {
    return (
      <NextLink
        {...rest}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        data-disabled={disabled}
        className={cn(
          "data-[disabled=false]:underline-teal-anim rounded-sm transition focus:outline-0 focus-visible:text-teal-200 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[disabled=false]:hover:text-teal-200",
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
