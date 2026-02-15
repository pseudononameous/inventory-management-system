import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import {
  Title,
  Table,
  ActionIcon,
  Paper,
  Text,
  Box,
  Loader,
  Group,
  Stack,
} from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { FilterInput } from "@components/filters";
import { dispensesApi, type Dispense } from "@services/api";

type TabValue = "for-dispense" | "dispensed";

export default function DispensesPage() {
  const location = useLocation();
  const pathSegment = location.pathname.split("/").filter(Boolean);
  const tab = (pathSegment[2] === "for-dispense" || pathSegment[2] === "dispensed"
    ? pathSegment[2]
    : "for-dispense") as TabValue;

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const fetchList = () => {
    if (tab === "for-dispense") {
      return dispensesApi.forDispense({ pageSize: 100, search: debouncedSearch || undefined });
    }
    return dispensesApi.dispensed({ pageSize: 100, search: debouncedSearch || undefined });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["dispenses", tab, debouncedSearch],
    queryFn: async () => {
      const res = await fetchList();
      return (res.data.data ?? []) as Dispense[];
    },
  });

  const dispenses = (data ?? []) as Dispense[];

  const tabTitles: Record<TabValue, string> = {
    "for-dispense": "For Dispense",
    dispensed: "Dispensed",
  };

  return (
    <Stack gap="xl">
      <div>
        <Title order={3} mb={4}>{tabTitles[tab]}</Title>
        <Text size="sm" c="dimmed">
          {tab === "for-dispense"
            ? "Dispenses ready for confirmation"
            : "Completed dispenses"}
        </Text>
      </div>

      <Paper p="lg" withBorder radius="lg" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Dispense Code</Table.Th>
              <Table.Th>RIS No</Table.Th>
              <Table.Th>Department</Table.Th>
              <Table.Th>Received By</Table.Th>
              <Table.Th>Dispense At</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
            <Table.Tr style={{ backgroundColor: "var(--mantine-color-default-hover)" }}>
              <Table.Th>
                <FilterInput
                  name="search"
                  placeholder="Search code or RIS"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Table.Th>
              <Table.Th />
              <Table.Th />
              <Table.Th />
              <Table.Th />
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Box py="xl" style={{ display: "flex", justifyContent: "center" }}>
                    <Loader size="sm" />
                  </Box>
                </Table.Td>
              </Table.Tr>
            ) : dispenses.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text py="md" c="dimmed" ta="center">
                    No dispenses.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              dispenses.map((d) => (
                <Table.Tr key={d.id}>
                  <Table.Td>{d.dispense_code}</Table.Td>
                  <Table.Td>{d.requisition?.ris_no ?? "—"}</Table.Td>
                  <Table.Td>{d.requisition?.department?.name ?? "—"}</Table.Td>
                  <Table.Td>{d.receive_by ?? "—"}</Table.Td>
                  <Table.Td>
                    {d.dispense_at
                      ? new Date(d.dispense_at).toLocaleString()
                      : "—"}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        component={Link}
                        to={`/dispenses/${d.id}`}
                        title="View"
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
