import { signIn, signOut, useSession } from "next-auth/react";
import React, { type ForwardedRef } from "react";
import { cn } from "~/lib/utils";
import Button from "../ui/Button";

const AuthButton = React.forwardRef(
  (
    { variants, className, ...rest }: React.ComponentProps<typeof Button>,
    passedRef: ForwardedRef<HTMLButtonElement>
  ) => {
    const { data, status } = useSession();

    const loading = status === "loading";

    return (
      <Button
        {...rest}
        className={cn("relative flex items-center justify-center", className)}
        type="button"
        variants={{ type: "secondary", ...variants }}
        onClick={data ? () => void signOut() : () => void signIn("google")}
        disabled={loading}
        ref={passedRef}
      >
        {loading ? "Loading" : data ? "Sign out" : "Sign in"}
      </Button>
    );
  }
);

AuthButton.displayName = "AuthButton";

export default AuthButton;
