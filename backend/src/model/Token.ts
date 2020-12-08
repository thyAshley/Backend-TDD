import { Model, DataTypes } from "sequelize";
import { sequelize } from "../db/database";

class Token extends Model implements IToken {
  readonly id?: string;
  token: string;
  lastUsedAt: Date;
  userId: string;
}

interface IToken {
  readonly id?: string;
  token: string;
  lastUsedAt: Date;
  userId: string;
}

Token.init(
  {
    token: {
      type: DataTypes.STRING,
    },
    lastUsedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "token",
    timestamps: false,
  }
);

export default Token;
