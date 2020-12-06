import { Model, DataTypes } from "sequelize";
import { sequelize } from "../db/database";

class Token extends Model implements IToken {
  token: string;
  userId: number;
}

interface IToken {
  token: string;
  userId: number;
}

Token.init(
  {
    token: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "token",
  }
);

export default Token;
