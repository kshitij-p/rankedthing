import { useSession } from "next-auth/react";
import ProtectedPage from "~/components/util/ProtectedPage";

const ClipSubmitPage = () => {
  const { status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      AAA
      <form></form>
    </div>
  );
};

export default ProtectedPage(ClipSubmitPage);
