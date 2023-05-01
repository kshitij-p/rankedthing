import React from "react";
import {
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";

const Form = <T extends FieldValues>({
  children,
  form,
  disabled: passedDisabled = false,
  onSubmit,
  preventSubmitWhileDisabled = true,
  ...rest
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  disabled?: boolean;
  preventSubmitWhileDisabled?: boolean;
}) => {
  const disabled = passedDisabled || form.formState.isSubmitting;

  const handleSubmit = form.handleSubmit((...args) => {
    if (preventSubmitWhileDisabled && disabled) {
      return;
    }
    onSubmit(...args);
  });

  return (
    <FormProvider {...form}>
      <form
        {...rest}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit}
      >
        <fieldset disabled={disabled}>{children}</fieldset>
      </form>
    </FormProvider>
  );
};

export default Form;
