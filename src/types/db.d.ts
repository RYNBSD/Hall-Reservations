import type {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import type { z } from "zod";
import type { schema } from "../schema/index.js";

type CreationOptionalId = { id: CreationOptional<number> };
// type CreationOptionalUserId = { userId: CreationOptional<number> };
// type CreationOptionalHallId = { hallId: CreationOptional<number> };
// type CreationOptionalReservationId = {
//   reservationId: CreationOptional<number>;
// };
// type CreationOptionalServiceId = { serviceId: CreationOptional<number> };

type User = z.infer<typeof schema.db.User> & CreationOptionalId;
type Hall = z.infer<typeof schema.db.Hall> & CreationOptionalId;
type HallImages = z.infer<typeof schema.db.HallImages> & CreationOptionalId;
type HallServices = z.infer<typeof schema.db.HallServices> & CreationOptionalId;
type UserReservations = z.infer<typeof schema.db.UserReservations> &
  CreationOptionalId;
type UserReservationServices = z.infer<
  typeof schema.db.UserReservationServices
> &
  CreationOptionalId;

export type Tables = {
  User: Model<InferAttributes<User>, InferCreationAttributes<User>>;
  Hall: Model<InferAttributes<Hall>, InferCreationAttributes<Hall>>;
  HallImages: Model<
    InferAttributes<HallImages>,
    InferCreationAttributes<HallImages>
  >;
  HallServices: Model<
    InferAttributes<HallServices>,
    InferCreationAttributes<HallServices>
  >;
  UserReservations: Model<
    InferAttributes<UserReservations>,
    InferCreationAttributes<UserReservations>
  >;
  UserReservationServices: Model<
    InferAttributes<UserReservationServices>,
    InferCreationAttributes<UserReservationServices>
  >;
};
