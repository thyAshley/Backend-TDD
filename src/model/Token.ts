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
    userId: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    modelName: "token",
  }
);

export default Token;
