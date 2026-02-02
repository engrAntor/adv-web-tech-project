// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create transporter with SMTP settings
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"Learning Platform" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendOTP(to: string, otp: string): Promise<boolean> {
    const subject = 'Password Reset OTP - Learning Platform';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
          .warning { color: #e74c3c; font-size: 14px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password. Use the OTP below to proceed:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            <p class="warning">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendEmailVerification(to: string, otp: string): Promise<boolean> {
    const subject = 'Verify Your Email - Learning Platform';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #11998e; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #11998e; letter-spacing: 8px; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Learning Platform!</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Thank you for registering! Please verify your email address using the OTP below:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p>This OTP is valid for <strong>15 minutes</strong>.</p>
            <p>Once verified, you'll have full access to all courses and features.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
    const subject = 'Welcome to Learning Platform!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome, ${firstName || 'Learner'}!</h1>
          </div>
          <div class="content">
            <p>Your email has been verified successfully!</p>
            <p>You now have full access to:</p>
            <ul>
              <li>Hundreds of courses across various topics</li>
              <li>Interactive quizzes and assessments</li>
              <li>Certificates upon course completion</li>
              <li>Community forums and discussions</li>
            </ul>
            <p>Start your learning journey today!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendMail(to, subject, html);
  }

  // Send notification to admin when someone submits contact form
  async sendContactNotification(
    name: string,
    email: string,
    subject: string,
    message: string,
  ): Promise<boolean> {
    const adminEmail = 'engr.antor.3@gmail.com';
    const emailSubject = `New Contact Form Submission: ${subject}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; border-left: 4px solid #f5576c; }
          .label { font-weight: bold; color: #555; margin-bottom: 5px; }
          .message-box { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; border: 1px solid #ddd; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
          </div>
          <div class="content">
            <p>You have received a new message from the contact form:</p>
            <div class="info-box">
              <p class="label">From:</p>
              <p>${name} (${email})</p>
            </div>
            <div class="info-box">
              <p class="label">Subject:</p>
              <p>${subject}</p>
            </div>
            <div class="message-box">
              <p class="label">Message:</p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            <p>Please respond to this inquiry as soon as possible.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendMail(adminEmail, emailSubject, html);
  }

  // Send email notification when someone replies to a forum thread
  async sendForumReplyNotification(
    to: string,
    authorName: string,
    postTitle: string,
    replyContent: string,
  ): Promise<boolean> {
    const subject = `New reply to your post: "${postTitle}"`;
    const replyPreview = replyContent.length > 200 ? replyContent.substring(0, 200) + '...' : replyContent;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reply-box { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; border-left: 4px solid #667eea; }
          .reply-author { font-weight: bold; color: #667eea; margin-bottom: 10px; }
          .reply-content { color: #555; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Reply to Your Post</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Someone has replied to your forum post: <strong>"${postTitle}"</strong></p>
            <div class="reply-box">
              <p class="reply-author">${authorName} wrote:</p>
              <p class="reply-content">${replyPreview}</p>
            </div>
            <p>Visit the discussion to read the full reply and continue the conversation.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendMail(to, subject, html);
  }

  // Send auto-receipt email to user after they submit contact form
  async sendContactReceipt(
    name: string,
    email: string,
    subject: string,
  ): Promise<boolean> {
    const emailSubject = 'We received your message - Learning Platform';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; border-left: 4px solid #11998e; }
          .contact-info { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; text-align: center; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Contacting Us!</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>We have received your message and appreciate you reaching out to us.</p>
            <div class="info-box">
              <p><strong>Your Subject:</strong> ${subject}</p>
            </div>
            <p>Our team will review your inquiry and get back to you within <strong>24-48 hours</strong>.</p>
            <div class="contact-info">
              <p><strong>Need urgent assistance?</strong></p>
              <p>Email: engr.antor.3@gmail.com</p>
              <p>Phone: +880 1832-814129</p>
            </div>
            <p>Thank you for your patience!</p>
            <p>Best regards,<br>The Learning Platform Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendMail(email, emailSubject, html);
  }
}
