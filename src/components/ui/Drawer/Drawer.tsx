import React from "react";
import { Dialog, DialogTrigger, DialogContent } from "../Dialog";

const Drawer = ({
  children,
  trigger,
}: React.PropsWithChildren & {
  trigger: React.ReactNode;
}) => {
  return (
    <Dialog>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent
        className="flex h-full max-h-[unset] w-3/4 max-w-[unset] flex-col radix-state-closed:animate-slideLeftOut radix-state-open:animate-slideLeftIn"
        position={{ x: "left", y: "top" }}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default Drawer;
