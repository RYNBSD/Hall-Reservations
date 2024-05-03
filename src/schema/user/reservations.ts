import { z } from "zod";

export default {
  Create: {
    Body: z.object({
      hallId: z.coerce.number(),
      start: z.coerce.date(),
      end: z.coerce.date(),
      services: z.array(z.coerce.number())
    }),
  },
  Update: {
    Params: z.object({
      id: z.coerce.number()
    }),
    Body: z.object({
      start: z.coerce.date(),
      end: z.coerce.date(),
      services: z.array(z.coerce.number()),
      removedServices: z.array(z.coerce.number())
    }),
  },
  Remove: {
    Params: z.object({
      id: z.coerce.number()
    })
  }
} as const;
