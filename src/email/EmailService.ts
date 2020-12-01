import nodemailer from "nodemailer";
import nodemailerStub from "nodemailer-stub-transport";

const transporter = nodemailer.createTransport(nodemailerStub());

export const sendAccountActivation = async (
  email: string,
  activationToken: string
) => {
  await transporter.sendMail({
    from: "Admin <admin@tdd.com>",
    to: email,
    subject: "Account Activation",
    html: `Token is ${activationToken}
    `,
  });
};
