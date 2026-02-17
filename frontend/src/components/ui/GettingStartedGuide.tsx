import { useState } from "react";
import {
  Stepper,
  Button,
  Group,
  Paper,
  Text,
  Stack,
  Box,
} from "@mantine/core";
import { Link } from "react-router-dom";
import {
  IconDatabase,
  IconPackage,
  IconGitPullRequest,
  IconListDetails,
  IconListSearch,
  IconTruckDelivery,
  IconChartBar,
  IconCircleCheck,
  IconX,
} from "@tabler/icons-react";

const STORAGE_KEY = "ims-getting-started-dismissed";

export function useGettingStartedDismissed() {
  const [dismissed, setDismissedState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const setDismissed = (value: boolean) => {
    setDismissedState(value);
    try {
      if (value) localStorage.setItem(STORAGE_KEY, "true");
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return [dismissed, setDismissed] as const;
}

const STEPS = [
  {
    label: "Libraries",
    description: "Reference data",
    icon: IconDatabase,
    path: "/libraries/departments",
    content:
      "Set up foundational reference data first. Add Departments, Suppliers, Units, Brands, Categories, Generic Names, Fund Clusters, and Divisions. These are used across products, requisitions, and purchase orders.",
  },
  {
    label: "Products",
    description: "Inventory items",
    icon: IconPackage,
    path: "/products",
    content:
      "Add products to your inventory. Each product is linked to a category, unit, and optionally a brand and supplier. Products are the core items you track, reorder, and dispense.",
  },
  {
    label: "Requisitions",
    description: "Request supplies",
    icon: IconGitPullRequest,
    path: "/requisitions/pending",
    content:
      "Departments create requisitions when they need supplies. Requisitions go through approval (Pending → For Dispensing) and are then fulfilled via Dispenses.",
  },
  {
    label: "Purchase Orders",
    description: "Order from suppliers",
    icon: IconListDetails,
    path: "/purchase-orders",
    content:
      "When stock is low, create purchase orders to buy from suppliers. POs track ordered items, quantities, and delivery. Received items go through Inspections before being added to stock.",
  },
  {
    label: "Inspections",
    description: "Quality control",
    icon: IconListSearch,
    path: "/inspections",
    content:
      "When items arrive from a purchase order, inspect them for quality and quantity. Accept or reject items before they enter your inventory. This ensures only good stock is added.",
  },
  {
    label: "Dispenses",
    description: "Distribute items",
    icon: IconTruckDelivery,
    path: "/dispenses/for-dispense",
    content:
      "Fulfill approved requisitions by dispensing items to requesting departments. This completes the cycle from request to delivery. Track what was dispensed and to whom.",
  },
  {
    label: "Reports",
    description: "Analytics",
    icon: IconChartBar,
    path: "/reports",
    content:
      "View reports on stock levels, usage, requisitions, purchase orders, and dispenses. Use insights to plan purchases and monitor inventory health.",
  },
];

export default function GettingStartedGuide({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  const [active, setActive] = useState(0);

  return (
    <Paper
      p="xl"
      radius="lg"
      withBorder
      style={{
        boxShadow: "0 8px 32px rgba(0,0,0,.08)",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      }}
    >
      <Stack gap="lg">
        <Group justify="space-between" wrap="nowrap">
          <Text size="lg" fw={700} c="dark.7">
            How to Use the System
          </Text>
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            leftSection={<IconX size={16} />}
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        </Group>

        <Stepper
          active={active}
          onStepClick={setActive}
          allowNextStepsSelect
          size="sm"
          completedIcon={<IconCircleCheck size={18} />}
        >
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <Stepper.Step
                key={s.label}
                label={s.label}
                description={s.description}
                icon={<Icon size={18} />}
              >
                {active === idx && (
                  <Box pt="md" pb="xs">
                    <Text size="sm" c="dimmed" mb="md" lh={1.6}>
                      {s.content}
                    </Text>
                    <Button
                      component={Link}
                      to={s.path}
                      variant="light"
                      size="sm"
                      onClick={onDismiss}
                    >
                      Go to {s.label}
                    </Button>
                  </Box>
                )}
              </Stepper.Step>
            );
          })}
          <Stepper.Completed>
            <Box pt="md">
              <Text size="sm" c="dimmed" mb="md" lh={1.6}>
                You&apos;ve seen the full workflow. Start with Libraries, then add
                Products. From there, handle Requisitions, Purchase Orders,
                Inspections, and Dispenses as your daily operations.
              </Text>
              <Button variant="light" size="sm" onClick={onDismiss}>
                Got it
              </Button>
            </Box>
          </Stepper.Completed>
        </Stepper>

        <Group justify="space-between" mt="xs">
          <Button
            variant="default"
            size="xs"
            disabled={active === 0}
            onClick={() => setActive((a) => Math.max(0, a - 1))}
          >
            Back
          </Button>
          {active < STEPS.length && (
            <Button size="xs" onClick={() => setActive((a) => a + 1)}>
              {active === STEPS.length - 1 ? "Finish" : "Next"}
            </Button>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}
