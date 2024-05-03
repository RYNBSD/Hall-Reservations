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
    onDelete: "CASCADE",
    references: {
      model: User,
      key: "id",
    },
  },
});
User.hasMany(Hall);
Hall.belongsTo(User);

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
      onDelete: "CASCADE",
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
      onDelete: "CASCADE",
      references: {
        model: Hall,
        key: "id",
      },
    },
  }
);
Hall.hasMany(HallServices);
HallServices.belongsTo(Hall);

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
      onDelete: "CASCADE",
      references: {
        model: Hall,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      onDelete: "CASCADE",
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
    onDelete: "CASCADE",
    references: {
      model: UserReservations,
      key: "id",
    },
  },
  serviceId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    onDelete: "CASCADE",
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
