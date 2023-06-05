import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import React from "react";
import PageSpinner from "~/components/ui/Loader/PageSpinner";
import ProtectedPage from "~/components/util/ProtectedPage";

const Content = () => {
  const { data, status } = useSession();

  if (status === "loading") return <PageSpinner />;

  if (status === "unauthenticated" || !data) {
    return <div>You must be logged in</div>;
  }

  if (data.user.role !== UserRole.ADMIN) {
    return <div>You must be an admin to use this panel</div>;
  }

  return (
    <div>
      You are an <b>{data.user.role}</b>
    </div>
  );
};

const AdminPage = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 md:gap-8 md:px-10 md:py-48">
      <Content />
    </div>
  );
};

export default ProtectedPage(AdminPage);
