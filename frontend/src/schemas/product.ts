import { z } from "zod";

export const productPayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  unit_id: z.number().int().positive("Unit is required"),
  category_id: z.number().int().positive("Category is required"),
  fund_cluster_id: z.number().int().positive("Fund cluster is required"),
  generic_name_id: z.number().int().positive().nullable().optional(),
  critical_level: z.number().min(0).nullable().optional(),
  product_code: z.string().optional(),
});

export type ProductPayloadSafe = z.infer<typeof productPayloadSchema>;
