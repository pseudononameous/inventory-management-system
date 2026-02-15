import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { productsApi, type ProductPayload } from "@api/products";

export function useProductMutation() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (payload: ProductPayload) => productsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      notifications.show({ title: "Created", message: "Product created.", color: "green" });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ProductPayload> }) =>
      productsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      notifications.show({ title: "Updated", message: "Product updated.", color: "green" });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      notifications.show({ title: "Deleted", message: "Product deleted.", color: "green" });
    },
  });

  return { create, update, remove };
}
