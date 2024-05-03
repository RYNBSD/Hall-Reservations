import { z } from "zod";
import { HALL_SERVICE_TYPE, USER_ROLE } from "../constant/index.js";

const Id = z.object({ id: z.number() });
const UserId = z.object({ userId: z.number() });
const HallId = z.object({ hallId: z.number() });
const ReservationId = z.object({ reservationId: z.number() });
const ServiceId = z.object({ serviceId: z.number() });

export const User = z
  .object({
    username: z.string(),
    email: z.string().email(),
    phone: z.string(),
    password: z.string(),
    role: z.enum(USER_ROLE),
  })
  .merge(Id);

export const Hall = z
  .object({
    name: z.string(),
    description: z.string(),
    location: z.string(),
    price: z.string(),
    people: z.number(),
  })
  .merge(Id)
  .merge(UserId);

export const HallImages = z
  .object({
    image: z.string(),
  })
  .merge(Id)
  .merge(HallId);

export const HallServices = z
  .object({
    name: z.string(),
    image: z.string(),
    type: z.enum(HALL_SERVICE_TYPE),
    price: z.number(),
  })
  .merge(Id)
  .merge(HallId);

export const UserReservations = z
  .object({
    start: z.date(),
    end: z.date(),
  })
  .merge(Id)
  .merge(UserId)
  .merge(HallId);

export const UserReservationServices = z
  .object({})
  .merge(Id)
  .merge(ReservationId)
  .merge(ServiceId);
