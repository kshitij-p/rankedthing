import * as RadixSelect from "@radix-ui/react-select";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { ChevronDown } from "lucide-react";
import React, { createContext, useContext, useState } from "react";
import { cn } from "~/lib/utils";

type SelectContext = {
  open: boolean;
};

const SelectContext = createContext({ open: false } as SelectContext);

const Select = ({
  children,
  open: passedOpen,
  onOpenChange: passedOpenChange,
  ...rest
}: React.ComponentPropsWithoutRef<typeof RadixSelect.Root>) => {
  const [_open, _setOpen] = useState(false);

  const open = passedOpen !== undefined ? passedOpen : _open;
  const onOpenChange =
    passedOpenChange !== undefined ? passedOpenChange : _setOpen;

  return (
    <RadixSelect.Root {...rest} open={open} onOpenChange={onOpenChange}>
      <SelectContext.Provider value={{ open }}>
        {children}
      </SelectContext.Provider>
    </RadixSelect.Root>
  );
};

const SelectValue = RadixSelect.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Trigger
    className={cn(
      "group flex items-center justify-center gap-2 rounded-md border-2 border-teal-600 bg-transparent py-1 pl-3 pr-2 transition focus:outline-0 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 radix-disabled:opacity-50",
      className
    )}
    {...props}
    ref={ref}
  >
    {children}
    <RadixSelect.Icon asChild>
      <ChevronDown className="ml-auto h-4 w-4 rotate-0 opacity-50 transition group-radix-state-open:rotate-180" />
    </RadixSelect.Icon>
  </RadixSelect.Trigger>
));
SelectTrigger.displayName = RadixSelect.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Content>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(({ className, children, position = "popper", ...props }, ref) => {
  const isPopper = position === "popper";

  const { open } = useContext(SelectContext);

  return (
    <RadixSelect.Portal className="animate-fadeIn">
      <RadixSelect.Content
        sideOffset={8}
        className={cn(
          "relative z-[1200] min-w-[8rem] rounded bg-neutral-900 p-2",
          className
        )}
        position={position}
        {...props}
        ref={ref}
      >
        <ScrollArea.Root className="h-full w-full" type="auto">
          <RadixSelect.Viewport
            asChild
            data-state={open ? "open" : "closed"}
            className={cn(
              isPopper &&
                "min-w-[calc(var(--radix-select-trigger-width) + 0.5rem)] max-h-56 w-full"
            )}
          >
            <ScrollArea.Viewport
              className="h-full w-full"
              //Fixes a radix ui bug where Select.Viewport sets overflow and Scrollarea.Viewport also sets overflow and this clashes as one uses shorthand other doesnt
              style={{ overflowY: undefined }}
            >
              <RadixSelect.Group>{children}</RadixSelect.Group>
            </ScrollArea.Viewport>
          </RadixSelect.Viewport>
          <ScrollArea.Scrollbar className="w-1 rounded bg-transparent">
            <ScrollArea.Thumb className="rounded bg-neutral-600 hover:w-8 hover:bg-neutral-500" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
});
SelectContent.displayName = RadixSelect.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Label>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Label>
>(({ className, ...props }, ref) => (
  <RadixSelect.Label ref={ref} className={cn("", className)} {...props} />
));
SelectLabel.displayName = RadixSelect.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Item>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Item>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Item
    {...props}
    className={cn(
      "radix-state-checked:hover-visible:border-teal-300 my-2 flex items-center rounded border border-transparent p-1 pl-2 transition duration-75 hover:border-teal-500 focus:outline-0 focus-visible:border-teal-300 radix-disabled:opacity-50 radix-state-checked:border-teal-500 radix-state-checked:bg-teal-900/50 radix-state-checked:hover:bg-teal-900/90 radix-state-checked:focus-visible:border-teal-300 radix-state-checked:focus-visible:bg-teal-900/90",
      className
    )}
    ref={ref}
  >
    <RadixSelect.ItemText className="">{children}</RadixSelect.ItemText>
  </RadixSelect.Item>
));
SelectItem.displayName = RadixSelect.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Separator>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Separator>
>(({ className, ...props }, ref) => (
  <RadixSelect.Separator ref={ref} className={cn("", className)} {...props} />
));
SelectSeparator.displayName = RadixSelect.Separator.displayName;

export {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectSeparator,
};
