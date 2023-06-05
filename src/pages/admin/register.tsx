import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import React from "react";
import { z } from "zod";
import Button from "~/components/ui/Button";
import ErrorText from "~/components/ui/ErrorText";
import Form from "~/components/ui/Form";
import Input from "~/components/ui/Input";
import Label from "~/components/ui/Label";
import Link from "~/components/ui/Link";
import PageSpinner from "~/components/ui/Loader/PageSpinner";
import ProtectedPage from "~/components/util/ProtectedPage";
import useForm from "~/hooks/useForm";
import { api } from "~/utils/api";

const AdminRegisterSchema = z.object({
  secret: z.string().min(1, { message: "Must have atleast 1 character" }),
});

const AdminRegisterPage = () => {
  const { data, status, update } = useSession();

  const form = useForm({ schema: AdminRegisterSchema });

  const { mutate: register } = api.user.promoteToAdmin.useMutation({
    onError: (error) => {
      if (
        error.data?.code === "UNAUTHORIZED" &&
        error.message === "Invalid admin secret"
      ) {
        form.setError("secret", {
          type: "validate",
          message: "Invalid secret",
        });
      }
    },
    onSuccess: () => {
      void update();
    },
  });

  if (status === "loading") return <PageSpinner />;

  if (status === "unauthenticated" || !data) {
    return <div>You must be logged in</div>;
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 md:gap-8 md:px-10 md:py-48">
        {data.user.role !== UserRole.ADMIN ? (
          <>
            <Form
              form={form}
              onSubmit={(data) => {
                register(data);
              }}
            >
              <div className="flex flex-col gap-2 md:gap-4 md:text-xl">
                <Label className="flex flex-col">
                  <b className="mb-1">Secret</b>
                  <Input {...form.register("secret")} autoComplete="off" />
                  <ErrorText inputName={"secret"} />
                </Label>
                <Button
                  className="mt-2 w-max self-center text-base"
                  type="submit"
                  variants={{ type: "secondary", size: "md" }}
                >
                  Register
                </Button>
              </div>
            </Form>
          </>
        ) : (
          <Link className="text-lg md:text-xl" href={`/admin`}>
            You are an admin. Click here to go to the admin portal
          </Link>
        )}
      </div>
    </>
  );
};

export default ProtectedPage(AdminRegisterPage);
