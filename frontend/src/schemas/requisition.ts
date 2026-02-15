import { z } from "zod";

export const requisitionPayloadSchema = z.object({
  ris_no: z.string().min(1, "RIS No is required"),
  department_id: z.number().int().positive("Department is required"),
  requested_by: z.string().min(1, "Requested by is required"),
  designation: z.string().min(1, "Designation is required"),
  purpose: z.string().default(""),
  with_inspection: z.boolean(),
});

export type RequisitionPayloadInput = z.input<typeof requisitionPayloadSchema>;
export type RequisitionPayloadSafe = z.infer<typeof requisitionPayloadSchema>;
