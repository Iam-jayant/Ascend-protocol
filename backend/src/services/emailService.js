import nodemailer from 'nodemailer';
import { config } from '../config/services.js';

/**
 * Email Service for Ascend Protocol
 * Handles sending emails for vault notifications, withdrawal credentials, etc.
 */
export class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  /**
   * Create email transporter
   */
  createTransporter() {
    // Use Gmail SMTP for email sending
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
  }

  /**
   * Send email using SMTP
   * @param {Object} mailOptions - Email options
   */
  async sendEmail(mailOptions) {
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent via SMTP to ${mailOptions.to}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send vault triggered notification to beneficiaries
   * @param {Object} vaultData - Vault information
   * @param {Array} beneficiaries - List of beneficiaries
   */
  async sendVaultTriggeredNotification(vaultData, beneficiaries) {
    try {
      console.log('📧 Sending vault triggered notifications...');

      // For demo/testing purposes, just log the emails instead of actually sending
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        console.log('📧 DEMO MODE: Email notifications would be sent to:');
        for (const beneficiary of beneficiaries) {
          if (beneficiary.email) {
            console.log(`  - ${beneficiary.email}: Vault ${vaultData.id} triggered`);
          }
        }
        return { success: true, message: 'Demo notifications logged successfully' };
      }

      for (const beneficiary of beneficiaries) {
        if (beneficiary.email) {
          const mailOptions = {
            from: config.email.fromEmail,
            to: beneficiary.email,
            subject: '🚨 Ascend Protocol: Inheritance Vault Triggered',
            html: this.getVaultTriggeredTemplate(vaultData, beneficiary)
          };

          await this.sendEmail(mailOptions);
        }
      }

      return { success: true, message: 'Notifications sent successfully' };
    } catch (error) {
      console.error('❌ Error sending vault triggered notifications:', error);
      throw error;
    }
  }

  /**
   * Send withdrawal credentials to beneficiary
   * @param {Object} claimData - Claim information
   * @param {Object} beneficiary - Beneficiary information
   */
  async sendWithdrawalCredentials(claimData, beneficiary) {
    try {
      console.log(`📧 Sending withdrawal credentials to ${beneficiary.email}`);

      // For demo/testing purposes, just log the email instead of actually sending
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        console.log('📧 DEMO MODE: Withdrawal credentials email would be sent to:');
        console.log(`  - ${beneficiary.email}: Claim token ${claimData.claimToken}, Amount: ${claimData.amount} USDC`);
        return { success: true, message: 'Demo withdrawal credentials logged successfully' };
      }

      const mailOptions = {
        from: config.email.fromEmail,
        to: beneficiary.email,
        subject: '💰 Ascend Protocol: Your Inheritance Claim is Ready',
        html: this.getWithdrawalCredentialsTemplate(claimData, beneficiary)
      };

      await this.sendEmail(mailOptions);

      return { success: true, message: 'Withdrawal credentials sent successfully' };
    } catch (error) {
      console.error('❌ Error sending withdrawal credentials:', error);
      throw error;
    }
  }

  /**
   * Send check-in reminder to vault owner
   * @param {Object} vaultData - Vault information
   * @param {string} ownerEmail - Owner's email
   */
  async sendCheckInReminder(vaultData, ownerEmail) {
    try {
      console.log(`📧 Sending check-in reminder to ${ownerEmail}`);

      const mailOptions = {
        from: config.email.fromEmail,
        to: ownerEmail,
        subject: '⏰ Ascend Protocol: Check-in Reminder',
        html: this.getCheckInReminderTemplate(vaultData)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Check-in reminder sent to ${ownerEmail}`);

      return { success: true, message: 'Check-in reminder sent successfully' };
    } catch (error) {
      console.error('❌ Error sending check-in reminder:', error);
      throw error;
    }
  }

  /**
   * Send vault created confirmation
   * @param {Object} vaultData - Vault information
   * @param {string} ownerEmail - Owner's email
   */
  async sendVaultCreatedConfirmation(vaultData, ownerEmail) {
    try {
      console.log(`📧 Sending vault created confirmation to ${ownerEmail}`);

      const mailOptions = {
        from: config.email.fromEmail,
        to: ownerEmail,
        subject: '✅ Ascend Protocol: Vault Created Successfully',
        html: this.getVaultCreatedTemplate(vaultData)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Vault created confirmation sent to ${ownerEmail}`);

      return { success: true, message: 'Vault created confirmation sent successfully' };
    } catch (error) {
      console.error('❌ Error sending vault created confirmation:', error);
      throw error;
    }
  }

  /**
   * Get vault triggered email template
   */
  getVaultTriggeredTemplate(vaultData, beneficiary) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Vault Triggered - Ascend Protocol</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Inheritance Vault Triggered</h1>
          </div>
          <div class="content">
            <h2>Dear ${beneficiary.name || 'Beneficiary'},</h2>
            <p>We are writing to inform you that an inheritance vault has been triggered and you are listed as a beneficiary.</p>
            
            <h3>Vault Details:</h3>
            <ul>
              <li><strong>Vault ID:</strong> ${vaultData.id}</li>
              <li><strong>Your Share:</strong> ${beneficiary.sharePercentage / 100}%</li>
              <li><strong>Triggered At:</strong> ${new Date().toLocaleString()}</li>
            </ul>

            <h3>Next Steps:</h3>
            <p>You will receive withdrawal credentials shortly. Please keep this information secure and follow the instructions to claim your inheritance.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3002'}/claim/static" class="button">View Claim Details</a>
            
            <p><strong>Important:</strong> This is an automated message. Please do not reply to this email.</p>
          </div>
          <div class="footer">
            <p>Ascend Protocol - India's First Crypto Inheritance Protocol</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get withdrawal credentials email template
   */
  getWithdrawalCredentialsTemplate(claimData, beneficiary) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Withdrawal Credentials - Ascend Protocol</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .credentials { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Your Inheritance is Ready</h1>
          </div>
          <div class="content">
            <h2>Dear ${beneficiary.name || 'Beneficiary'},</h2>
            <p>Congratulations! Your inheritance claim is now ready for withdrawal.</p>
            
            <h3>Claim Details:</h3>
            <ul>
              <li><strong>Claim Token:</strong> ${claimData.claimToken}</li>
              <li><strong>Amount:</strong> ${claimData.amount} USDC</li>
              <li><strong>Your Share:</strong> ${beneficiary.sharePercentage / 100}%</li>
            </ul>

            <div class="credentials">
              <h3>🔐 Withdrawal Credentials:</h3>
              <p><strong>Claim Token:</strong> <code>${claimData.claimToken}</code></p>
              <p><strong>Expires:</strong> ${new Date(claimData.expiresAt).toLocaleString()}</p>
            </div>

            <div class="warning">
              <strong>⚠️ Important Security Notice:</strong>
              <ul>
                <li>Keep your claim token secure and confidential</li>
                <li>Do not share these credentials with anyone</li>
                <li>Complete your withdrawal before the expiration date</li>
              </ul>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3002'}/claim/static" class="button">Claim Your Inheritance</a>
            
            <p><strong>Need Help?</strong> Contact our support team if you have any questions.</p>
          </div>
          <div class="footer">
            <p>Ascend Protocol - India's First Crypto Inheritance Protocol</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get check-in reminder email template
   */
  getCheckInReminderTemplate(vaultData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Check-in Reminder - Ascend Protocol</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Check-in Reminder</h1>
          </div>
          <div class="content">
            <h2>Dear Vault Owner,</h2>
            <p>This is a friendly reminder that your inheritance vault requires a check-in to remain active.</p>
            
            <h3>Vault Details:</h3>
            <ul>
              <li><strong>Vault ID:</strong> ${vaultData.id}</li>
              <li><strong>Last Check-in:</strong> ${new Date(vaultData.lastCheckIn).toLocaleString()}</li>
              <li><strong>Next Deadline:</strong> ${new Date(vaultData.nextDeadline).toLocaleString()}</li>
            </ul>

            <p><strong>Action Required:</strong> Please check in to your vault to reset the timer and keep your inheritance vault active.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3002'}/vault/${vaultData.id}" class="button">Check In Now</a>
            
            <p><strong>Note:</strong> If you don't check in by the deadline, your vault will be triggered and assets will be distributed to beneficiaries.</p>
          </div>
          <div class="footer">
            <p>Ascend Protocol - India's First Crypto Inheritance Protocol</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get vault created email template
   */
  getVaultCreatedTemplate(vaultData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Vault Created - Ascend Protocol</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Vault Created Successfully</h1>
          </div>
          <div class="content">
            <h2>Congratulations!</h2>
            <p>Your inheritance vault has been created successfully.</p>
            
            <h3>Vault Details:</h3>
            <ul>
              <li><strong>Vault ID:</strong> ${vaultData.id}</li>
              <li><strong>Vault Address:</strong> ${vaultData.address}</li>
              <li><strong>Check-in Period:</strong> ${vaultData.checkInPeriod} days</li>
              <li><strong>Grace Period:</strong> ${vaultData.gracePeriod} days</li>
              <li><strong>Created:</strong> ${new Date().toLocaleString()}</li>
            </ul>

            <h3>Next Steps:</h3>
            <ol>
              <li>Add beneficiaries to your vault</li>
              <li>Set up regular check-ins to keep the vault active</li>
              <li>Monitor your vault status regularly</li>
            </ol>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3002'}/vault/${vaultData.id}" class="button">Manage Your Vault</a>
            
            <p><strong>Important:</strong> Remember to check in regularly to prevent the vault from triggering automatically.</p>
          </div>
          <div class="footer">
            <p>Ascend Protocol - India's First Crypto Inheritance Protocol</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default EmailService;
