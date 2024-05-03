import { z } from "zod";

export default {
  Hall: {
    Params: z.object({
      id: z.coerce.number(),
    }),
  },
  Create: {
    Body: z.object({
      name: z.string().trim().min(1),
      description: z.string().trim().min(1),
      location: z.string().trim().min(1),
      price: z.coerce.number(),
      people: z.coerce.number(),
      servicesName: z.string().trim(),
      servicesPrice: z.string().trim(),
      servicesType: z.string().trim(),
    }),
  },
  Update: {
    Body: z.object({
      name: z.string().trim().min(1),
      description: z.string().trim().min(1),
      location: z.string().trim().min(1),
      price: z.coerce.number(),
      people: z.coerce.number(),
      removedImages: z.string().trim(),
    }),
    Params: z.object({
      id: z.coerce.number(),
    }),
  },
  Remove: {
    Params: z.object({
      id: z.coerce.number(),
    }),
  },
} as const;
