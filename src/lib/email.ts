import "server-only";

import nodemailer from "nodemailer";

import { getSetting } from "@/lib/settings";
import { getDbSetting, getEmailConfig } from "@/lib/admin-settings";

/** From header — DB email_from/email_from_name first, then env, then default. */
async function getFrom(): Promise<string> {
  const cfg = await getEmailConfig();
  if (cfg.email_from) {
    return `"${cfg.email_from_name || "EkkiEinn.is"}" <${cfg.email_from}>`;
  }
  return process.env.SMTP_FROM ?? "EkkiEinn.is <info@ekkieinn.is>";
}

/**
 * Builds the mail transport.
 *  - A DB SMTP host (Stillingar → Tölvupóstur) takes precedence.
 *  - SMTP_USE_SENDMAIL=true  → local sendmail binary (no third-party service).
 *  - SMTP_HOST set           → SMTP server (localhost:25 etc).
 *  - otherwise               → null (dev fallback: content is logged).
 */
async function getTransport() {
  // An SMTP host explicitly saved in the DB (Stillingar → Tölvupóstur) wins.
  const dbHost = await getDbSetting("email_smtp_host");
  if (dbHost) {
    const cfg = await getEmailConfig();
    return nodemailer.createTransport({
      host: dbHost,
      port: Number(cfg.email_smtp_port || 25),
      secure: process.env.SMTP_SECURE === "true",
      tls: { rejectUnauthorized: false },
      auth: cfg.email_smtp_user
        ? { user: cfg.email_smtp_user, pass: cfg.email_smtp_pass }
        : undefined,
    });
  }

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
  const transport = await getTransport();
  if (!transport) {
    console.info(
      `[email] (no transport configured) To: ${to}\n${subject}\n${text ?? html ?? ""}`,
    );
    return;
  }
  const from = await getFrom();
  try {
    await transport.sendMail({ from, to, subject, html, text });
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
