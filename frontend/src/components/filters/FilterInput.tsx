import { Input } from "@mantine/core";
import type { ChangeEvent } from "react";

type InputType = "text" | "email" | "number" | "search";

interface FilterInputProps {
  type?: InputType;
  name: string;
  value: string | number | undefined;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function FilterInput({ name, value, placeholder, onChange, type = "text" }: FilterInputProps) {
  return (
    <Input
      size="xs"
      radius="sm"
      type={type}
      name={name}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={onChange}
      styles={{ input: { fontWeight: 400, borderColor: "var(--mantine-color-gray-3)" } }}
    />
  );
}
