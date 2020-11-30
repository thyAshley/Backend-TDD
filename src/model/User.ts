import { Model, DataTypes } from "sequelize";
import { sequelize } from "../db/database";

const UserModel = Model;

class User extends UserModel implements IUser {
  username: string;
  password: string;
  email: string;
}

interface IUser extends Model {
  username: string;
  email: string;
  password: string;
}

User.init(
  {
    username: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.CHAR(60),
    },
  },
  {
    sequelize,
    modelName: "user",
  }
);

export default User;
