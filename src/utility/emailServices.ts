import nodemailer from "nodemailer";
import HTTPError from "./error";
import {
  emailHost,
  emailPort,
  emailSecure,
  emailService,
} from "../constants/data";

export const mailService = async (
  email_id: string,
  subject: string,
  token: string,
  url: string
) => {
  //create transport cred

  const email_transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailSecure,
    service: emailService,
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const email_details = {
    from: process.env.EMAIL_ID,
    to: [email_id],
    subject: subject,
  };
  email_transporter.sendMail(
    {
      ...email_details,
      html: `<h1> please click on given link to activate your account</h1>
                <a href='${process.env.CLIENT_URL}/${url}/${token}'> ${process.env.CLIENT_URL}/${url}/${token}`,
    },
    async (err: unknown) => {
      if (err) {
        throw new HTTPError(err, 500);
      } else {
        return { success: true };
      }
    }
  );
};
