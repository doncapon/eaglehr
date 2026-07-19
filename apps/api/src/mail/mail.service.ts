import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

interface OrganizationInvitationEmail {
  to: string;
  organizationName: string;
  inviterName: string;
  acceptUrl: string;
}

interface EmailVerificationEmail {
  to: string;
  firstName: string;
  verifyUrl: string;
}

interface PasswordResetEmail {
  to: string;
  firstName: string;
  resetUrl: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly sandboxRedirectTo: string | null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>("RESEND_API_KEY");
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from = this.config.get<string>("MAIL_FROM") ?? "EagleHR <no-reply@eaglehr.ng>";
    // Resend's sandbox mode (no verified sending domain yet) only delivers to the
    // account owner's own address. Until a domain is verified, redirect every send
    // there instead of letting Resend silently reject real recipients.
    this.sandboxRedirectTo = this.config.get<string>("MAIL_SANDBOX_REDIRECT_TO") ?? null;
  }

  /** Resolves the actual recipient + a subject prefix noting who the email was really for, when sandboxed. */
  private resolveRecipient(to: string): { to: string; subjectPrefix: string } {
    if (this.sandboxRedirectTo && this.sandboxRedirectTo.toLowerCase() !== to.toLowerCase()) {
      return { to: this.sandboxRedirectTo, subjectPrefix: `[for ${to}] ` };
    }
    return { to, subjectPrefix: "" };
  }

  async sendOrganizationInvitation(params: OrganizationInvitationEmail): Promise<void> {
    const { to, subjectPrefix } = this.resolveRecipient(params.to);
    const subject = `${subjectPrefix}You're invited to join ${params.organizationName} on EagleHR`;
    const html = `
      <p>Hi,</p>
      <p>${params.inviterName} invited you to join <strong>${params.organizationName}</strong>'s HR workspace on EagleHR.</p>
      <p><a href="${params.acceptUrl}">Accept invitation</a></p>
      <p>This invitation expires in 7 days.</p>
    `;

    if (!this.resend) {
      this.logger.warn(`RESEND_API_KEY not set — skipping invitation email to ${params.to} (link: ${params.acceptUrl})`);
      return;
    }

    try {
      await this.resend.emails.send({ from: this.from, to, subject, html });
    } catch (error) {
      // Non-fatal: the invitation record + token remain valid even if the notification email fails.
      // Log the link itself, not just the error — otherwise a send failure (e.g. Resend sandbox
      // mode rejecting the recipient) leaves no way to recover the link for this invitee.
      this.logger.error(
        `Failed to send invitation email to ${params.to} (link: ${params.acceptUrl})`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async sendEmailVerification(params: EmailVerificationEmail): Promise<void> {
    const { to, subjectPrefix } = this.resolveRecipient(params.to);
    const subject = `${subjectPrefix}Verify your email address for EagleHR`;
    const html = `
      <p>Hi ${params.firstName},</p>
      <p>Thanks for signing up for EagleHR. Please confirm your email address to get started.</p>
      <p><a href="${params.verifyUrl}">Verify my email</a></p>
      <p>This link expires in 24 hours.</p>
    `;

    if (!this.resend) {
      this.logger.warn(`RESEND_API_KEY not set — skipping verification email to ${params.to} (link: ${params.verifyUrl})`);
      return;
    }

    try {
      await this.resend.emails.send({ from: this.from, to, subject, html });
    } catch (error) {
      // Non-fatal: the token remains valid even if the notification email fails; user can request a resend.
      // Log the link itself, not just the error — otherwise a send failure (e.g. Resend sandbox
      // mode rejecting the recipient) leaves no way to recover the link for this user.
      this.logger.error(
        `Failed to send verification email to ${params.to} (link: ${params.verifyUrl})`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async sendPasswordReset(params: PasswordResetEmail): Promise<void> {
    const { to, subjectPrefix } = this.resolveRecipient(params.to);
    const subject = `${subjectPrefix}Reset your EagleHR password`;
    const html = `
      <p>Hi ${params.firstName},</p>
      <p>We received a request to reset your EagleHR password. If this was you, click below to choose a new one.</p>
      <p><a href="${params.resetUrl}">Reset my password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `;

    if (!this.resend) {
      this.logger.warn(`RESEND_API_KEY not set — skipping password reset email to ${params.to} (link: ${params.resetUrl})`);
      return;
    }

    try {
      await this.resend.emails.send({ from: this.from, to, subject, html });
    } catch (error) {
      // Non-fatal: the token remains valid even if the notification email fails; user can request another.
      this.logger.error(
        `Failed to send password reset email to ${params.to} (link: ${params.resetUrl})`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
