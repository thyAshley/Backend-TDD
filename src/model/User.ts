import { Model, DataTypes } from "sequelize";
import { sequelize } from "../db/database";

const UserModel = Model;

class User extends UserModel implements IUser {
  username: string;
  password: string;
  email: string;
  active: boolean;
  activationToken: string;
}

interface IUser extends Model {
  username: string;
  email: string;
  password: string;
  active?: boolean;
  activationToken?: string;
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
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    activationToken: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "user",
  }
);

export default User;
