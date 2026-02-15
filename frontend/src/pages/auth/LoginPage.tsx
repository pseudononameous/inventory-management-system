import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paper, TextInput, PasswordInput, Button, Title, Text, Stack } from "@mantine/core";
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
      <Paper p="xl" shadow="md" radius="md" w={400}>
        <Stack gap="md">
          <Title order={2}>Inventory Management System</Title>
          <Text c="dimmed" size="sm">Sign in to continue</Text>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="admin@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <PasswordInput
                label="Password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <Text c="red" size="sm">{error}</Text>}
              <Button type="submit" loading={loading} fullWidth>
                Sign in
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </div>
  );
}
