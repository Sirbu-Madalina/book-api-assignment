import nodemailer from "nodemailer";

type SendPasswordResetEmailInput = {
  to: string;
  resetLink: string;
};

function getTransporter() {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT ?? 587);
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!host || !user || !pass) {
    throw new Error("Email configuration is missing.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendPasswordResetEmail({
  to,
  resetLink,
}: SendPasswordResetEmailInput) {
  const transporter = getTransporter();
  const from = process.env.MAIL_FROM ?? process.env.MAIL_USER;

  await transporter.sendMail({
    from,
    to,
    subject: "Reset your PageTurn password",
    text: `Reset your PageTurn password using this link: ${resetLink}\n\nThis link expires in 30 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Reset your PageTurn password</h2>
        <p>Click the button below to choose a new password. This link expires in 30 minutes.</p>
        <p>
          <a href="${resetLink}" style="display:inline-block;padding:12px 18px;background:#7e9776;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">
            Reset password
          </a>
        </p>
        <p>If the button does not work, copy this link into your browser:</p>
        <p>${resetLink}</p>
      </div>
    `,
  });
}
