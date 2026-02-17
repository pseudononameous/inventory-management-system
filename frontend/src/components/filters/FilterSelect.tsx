import { Select } from "@mantine/core";

export interface SelectOptionType { label: string; value: string; }

interface FilterSelectProps {
  name: string;
  data: SelectOptionType[];
  placeholder?: string;
  value: string | null;
  onChange: (value: string | null) => void;
}

export default function FilterSelect({ name, data, value, onChange, placeholder }: FilterSelectProps) {
  return (
    <Select
      size="xs"
      radius="sm"
      clearable
      searchable
      name={name}
      placeholder={placeholder ?? name}
      data={data}
      value={value}
      onChange={onChange}
      styles={{ input: { fontWeight: 400, borderColor: "var(--mantine-color-gray-3)" } }}
    />
  );
}
