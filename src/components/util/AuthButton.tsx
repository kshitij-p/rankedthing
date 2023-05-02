import { signIn, signOut, useSession } from "next-auth/react";
import React, { type ForwardedRef } from "react";
import Button from "../ui/Button";

const AuthButton = React.forwardRef(
  (
    { variants, ...rest }: React.ComponentProps<typeof Button>,
    passedRef: ForwardedRef<HTMLButtonElement>
  ) => {
    const { data } = useSession();

    return (
      <Button
        {...rest}
        type="button"
        variants={{ type: "secondary", ...variants }}
        onClick={data ? () => void signOut() : () => void signIn("google")}
        ref={passedRef}
      >
        {data ? "Sign out" : "Sign in"}
      </Button>
    );
  }
);

AuthButton.displayName = "AuthButton";

export default AuthButton;
