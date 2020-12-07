import { Model, DataTypes } from "sequelize";

import { sequelize } from "../db/database";
import Token from "./Token";

const UserModel = Model;

class User extends UserModel implements IUser {
  readonly id?: string;
  username: string;
  password: string;
  email: string;
  active: boolean;
  activationToken: string;
  passwordResetToken?: string;
  image?: string;
}

interface IUser extends Model {
  readonly id?: string;
  username: string;
  email: string;
  password: string;
  active?: boolean;
  activationToken?: string;
  passwordResetToken?: string;
  image?: string;
}

User.init(
  {
    username: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.CHAR(60),
    },
    image: {
      type: DataTypes.STRING,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    activationToken: {
      type: DataTypes.STRING,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "user",
  }
);

User.hasMany(Token, {
  onDelete: "cascade",
  foreignKey: "userId",
});

export default User;
