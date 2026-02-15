import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import {
  Title,
  Text,
  Paper,
  Table,
  Stack,
  Box,
  Loader,
} from "@mantine/core";
import { FilterInput } from "@components/filters";
import { systemLogsApi, type ActivityLog } from "@services/api";

export default function SystemLogsPage() {
  const [subject, setSubject] = useState("");
  const [event, setEvent] = useState("");
  const [causer, setCauser] = useState("");
  const [debouncedSubject] = useDebouncedValue(subject, 300);
  const [debouncedEvent] = useDebouncedValue(event, 300);
  const [debouncedCauser] = useDebouncedValue(causer, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["system-logs", debouncedSubject, debouncedEvent, debouncedCauser],
    queryFn: async () => {
      const res = await systemLogsApi.list({
        pageSize: 100,
        subject: debouncedSubject || undefined,
        event: debouncedEvent || undefined,
        causer: debouncedCauser || undefined,
      });
      return {
        data: (res.data.data ?? []) as ActivityLog[],
        meta: res.data.meta,
      };
    },
  });

  const logs = (data?.data ?? []) as ActivityLog[];

  return (
    <Stack gap="xl">
      <div>
        <Title order={3} mb={4}>System Logs</Title>
        <Text size="sm" c="dimmed">View system activity logs</Text>
      </div>

      <Paper p="lg" withBorder radius="lg" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Description</Table.Th>
              <Table.Th>Subject</Table.Th>
              <Table.Th>Causer</Table.Th>
              <Table.Th>Date</Table.Th>
            </Table.Tr>
            <Table.Tr style={{ backgroundColor: "var(--mantine-color-default-hover)" }}>
              <Table.Th>
                <FilterInput name="event" placeholder="Event" value={event} onChange={(e) => setEvent(e.target.value)} />
              </Table.Th>
              <Table.Th>
                <FilterInput name="subject" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </Table.Th>
              <Table.Th>
                <FilterInput name="causer" placeholder="Causer" value={causer} onChange={(e) => setCauser(e.target.value)} />
              </Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Box py="xl" style={{ display: "flex", justifyContent: "center" }}>
                    <Loader size="sm" />
                  </Box>
                </Table.Td>
              </Table.Tr>
            ) : logs.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text py="md" c="dimmed" ta="center">No logs.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              logs.map((log) => (
                <Table.Tr key={log.id}>
                  <Table.Td>
                    <Text size="sm">{log.description}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{log.subject_type ? `${log.subject_type}#${log.subject_id}` : "—"}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{log.causer?.name ?? "—"}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{log.created_at ? new Date(log.created_at).toLocaleString() : "—"}</Text>
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
