import { z } from "zod";

export const tabularSchema = z.object({
  age: z.number(),
  bmi: z.number(),
  cycleType: z.enum(["R", "I"]),
  lh: z.number(),
  fsh: z.number(),
});
