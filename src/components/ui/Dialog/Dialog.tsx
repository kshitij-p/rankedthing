import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";

import { cn } from "~/lib/utils";

const Dialog = RadixDialog.Root;

const DialogTrigger = RadixDialog.Trigger;

const DEFAULT_PORTAL_POSITION = { x: "center", y: "center" } as {
  x: "left" | "center" | "right";
  y: "top" | "center" | "bottom";
};

type DialogPosition = typeof DEFAULT_PORTAL_POSITION;

const positionLookup: {
  x: {
    [k in DialogPosition["x"]]: string;
  };
  y: {
    [k in DialogPosition["y"]]: string;
  };
} = {
  x: {
    left: "left-0",
    center: "left-1/2 -translate-x-1/2",
    right: "right-0",
  },
  y: {
    top: "top-0",
    center: "top-1/2 -translate-y-1/2",
    bottom: "bottom-0",
  },
};

const DialogPortal = ({
  className,
  children,
  ...rest
}: RadixDialog.DialogPortalProps & {
  position?: Partial<DialogPosition>;
}) => {
  return (
    <RadixDialog.Portal
      {...rest}
      className={cn("fixed inset-0 z-[1400]", className)}
    >
      {children}
    </RadixDialog.Portal>
  );
};
DialogPortal.displayName = RadixDialog.Portal.displayName;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>
>(({ className, ...rest }, ref) => (
  <RadixDialog.Overlay
    {...rest}
    ref={ref}
    className={cn(
      "fixed inset-0 z-[1399] w-full bg-slate-900/10 backdrop-blur-[6px] transition-all duration-100",
      className
    )}
  />
));
DialogOverlay.displayName = RadixDialog.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Content> & {
    position?: React.ComponentProps<typeof DialogPortal>["position"];
  }
>(
  (
    {
      className,
      children,
      position: passedPosition = DEFAULT_PORTAL_POSITION,
      ...rest
    },
    ref
  ) => {
    const position = { ...DEFAULT_PORTAL_POSITION, ...passedPosition };

    return (
      <DialogPortal>
        <DialogOverlay />
        <RadixDialog.Content
          {...rest}
          className={cn(
            //For some reason origin-top-left seems to scale from center shrug
            "fixed z-[1400] h-[50rem] max-h-[75vh] w-[50rem] max-w-[90vw] origin-top-left overflow-y-auto rounded bg-neutral-900 p-6 shadow shadow-black/20 radix-state-closed:animate-appearOut radix-state-open:animate-appearIn",
            positionLookup.x[position.x],
            positionLookup.y[position.y],
            className
          )}
          ref={ref}
        >
          {children}
        </RadixDialog.Content>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = RadixDialog.Content.displayName;

const DialogHeader = ({ ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...rest} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...rest} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Title>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Title>
>(({ className, ...rest }, ref) => (
  <RadixDialog.Title
    {...rest}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    ref={ref}
  />
));
DialogTitle.displayName = RadixDialog.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Description>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Description>
>(({ className, ...rest }, ref) => (
  <RadixDialog.Description
    className={cn("text-sm", className)}
    {...rest}
    ref={ref}
  />
));
DialogDescription.displayName = RadixDialog.Description.displayName;

const DialogClose = RadixDialog.Close;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
