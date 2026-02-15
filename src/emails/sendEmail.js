import { env } from "../config/env.js";
import transporter from "../config/nodemiler.config.js";

const sendEmail = async ({ to, subject, html }) => {
  return await transporter.sendMail({
    from: env.EMAIL_USERNAME,
    to,
    subject,
    html,
  });
};

export default sendEmail;
