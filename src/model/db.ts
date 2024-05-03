import { DataTypes, where } from "sequelize";
import type { Tables } from "../types/index.js";
import { USER_ROLE, HALL_SERVICE_TYPE } from "../constant/index.js";

export const User = sequelize.define<Tables["User"]>("user", {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM(...USER_ROLE),
    allowNull: false,
  },
});
User.addHook("afterDestroy", async (user) => {
  await Promise.all([
    Hall.destroy({ force: true, where: { userId: user.dataValues.id } }),
    UserReservations.destroy({
      force: true,
      where: { userId: user.dataValues.id },
    }),
  ]);
});

export const Hall = sequelize.define<Tables["Hall"]>("hall", {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(1000),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT.UNSIGNED,
    allowNull: false,
  },
  people: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
});
User.hasMany(Hall);
Hall.belongsTo(User);
Hall.addHook("afterDestroy", async (hall) => {
  await Promise.all([
    HallImages.destroy({ force: true, where: { hallId: hall.dataValues.id } }),
    HallServices.destroy({
      force: true,
      where: { hallId: hall.dataValues.id },
    }),
    UserReservations.destroy({
      force: true,
      where: { hallId: hall.dataValues.id },
    }),
  ]);
});

export const HallImages = sequelize.define<Tables["HallImages"]>(
  "hall-images",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    hallId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: Hall,
        key: "id",
      },
    },
  }
);
Hall.hasMany(HallImages);
HallImages.belongsTo(Hall);

export const HallServices = sequelize.define<Tables["HallServices"]>(
  "hall-services",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...HALL_SERVICE_TYPE),
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT.UNSIGNED,
      allowNull: false,
    },
    hallId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: Hall,
        key: "id",
      },
    },
  }
);
Hall.hasMany(HallServices);
HallServices.belongsTo(Hall);
HallServices.addHook("afterDestroy", async (service) => {
  await Promise.all([
    UserReservationServices.destroy({
      force: true,
      where: { serviceId: service.dataValues.id },
    }),
  ]);
});

export const UserReservations = sequelize.define<Tables["UserReservations"]>(
  "user-reservations",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    hallId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: Hall,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  }
);
User.hasMany(UserReservations);
UserReservations.belongsTo(User);
Hall.hasMany(UserReservations);
UserReservations.belongsTo(Hall);
UserReservations.addHook("afterDestroy", async (reservation) => {
  await Promise.all([
    UserReservationServices.destroy({
      force: true,
      where: { reservationId: reservation.dataValues.id },
    }),
  ]);
});

export const UserReservationServices = sequelize.define<
  Tables["UserReservationServices"]
>("user-reservation-services", {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  reservationId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: UserReservations,
      key: "id",
    },
  },
  serviceId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: HallServices,
      key: "id",
    },
  },
});
UserReservations.hasMany(UserReservationServices);
UserReservationServices.belongsTo(UserReservations);
HallServices.hasMany(UserReservationServices);
UserReservationServices.belongsTo(HallServices);
