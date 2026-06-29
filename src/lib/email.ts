import "server-only";

import nodemailer from "nodemailer";

import { getSetting } from "@/lib/settings";

const FROM = process.env.SMTP_FROM ?? "Ekki einn <info@ekkieinn.is>";

/**
 * Builds an SMTP transport from env. Returns null when SMTP is not configured,
 * so the app degrades gracefully (the link is logged to the server console).
 */
function getTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });
}

async function send(to: string, subject: string, text: string) {
  const transport = getTransport();
  if (!transport) {
    // Dev/no-SMTP fallback: surface the content in logs instead of failing.
    console.info(`[email] (SMTP not configured) To: ${to}\n${subject}\n${text}`);
    return;
  }
  try {
    await transport.sendMail({ from: FROM, to, subject, text });
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const subject = await getSetting("verify_email_subject");
  const bodyTemplate = await getSetting("verify_email_body");
  const body = bodyTemplate.replaceAll("{{link}}", verifyUrl);
  await send(to, subject, body);
}

export async function sendAdminNotification(subject: string, text: string) {
  const to = await getSetting("admin_notification_email");
  await send(to, subject, text);
}
