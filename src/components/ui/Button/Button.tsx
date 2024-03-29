import { cva } from "class-variance-authority";

import React from "react";
import { cn } from "~/lib/utils";

const buttonVariants = {
  type: {
    primary:
      "bg-teal-500 text-neutral-50 hover:bg-teal-600 hover:text-neutral-100 focus-visible:bg-teal-600 focus-visible:text-neutral-100",
    secondary:
      "bg-neutral-1000 text-teal-200 border-teal-500 border-2 hover:bg-teal-900/75 hover:text-teal-300 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-teal-900/75 focus-visible:text-teal-300",
    tertiary:
      "bg-transparent hover:bg-teal-300/20 focus-visible:bg-teal-300/20",
    danger:
      "bg-red-500 text-neutral-50 hover:bg-red-700 hover:text-neutral-100 focus-visible:ring-red-400 focus-visible:ring-offset-red-900",
    "danger-secondary":
      "bg-white text-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:bg-red-50 focus-visible:text-red-700 focus-visible:ring-neutral-400 focus-visible:ring-offset-neutral-900",
  },
  size: {
    sm: "h-9 px-2",
    md: "h-10 py-2 px-4",
    lg: "h-11 px-8",
  },
};

const DEFAULT_VARIANTS: {
  [k in keyof typeof buttonVariants]: keyof (typeof buttonVariants)[k];
} = {
  size: "md",
  type: "primary",
};

const buttonClasses = cva(
  "inline-flex items-center justify-center transition rounded font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-900 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: buttonVariants,
    defaultVariants: DEFAULT_VARIANTS,
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variants?: Partial<typeof DEFAULT_VARIANTS>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variants: passedVariants = DEFAULT_VARIANTS, ...rest },
    ref
  ) => {
    const variants = { ...DEFAULT_VARIANTS, ...passedVariants };

    return (
      <button
        className={cn(buttonClasses(variants), className)}
        {...rest}
        ref={ref}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
