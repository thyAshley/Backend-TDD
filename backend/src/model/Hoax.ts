import { Model, DataTypes } from "sequelize";
import { sequelize } from "../db/database";

class Hoax extends Model implements HoaxAttribute {
  readonly id: number;
  public content: string;
  public timestamp: string;
  readonly userid: number;
}

interface HoaxAttribute extends Model {
  readonly id: number;
  content: string;
  timestamp: string;
  readonly userid: number;
}

Hoax.init(
  {
    content: {
      type: DataTypes.STRING,
    },
    timestamp: {
      type: DataTypes.BIGINT,
    },
  },
  {
    sequelize,
    modelName: "hoax",
    timestamps: false,
  }
);

export default Hoax;
