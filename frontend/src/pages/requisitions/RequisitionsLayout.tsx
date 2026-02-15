import { Tabs, Stack } from "@mantine/core";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

export default function RequisitionsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const base = "/requisitions";
  const path = location.pathname.replace(base, "") || "/";
  const segment = path === "/" ? "pending" : path.replace(/^\//, "").split("/")[0] || "pending";
  const value = ["pending", "for-dispensing", "dispensed"].includes(segment) ? segment : "pending";

  return (
    <Stack gap="md">
      <Tabs
        value={value as string}
        onChange={(v) => navigate(v ? `/requisitions/${v}` : "/requisitions/pending")}
      >
        <Tabs.List>
          <Tabs.Tab value="pending">Pending</Tabs.Tab>
          <Tabs.Tab value="for-dispensing">For Dispensing</Tabs.Tab>
          <Tabs.Tab value="dispensed">Dispensed</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <Outlet />
    </Stack>
  );
}
