import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
export type LibraryApi = {
  create: (payload: { name: string }) => Promise<unknown>;
  update: (id: number, payload: { name: string }) => Promise<unknown>;
  delete: (id: number) => Promise<unknown>;
};

export function useLibraryMutation(queryKey: string, api: LibraryApi, entityLabel: string) {
  const queryClient = useQueryClient();
  const singular = entityLabel.replace(/s$/, "");

  const create = useMutation({
    mutationFn: (payload: { name: string }) => api.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      notifications.show({ title: "Created", message: `${singular} created.`, color: "green" });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => api.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      notifications.show({ title: "Updated", message: `${singular} updated.`, color: "green" });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      notifications.show({ title: "Deleted", message: `${singular} deleted.`, color: "green" });
    },
  });

  return { create, update, remove };
}
