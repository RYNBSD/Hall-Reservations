import { z } from "zod";

export default {
  Hall: {
    Params: z.object({
      id: z.coerce.number(),
    }),
  },
} as const;
