import { z } from "zod";
import hall from "./hall.js";
import reservations from "./reservations.js";

export default {
  Update: {
    Body: z.object({
      username: z.string().trim().min(1),
      email: z.string().trim().min(1).email(),
      phone: z.string().trim().min(1),
      password: z.string().trim().min(1),
    }),
  },
  reservations,
  hall,
} as const;
