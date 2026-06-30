import "server-only";

import nodemailer from "nodemailer";

import { getSetting } from "@/lib/settings";

/** From header — prefers MAIL_FROM/MAIL_FROM_NAME, falls back to SMTP_FROM. */
const FROM = process.env.MAIL_FROM
  ? `"${process.env.MAIL_FROM_NAME ?? "EkkiEinn.is"}" <${process.env.MAIL_FROM}>`
  : process.env.SMTP_FROM ?? "EkkiEinn.is <info@ekkieinn.is>";

/**
 * Builds the mail transport.
 *  - SMTP_USE_SENDMAIL=true  → local sendmail binary (no third-party service).
 *  - SMTP_HOST set           → SMTP server (localhost:25 etc).
 *  - otherwise               → null (dev fallback: content is logged).
 */
function getTransport() {
  if (process.env.SMTP_USE_SENDMAIL === "true") {
    return nodemailer.createTransport({
      sendmail: true,
      newline: "unix",
      path: process.env.SENDMAIL_PATH ?? "/usr/sbin/sendmail",
    });
  }

  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 25),
    secure: process.env.SMTP_SECURE === "true",
    tls: { rejectUnauthorized: false },
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });
}

/** Low-level send. Supports html and/or text; degrades to console in dev. */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const transport = getTransport();
  if (!transport) {
    console.info(
      `[email] (no transport configured) To: ${to}\n${subject}\n${text ?? html ?? ""}`,
    );
    return;
  }
  try {
    await transport.sendMail({ from: FROM, to, subject, html, text });
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const subject = await getSetting("verify_email_subject");
  const bodyTemplate = await getSetting("verify_email_body");
  const body = bodyTemplate.replaceAll("{{link}}", verifyUrl);
  await sendEmail({ to, subject, text: body });
}

export async function sendAdminNotification(subject: string, text: string) {
  const to = await getSetting("admin_notification_email");
  await sendEmail({ to, subject, text });
}
