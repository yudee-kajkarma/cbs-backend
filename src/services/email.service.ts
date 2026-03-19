import nodemailer from 'nodemailer';
import { config } from '../config/config';

interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export class EmailService {
  // Created lazily so env vars are always fully loaded at call time
  private static getTransporter() {
    return nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  static async sendMail(options: MailOptions): Promise<void> {
    await this.getTransporter().sendMail({
      from: `"${config.email.fromName}" <${config.email.fromAddress}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
    });
  }

  static async verifyConnection(): Promise<boolean> {
    try {
      await this.getTransporter().verify();
      return true;
    } catch {
      return false;
    }
  }
}
