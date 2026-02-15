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
  Badge,
  Textarea,
  Modal,
} from "@mantine/core";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";
import {
  inspectionsApi,
  type Inspection,
  type DeliveryItem,
} from "@services/api";
import { notifications } from "@mantine/notifications";

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const inspectionId = id ? parseInt(id, 10) : NaN;
  const queryClient = useQueryClient();
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["inspection", inspectionId],
    queryFn: async () => {
      const res = await inspectionsApi.get(inspectionId);
      return res.data.data;
    },
    enabled: !isNaN(inspectionId),
  });

  const submitMutation = useMutation({
    mutationFn: () => inspectionsApi.submit(inspectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspection", inspectionId] });
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      notifications.show({ title: "Submitted", message: "Inspection submitted.", color: "green" });
    },
  });

  const updateRemarksMutation = useMutation({
    mutationFn: () => inspectionsApi.updateRemarks(inspectionId, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspection", inspectionId] });
      setRemarksModalOpen(false);
      setRemarks("");
      notifications.show({ title: "Updated", message: "Remarks updated.", color: "green" });
    },
  });

  if (isNaN(inspectionId) || isLoading) {
    return (
      <Stack gap="xl">
        <Button component={Link} to="/inspections" variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Back to Inspections
        </Button>
        <Box py="xl" style={{ display: "flex", justifyContent: "center" }}>
          <Loader size="md" />
        </Box>
      </Stack>
    );
  }

  const payload = data as { inspection: Inspection & { delivery?: { delivery_items?: DeliveryItem[] }; delivery_items?: DeliveryItem[] }; total_amount: number } | undefined;
  const inspection = payload?.inspection;
  const deliveryItems = inspection?.delivery?.delivery_items ?? inspection?.delivery_items ?? [];
  const totalAmount = payload?.total_amount ?? deliveryItems.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unit_price), 0);

  if (!inspection) {
    return (
      <Stack gap="xl">
        <Button component={Link} to="/inspections" variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Back to Inspections
        </Button>
        <Text c="dimmed">Inspection not found.</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Button component={Link} to="/inspections" variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Back to Inspections
        </Button>
        <Group>
          <Button variant="light" onClick={() => { setRemarks(inspection.remarks ?? ""); setRemarksModalOpen(true); }}>
            Edit Remarks
          </Button>
          {deliveryItems.length > 0 && (
            <Button
              leftSection={<IconSend size={16} />}
              onClick={() => submitMutation.mutate()}
              loading={submitMutation.isPending}
            >
              Submit Inspection
            </Button>
          )}
        </Group>
      </Group>

      <Paper p="lg" withBorder radius="lg">
        <Title order={4} mb="md">Inspection Details</Title>
        <Stack gap="xs">
          <Group>
            <Text fw={500}>IAR No:</Text>
            <Badge variant="light" color="blue">{inspection.iar_no}</Badge>
          </Group>
          <Group>
            <Text fw={500}>Supplier:</Text>
            <Text>{inspection.delivery?.supplier?.name ?? "—"}</Text>
          </Group>
          <Group>
            <Text fw={500}>Delivery Date:</Text>
            <Text>
              {inspection.delivery?.delivery_date
                ? new Date(inspection.delivery.delivery_date as string).toLocaleDateString()
                : "—"}
            </Text>
          </Group>
          <Group>
            <Text fw={500}>Purchase Order:</Text>
            <Text>{inspection.purchase_order?.po_number ?? "—"}</Text>
          </Group>
          <Group>
            <Text fw={500}>For Warehouse:</Text>
            <Text>{inspection.for_warehouse ? "Yes" : "No"}</Text>
          </Group>
          <Group>
            <Text fw={500}>Forwarded:</Text>
            <Text>{inspection.is_forward ? "Yes" : "No"}</Text>
          </Group>
          {inspection.remarks && (
            <Group>
              <Text fw={500}>Remarks:</Text>
              <Text>{inspection.remarks}</Text>
            </Group>
          )}
        </Stack>
      </Paper>

      <Paper p="lg" withBorder radius="lg">
        <Group justify="space-between" mb="md">
          <Title order={4}>Delivery Items</Title>
          <Text fw={600}>Total: ₱{totalAmount.toFixed(2)}</Text>
        </Group>
        {deliveryItems.length === 0 ? (
          <Text c="dimmed">No delivery items. Add items to proceed.</Text>
        ) : (
          <Table withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Product</Table.Th>
                <Table.Th>Brand</Table.Th>
                <Table.Th>Lot No</Table.Th>
                <Table.Th>Qty</Table.Th>
                <Table.Th>Unit Price</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Expiry</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {deliveryItems.map((item) => {
                const qty = Number(item.quantity);
                const unitPrice = Number(item.unit_price);
                const amount = qty * unitPrice;
                return (
                  <Table.Tr key={item.id}>
                    <Table.Td>{item.product?.name ?? "—"}</Table.Td>
                    <Table.Td>{item.brand?.name ?? "—"}</Table.Td>
                    <Table.Td>{item.lot_no ?? "—"}</Table.Td>
                    <Table.Td>{qty} {item.product?.unit?.name ?? ""}</Table.Td>
                    <Table.Td>{unitPrice.toFixed(2)}</Table.Td>
                    <Table.Td>{amount.toFixed(2)}</Table.Td>
                    <Table.Td>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : "—"}</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal
        opened={remarksModalOpen}
        onClose={() => setRemarksModalOpen(false)}
        title="Edit Remarks"
      >
        <Stack>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            minRows={3}
          />
          <Button onClick={() => updateRemarksMutation.mutate()} loading={updateRemarksMutation.isPending}>
            Save
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
