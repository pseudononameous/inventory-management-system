import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import {
  Title,
  Paper,
  Stack,
  Group,
  Text,
  Table,
  Button,
  Box,
  Loader,
  Modal,
  TextInput,
} from "@mantine/core";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { dispensesApi, type Dispense, type DispenseItem } from "@services/api";
import { notifications } from "@mantine/notifications";

export default function DispenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispenseId = id ? parseInt(id, 10) : NaN;
  const queryClient = useQueryClient();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [receiveBy, setReceiveBy] = useState("");
  const [dispenseAt, setDispenseAt] = useState(new Date().toISOString().slice(0, 16));

  const { data: dispenseData, isLoading } = useQuery({
    queryKey: ["dispense", dispenseId],
    queryFn: async () => {
      const res = await dispensesApi.get(dispenseId);
      return res.data.data as Dispense;
    },
    enabled: !isNaN(dispenseId),
  });

  const { data: itemsRes } = useQuery({
    queryKey: ["dispense-items", dispenseId],
    queryFn: async () => {
      const res = await dispensesApi.getItems(dispenseId);
      return res.data.data ?? [];
    },
    enabled: !isNaN(dispenseId),
  });

  const confirmMutation = useMutation({
    mutationFn: (payload: { receive_by: string; dispense_at: string }) =>
      dispensesApi.confirm(dispenseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispense", dispenseId] });
      queryClient.invalidateQueries({ queryKey: ["dispenses"] });
      setConfirmModalOpen(false);
      setReceiveBy("");
      setDispenseAt(new Date().toISOString().slice(0, 16));
      notifications.show({ title: "Confirmed", message: "Dispense confirmed.", color: "green" });
    },
  });

  if (isNaN(dispenseId) || isLoading) {
    return (
      <Stack gap="xl">
        <Button component={Link} to="/dispenses/for-dispense" variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Back to Dispenses
        </Button>
        <Box py="xl" style={{ display: "flex", justifyContent: "center" }}>
          <Loader size="md" />
        </Box>
      </Stack>
    );
  }

  const dispense = dispenseData;
  const items = (itemsRes ?? []) as DispenseItem[];

  if (!dispense) {
    return (
      <Stack gap="xl">
        <Button component={Link} to="/dispenses/for-dispense" variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Back to Dispenses
        </Button>
        <Text c="dimmed">Dispense not found.</Text>
      </Stack>
    );
  }

  const canConfirm = !dispense.is_dispense && items.length > 0;

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Button component={Link} to="/dispenses/for-dispense" variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Back to Dispenses
        </Button>
        {canConfirm && (
          <Button
            leftSection={<IconCheck size={16} />}
            onClick={() => {
              setReceiveBy("");
              setDispenseAt(new Date().toISOString().slice(0, 16));
              setConfirmModalOpen(true);
            }}
          >
            Confirm Dispense
          </Button>
        )}
      </Group>

      <Paper p="lg" withBorder radius="lg">
        <Title order={4} mb="md">Dispense Details</Title>
        <Stack gap="xs">
          <Group>
            <Text fw={500}>Dispense Code:</Text>
            <Text>{dispense.dispense_code}</Text>
          </Group>
          <Group>
            <Text fw={500}>RIS No:</Text>
            <Text>{dispense.requisition?.ris_no ?? "—"}</Text>
          </Group>
          <Group>
            <Text fw={500}>Department:</Text>
            <Text>{dispense.requisition?.department?.name ?? "—"}</Text>
          </Group>
          <Group>
            <Text fw={500}>Status:</Text>
            <Text>{dispense.is_dispense ? "Dispensed" : "Pending"}</Text>
          </Group>
          {dispense.receive_by && (
            <Group>
              <Text fw={500}>Received By:</Text>
              <Text>{dispense.receive_by}</Text>
            </Group>
          )}
          {dispense.dispense_at && (
            <Group>
              <Text fw={500}>Dispense At:</Text>
              <Text>{new Date(dispense.dispense_at).toLocaleString()}</Text>
            </Group>
          )}
        </Stack>
      </Paper>

      <Paper p="lg" withBorder radius="lg">
        <Title order={4} mb="md">Dispense Items</Title>
        {items.length === 0 ? (
          <Text c="dimmed">No items.</Text>
        ) : (
          <Table withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Product</Table.Th>
                <Table.Th>Qty</Table.Th>
                <Table.Th>Unit Price</Table.Th>
                <Table.Th>Amount</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item) => {
                const qty = Number(item.quantity);
                const unitPrice = Number(item.unit_price);
                const amount = qty * unitPrice;
                return (
                  <Table.Tr key={item.id}>
                    <Table.Td>{item.product?.name ?? "—"}</Table.Td>
                    <Table.Td>{qty} {item.product?.unit?.name ?? ""}</Table.Td>
                    <Table.Td>{unitPrice.toFixed(2)}</Table.Td>
                    <Table.Td>{amount.toFixed(2)}</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal
        opened={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Dispense"
      >
        <Stack>
          <TextInput
            label="Received By"
            required
            value={receiveBy}
            onChange={(e) => setReceiveBy(e.target.value)}
            placeholder="Name of recipient"
          />
          <TextInput
            type="datetime-local"
            label="Dispense At"
            required
            value={dispenseAt}
            onChange={(e) => setDispenseAt(e.target.value)}
          />
          <Button
            onClick={() => confirmMutation.mutate({ receive_by: receiveBy, dispense_at: dispenseAt })}
            loading={confirmMutation.isPending}
            disabled={!receiveBy.trim()}
          >
            Confirm
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
