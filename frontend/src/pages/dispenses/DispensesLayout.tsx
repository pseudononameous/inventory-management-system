import { Tabs, Stack } from "@mantine/core";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

export default function DispensesLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const base = "/dispenses";
  const path = location.pathname.replace(base, "") || "/";
  const segment = path === "/" ? "for-dispense" : path.replace(/^\//, "").split("/")[0] || "for-dispense";
  const value = ["for-dispense", "dispensed"].includes(segment) ? segment : "for-dispense";

  return (
    <Stack gap="md">
      <Tabs
        value={value as string}
        onChange={(v) => navigate(v ? `/dispenses/${v}` : "/dispenses/for-dispense")}
      >
        <Tabs.List>
          <Tabs.Tab value="for-dispense">For Dispense</Tabs.Tab>
          <Tabs.Tab value="dispensed">Dispensed</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <Outlet />
    </Stack>
  );
}
