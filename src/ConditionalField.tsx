import { useField } from "react-final-form";

type Props = {
  children: React.ReactNode;
  value: string
  when: string;
}

export default function ConditionalField({
  children, when, value
}: Props) {
  const { input, meta } = useField(when, { subscription: { value: true, data: true } });
  if (input.value === value){
    return (
      <>{children}</>
    );
  }
  return null;
}