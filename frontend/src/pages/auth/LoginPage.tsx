import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paper, TextInput, PasswordInput, Button, Title, Text, Stack, Box } from "@mantine/core";
import { useAuthStore } from "@stores/useAuthStore";
import { authApi } from "@services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      if (data.success && data.data) {
        setAuth({
          token: data.data.token,
          user: data.data.user as { id: number; name: string; email: string },
          role: data.data.role ?? null,
          permission: data.data.permission ?? [],
        });
        navigate("/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #c7d2fe 100%)",
      }}
    >
      <Paper
        p="xl"
        radius="xl"
        shadow="xl"
        w={420}
        style={{
          border: "1px solid rgba(255,255,255,.6)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 16px 48px rgba(79,70,229,.15)",
        }}
      >
        <Stack gap="lg">
          <Title order={2} fw={700} c="dark.7">Inventory Management System</Title>
          <Text c="dimmed" size="sm" fw={500}>Sign in to continue</Text>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="admin@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                radius="md"
              />
              <PasswordInput
                label="Password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                radius="md"
              />
              {error && <Text c="red" size="sm" fw={500}>{error}</Text>}
              <Button type="submit" loading={loading} fullWidth size="md" radius="md">
                Sign in
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Box>
  );
}
