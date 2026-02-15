import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { requisitionsApi } from "@api/requisitions";

export interface RequisitionCreatePayload {
  ris_no: string;
  department_id: number;
  requested_by: string;
  designation: string;
  purpose: string;
  with_inspection: boolean;
}

export interface RequisitionUpdatePayload {
  ris_no: string;
  department_id: number;
  requested_by: string;
  designation: string;
  purpose?: string;
  with_inspection: boolean;
}

export function useRequisitionMutation() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (payload: RequisitionCreatePayload) => requisitionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      notifications.show({ title: "Created", message: "Requisition created.", color: "green" });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RequisitionUpdatePayload }) =>
      requisitionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      notifications.show({ title: "Updated", message: "Requisition updated.", color: "green" });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => requisitionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      notifications.show({ title: "Deleted", message: "Requisition deleted.", color: "green" });
    },
  });

  return { create, update, remove };
}
