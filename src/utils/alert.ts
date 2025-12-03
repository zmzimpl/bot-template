/**
 * Email Alert Utility
 * Send email notifications using Brevo (Sendinblue) API
 */

import SibApiV3Sdk from '@getbrevo/brevo';
import { getEnv } from '../config/env.js';

interface EmailOptions {
  subject: string;
  htmlContent: string;
  recipientEmail: string;
  senderEmail?: string;
  senderName?: string;
}

/**
 * Send an email using Brevo API
 * @param options - Email options
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const env = getEnv();
  const apiKey = env.BREVO_API_KEY;

  if (!apiKey) {
    console.error('[Email] Error: BREVO_API_KEY not configured');
    return false;
  }

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    apiKey
  );

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.htmlContent = options.htmlContent;
  sendSmtpEmail.sender = {
    email: options.senderEmail || env.EMAIL_SENDER,
    name: options.senderName,
  };
  sendSmtpEmail.to = [{ email: options.recipientEmail }];

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('[Email] Sent successfully:', JSON.stringify(result));
    return true;
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return false;
  }
}

/**
 * Send a simple text email
 * @param subject - Email subject
 * @param content - Email content (will be wrapped in basic HTML)
 * @param recipientEmail - Recipient email address
 */
export async function sendSimpleEmail(
  subject: string,
  content: string,
  recipientEmail: string
): Promise<boolean> {
  return sendEmail({
    subject,
    htmlContent: `<html><body><p>${content}</p></body></html>`,
    recipientEmail,
  });
}

/**
 * Send an alert email
 * @param subject - Alert subject
 * @param content - Alert content
 * @param recipientEmail - Recipient email address
 */
export async function sendAlert(
  subject: string,
  content: string,
  recipientEmail: string
): Promise<boolean> {
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #e74c3c;">Alert: ${subject}</h2>
        <p>${content}</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          This is an automated alert from Bot Template.
        </p>
      </body>
    </html>
  `;

  return sendEmail({
    subject: `[Alert] ${subject}`,
    htmlContent,
    recipientEmail,
  });
}
