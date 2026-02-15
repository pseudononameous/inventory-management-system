import { z } from "zod";

export const libraryNameSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type LibraryNameInput = z.infer<typeof libraryNameSchema>;
