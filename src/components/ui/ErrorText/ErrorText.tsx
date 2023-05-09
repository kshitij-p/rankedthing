import React, { type ForwardedRef } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "~/lib/utils";
import { type HTMLMotionProps, m, AnimatePresence } from "framer-motion";
import {
  defaultAnimationTransition,
  getAnimationVariant,
} from "~/utils/animationHelpers";

export const ErrorTextPrimitive = React.forwardRef(
  (
    {
      children,
      className,
      variants = getAnimationVariant({ type: "fade" }),
      transition = defaultAnimationTransition,
      initial = "hidden",
      animate = "visible",
      exit = "hidden",
      ...rest
    }: HTMLMotionProps<"p">,
    passedRef: ForwardedRef<HTMLParagraphElement>
  ) => {
    return (
      <AnimatePresence>
        {children && (
          <m.p
            {...rest}
            variants={variants}
            initial={initial}
            animate={animate}
            exit={exit}
            transition={transition}
            className={cn("font-semibold text-red-500", className)}
            ref={passedRef}
          >
            {children}
          </m.p>
        )}
      </AnimatePresence>
    );
  }
);

ErrorTextPrimitive.displayName = "ErrorTextPrimitive";

const ErrorText = React.forwardRef(
  (
    {
      children,
      inputName,
      className,
      ...rest
    }: HTMLMotionProps<"p"> & {
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
      <ErrorTextPrimitive
        {...rest}
        className={cn("font-semibold text-red-500", className)}
        ref={passedRef}
      >
        {children ? children : errorMsg}
      </ErrorTextPrimitive>
    );
  }
);

ErrorText.displayName = "ErrorText";

export default ErrorText;
