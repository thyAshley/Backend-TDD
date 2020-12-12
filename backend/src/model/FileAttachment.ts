import { Sequelize, DataTypes, Model } from "sequelize";
import { sequelize } from "../db/database";

class FileAttachment extends Model implements FileAttachmentAttribute {
  readonly id: number;
  public filename: string;
  public uploadDate: Date;
  public fileType: string;
  public hoaxId: string;
}

interface FileAttachmentAttribute {
  readonly id: number;
  filename: string;
  fileType: string;
  uploadDate: Date;
  hoaxId: string;
}

FileAttachment.init(
  {
    filename: {
      type: DataTypes.STRING,
    },
    uploadDate: {
      type: DataTypes.DATE,
    },
    fileType: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "fileAttachment",
    timestamps: false,
  }
);

export default FileAttachment;
