import { signIn, signOut, useSession } from "next-auth/react";

const AuthButton = () => {
  const { data } = useSession();

  return (
    <button
      className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
      onClick={data ? () => void signOut() : () => void signIn()}
    >
      {data ? "Sign out" : "Sign in"}
    </button>
  );
};

export default AuthButton;
