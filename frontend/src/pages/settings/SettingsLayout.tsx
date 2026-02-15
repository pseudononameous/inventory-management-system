import { Tabs, Stack, rem } from "@mantine/core";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { IconUsers, IconUserCog, IconLogs } from "@tabler/icons-react";
import { useHasPermission } from "@utils/hasPermission";
import { ROLE_LIST } from "@constants/permissions";

const iconStyle = { width: rem(12), height: rem(12) };

export default function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasPermission = useHasPermission();
  const value = location.pathname.replace("/settings/", "") || "users";

  return (
    <Stack mt={-10}>
      <Tabs value={value} mt="md" onChange={(v) => v && navigate(`/settings/${v}`)}>
        <Tabs.List mb="md">
          <Tabs.Tab value="users" leftSection={<IconUsers style={iconStyle} />}>
            Users
          </Tabs.Tab>
          {hasPermission(ROLE_LIST) && (
            <Tabs.Tab value="roles" leftSection={<IconUserCog style={iconStyle} />}>
              Roles
            </Tabs.Tab>
          )}
          <Tabs.Tab value="logs" leftSection={<IconLogs style={iconStyle} />}>
            System Logs
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <Outlet />
    </Stack>
  );
}
