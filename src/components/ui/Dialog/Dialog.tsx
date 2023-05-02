import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";

import { cn } from "~/lib/utils";

const Dialog = RadixDialog.Root;

const DialogTrigger = RadixDialog.Trigger;

const DialogPortal = ({
  className,
  children,
  ...rest
}: RadixDialog.DialogPortalProps) => (
  <RadixDialog.Portal {...rest} className={cn(className)}>
    <div className="fixed inset-0 z-[1400] flex items-center justify-center">
      {children}
    </div>
  </RadixDialog.Portal>
);
DialogPortal.displayName = RadixDialog.Portal.displayName;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>
>(({ className, ...rest }, ref) => (
  <RadixDialog.Overlay
    {...rest}
    ref={ref}
    className={cn(
      "-z-1 fixed inset-0 w-full bg-slate-900/5 backdrop-blur-[6px] transition-all duration-100",
      className
    )}
  />
));
DialogOverlay.displayName = RadixDialog.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Content>
>(({ className, children, ...rest }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <RadixDialog.Content
      {...rest}
      className={cn(
        "fixed h-[50rem] max-h-[75vh] w-[50rem] max-w-[90vw] overflow-y-auto rounded bg-neutral-900 p-6",
        className
      )}
      ref={ref}
    >
      {children}
    </RadixDialog.Content>
  </DialogPortal>
));
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
