import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 8587,
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendAccountActivation = async (
  email: string,
  activationToken: string
) => {
  await transporter.sendMail({
    from: "Admin <admin@tdd.com>",
    to: email,
    subject: "Account Activation",
    html: `Your Activation Token is ${activationToken}, Please ignore this email if you did not request this
    `,
  });
};
