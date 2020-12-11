import { Sequelize, DataTypes, Model } from "sequelize";
import { sequelize } from "../db/database";

class FileAttachment extends Model implements FileAttachmentAttribute {
  readonly id: number;
  public filename: string;
  public uploadDate: Date;
}

interface FileAttachmentAttribute {
  readonly id: number;
  filename: string;
  uploadDate: Date;
}

FileAttachment.init(
  {
    filename: {
      type: DataTypes.STRING,
    },
    uploadDate: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "fileAttachment",
    timestamps: false,
  }
);

export default FileAttachment;
