import { z } from "zod";

export default {
  Create: {
    Body: z.object({
      hallId: z.coerce.number(),
      start: z.coerce.date(),
      end: z.coerce.date(),
      services: z.string().trim(),
    }),
  },
  Update: {
    Params: z.object({
      id: z.coerce.number(),
    }),
    Body: z.object({
      start: z.coerce.date(),
      end: z.coerce.date(),
      services: z.string().trim(),
      removedServices: z.string().trim(),
    }),
  },
  Remove: {
    Params: z.object({
      id: z.coerce.number(),
    }),
  },
} as const;
