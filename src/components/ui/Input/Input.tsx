import React, { type ForwardedRef } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "~/lib/utils";

const Input = React.forwardRef(
  (
    { className, name, ...rest }: React.ComponentProps<"input">,
    passedRef: ForwardedRef<HTMLInputElement>
  ) => {
    const form = useFormContext();

    const errorMsg =
      name && form
        ? form.getFieldState(name, form.formState)?.error?.message
        : undefined;

    return (
      <input
        {...rest}
        aria-invalid={errorMsg !== undefined}
        name={name}
        className={cn(
          "h-10 rounded-md border border-teal-600 bg-transparent px-3 py-2 transition hover:border-teal-500 focus-visible:border-teal-700 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:hover:border-teal-600 disabled:opacity-50 aria-[invalid=true]:border-red-300 aria-[invalid=true]:hover:border-red-400 aria-[invalid=true]:focus-visible:ring-red-400",
          className
        )}
        ref={passedRef}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
