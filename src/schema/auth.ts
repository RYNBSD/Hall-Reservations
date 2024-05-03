import { z } from "zod";
import { USER_ROLE } from "../constant/index.js";

export default {
  SignUp: {
    Body: z.object({
      username: z.string().trim().min(1),
      email: z.string().trim().min(1).email(),
      phone: z.string().trim().min(1),
      password: z.string().trim().min(1),
      role: z.enum(USER_ROLE),
    }),
  },
  SignIn: {
    Body: z.object({
      email: z.string().trim().min(1).email(),
      password: z.string().trim().min(1),
    }),
  },
} as const;
