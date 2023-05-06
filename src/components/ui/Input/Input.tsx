import React, { type ForwardedRef } from "react";
import { cn } from "~/lib/utils";

const Input = React.forwardRef(
  (
    { className, ...rest }: React.ComponentProps<"input">,
    passedRef: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <input
        {...rest}
        className={cn(
          "hover h-10 rounded-md border border-teal-600 bg-transparent px-3 py-2 transition hover:border-teal-500 focus-visible:border-teal-700 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:hover:border-teal-600 disabled:opacity-50",
          className
        )}
        ref={passedRef}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
