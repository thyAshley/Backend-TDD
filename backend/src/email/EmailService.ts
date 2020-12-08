import nodemailer from "nodemailer";
import config from "config";

const mailConfig = config.get<any>("mail");

const transporter = nodemailer.createTransport({ ...mailConfig });

export const sendAccountActivation = async (
  email: string,
  activationToken: string
) => {
  const info = await transporter.sendMail({
    from: "Admin <admin@tdd.com>",
    to: email,
    subject: "Account Activation",
    html: `
    <div>
      <b>Please click below link to activate your account</b>
    </div>
    <div>
      Your Activation Token is ${activationToken}, Please ignore this email if you did not request this
    </div>
    `,
  });
  if (process.env.NODE_ENV === "dev") {
    console.log("url: " + nodemailer.getTestMessageUrl(info));
  }
};

export const sendPasswordResetMail = async (
  email: string,
  resetToken: string
) => {
  const info = await transporter.sendMail({
    from: "Admin <admin@tdd.com>",
    to: email,
    subject: "Password Reset",
    html: `
    <div>
      <b>Please click below link to reset your password</b>
    </div>
    <div>
      Your Password Reset Token is ${resetToken}, Please ignore this email if you did not request this
    </div>
    `,
  });
  if (process.env.NODE_ENV === "dev") {
    console.log("url: " + nodemailer.getTestMessageUrl(info));
  }
};
