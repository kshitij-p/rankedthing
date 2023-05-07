import React, { type ForwardedRef } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "~/lib/utils";

const ErrorText = React.forwardRef(
  (
    {
      children,
      inputName,
      className,
      ...rest
    }: React.ComponentProps<"p"> & {
      inputName: string;
    },
    passedRef: ForwardedRef<HTMLParagraphElement>
  ) => {
    const form = useFormContext();

    const errorMsg =
      inputName && form
        ? form.getFieldState(inputName, form.formState)?.error?.message
        : undefined;

    return (
      <p
        {...rest}
        className={cn("font-semibold text-red-500", className)}
        ref={passedRef}
      >
        {errorMsg}
        {children}
      </p>
    );
  }
);

ErrorText.displayName = "ErrorText";

export default ErrorText;
