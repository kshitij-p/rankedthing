import { useForm as useRHFForm, type UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type TypeOf } from "zod";

const useForm = <TFormSchema extends Zod.Schema>({
  schema,
  ...rest
}: Omit<UseFormProps<TypeOf<TFormSchema>>, "resolver"> & {
  schema: TFormSchema;
}) => {
  const form = useRHFForm({
    ...rest,
    resolver: zodResolver(schema),
  });

  return form;
};

export default useForm;
