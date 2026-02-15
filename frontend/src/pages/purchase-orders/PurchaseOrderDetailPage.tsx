import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
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
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { purchaseOrdersApi } from "@services/api";

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const poId = id ? parseInt(id, 10) : NaN;

  const { data, isLoading } = useQuery({
    queryKey: ["purchase-order", poId],
    queryFn: async () => {
      const res = await purchaseOrdersApi.get(poId);
      return res.data.data;
    },
    enabled: !isNaN(poId),
  });

  if (isNaN(poId) || isLoading) {
    return (
      <Stack gap="xl">
        <Button component={Link} to="/purchase-orders" variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Back to Purchase Orders
        </Button>
        <Box py="xl" style={{ display: "flex", justifyContent: "center" }}>
          <Loader size="md" />
        </Box>
      </Stack>
    );
  }

  const po = data as {
    id: number;
    po_number: string;
    po_date: string;
    remarks: string | null;
    supplier_id: number;
    supplier?: { id: number; name: string };
    purchase_requests?: Array<{
      id: number;
      pr_number: string;
      department?: { id: number; name: string };
      purchase_order_items?: Array<{
        id: number;
        product_id: number;
        quantity: number;
        unit_price: string | number | null;
        product?: { name: string; product_code?: string; unit?: { name: string } };
        brand?: { name: string } | null;
      }>;
    }>;
  } | undefined;

  if (!po) {
    return (
      <Stack gap="xl">
        <Button component={Link} to="/purchase-orders" variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Back to Purchase Orders
        </Button>
        <Text c="dimmed">Purchase order not found.</Text>
      </Stack>
    );
  }

  const purchaseRequests = po.purchase_requests ?? [];

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Button component={Link} to="/purchase-orders" variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Back to Purchase Orders
        </Button>
      </Group>

      <Paper p="lg" withBorder radius="lg">
        <Title order={4} mb="md">Purchase Order Details</Title>
        <Stack gap="xs">
          <Group>
            <Text fw={500}>PO Number:</Text>
            <Text>{po.po_number}</Text>
          </Group>
          <Group>
            <Text fw={500}>Date:</Text>
            <Text>{po.po_date ? new Date(po.po_date).toLocaleDateString() : "—"}</Text>
          </Group>
          <Group>
            <Text fw={500}>Supplier:</Text>
            <Text>{po.supplier?.name ?? "—"}</Text>
          </Group>
          {po.remarks && (
            <Group>
              <Text fw={500}>Remarks:</Text>
              <Text>{po.remarks}</Text>
            </Group>
          )}
        </Stack>
      </Paper>

      <Paper p="lg" withBorder radius="lg">
        <Title order={4} mb="md">Purchase Requests & Items</Title>
        {purchaseRequests.length === 0 ? (
          <Text c="dimmed">No purchase requests for this PO.</Text>
        ) : (
          <Stack gap="lg">
            {purchaseRequests.map((pr) => (
              <Stack key={pr.id} gap="xs">
                <Group>
                  <Badge variant="light" color="blue">{pr.pr_number}</Badge>
                  <Text size="sm" c="dimmed">{pr.department?.name ?? "—"}</Text>
                </Group>
                {pr.purchase_order_items && pr.purchase_order_items.length > 0 ? (
                  <Table withTableBorder withColumnBorders>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Product</Table.Th>
                        <Table.Th>Brand</Table.Th>
                        <Table.Th>Qty</Table.Th>
                        <Table.Th>Unit Price</Table.Th>
                        <Table.Th>Amount</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {pr.purchase_order_items.map((item) => {
                        const qty = Number(item.quantity);
                        const unitPrice = Number(item.unit_price ?? 0);
                        const amount = qty * unitPrice;
                        return (
                          <Table.Tr key={item.id}>
                            <Table.Td>
                              <Text size="sm">{item.product?.name ?? "—"}</Text>
                              {item.product?.product_code && (
                                <Text size="xs" c="dimmed">{item.product.product_code}</Text>
                              )}
                            </Table.Td>
                            <Table.Td>{item.brand?.name ?? "—"}</Table.Td>
                            <Table.Td>{qty} {item.product?.unit?.name ?? ""}</Table.Td>
                            <Table.Td>{unitPrice.toFixed(2)}</Table.Td>
                            <Table.Td>{amount.toFixed(2)}</Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                ) : (
                  <Text size="sm" c="dimmed">No items.</Text>
                )}
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
