import { z } from "zod";

export const CheckoutSchema = z.object({
  planId: z.string().uuid(),
});
export type CheckoutInput = z.infer<typeof CheckoutSchema>;
