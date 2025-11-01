import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Debug: Log configuration (remove in production)
console.log('📧 Email Config:', {
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: process.env.SMTP_PORT || '465',
  user: process.env.SMTP_USER ? '✅ Set' : '❌ Missing',
  pass: process.env.SMTP_PASS ? '✅ Set' : '❌ Missing',
});

// Create transporter with SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service configuration error:', error);
  } else {
    console.log('✅ Email service is ready to send messages');
  }
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"WORKORG" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.log(`✅ Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendProjectInvitation = async (
  email: string,
  projectName: string,
  inviterName: string,
  invitationToken: string
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const invitationLink = `${frontendUrl}/invite/${invitationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          max-width: 600px;
          margin: 0 auto;
          padding: 0;
          background-color: #f3f4f6;
        }
        .container {
          background-color: #ffffff;
          margin: 20px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          background: #ffffff;
          padding: 40px 30px;
          color: #1f2937;
        }
        .content p {
          color: #374151;
          margin: 16px 0;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          margin: 24px 0;
          font-weight: bold;
          font-size: 16px;
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
        }
        .button:hover {
          box-shadow: 0 4px 8px rgba(37, 99, 235, 0.4);
        }
        .link-box {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          word-break: break-all;
          color: #4b5563;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          padding: 30px;
          background-color: #f9fafb;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        .project-name {
          color: #2563eb;
          font-weight: bold;
        }
        .note {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 12px 16px;
          margin: 20px 0;
          border-radius: 4px;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 You're Invited to Join a Project!</h1>
        </div>
        <div class="content">
          <p style="font-size: 16px; color: #1f2937;">Hello!</p>
          <p style="font-size: 16px; color: #374151;"><strong style="color: #1f2937;">${inviterName}</strong> has invited you to join the project <span class="project-name">"${projectName}"</span> on WORKORG.</p>
          <p style="color: #4b5563;">WORKORG is a modern agile project management tool that helps teams collaborate and organize their work efficiently.</p>
          <p style="color: #374151;">To accept this invitation and join the project, please click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationLink}" class="button">Accept Invitation & Register</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <div class="link-box">
            ${invitationLink}
          </div>
          <div class="note">
            <strong style="color: #92400e;">Note:</strong> This invitation link will expire in 7 days.
          </div>
          <p style="color: #6b7280; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p style="margin: 8px 0; color: #6b7280;">© ${new Date().getFullYear()} WORKORG - Agile Project Management</p>
          <p style="margin: 8px 0; color: #9ca3af; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    You're Invited to Join a Project!
    
    ${inviterName} has invited you to join the project "${projectName}" on WORKORG.
    
    To accept this invitation and register, please visit:
    ${invitationLink}
    
    This invitation link will expire in 7 days.
    
    If you didn't expect this invitation, you can safely ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: `You're invited to join "${projectName}" on WORKORG`,
    html,
    text,
  });
};

export const sendWelcomeEmail = async (
  email: string,
  name: string,
  projectName?: string
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          max-width: 600px;
          margin: 0 auto;
          padding: 0;
          background-color: #f3f4f6;
        }
        .container {
          background-color: #ffffff;
          margin: 20px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          background: #ffffff;
          padding: 40px 30px;
          color: #1f2937;
        }
        .content p {
          color: #374151;
          margin: 16px 0;
        }
        .content ul {
          color: #374151;
          padding-left: 20px;
        }
        .content li {
          margin: 12px 0;
          color: #4b5563;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          margin: 24px 0;
          font-weight: bold;
          font-size: 16px;
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
        }
        .footer {
          text-align: center;
          padding: 30px;
          background-color: #f9fafb;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        .highlight {
          background-color: #dbeafe;
          border-left: 4px solid #2563eb;
          padding: 12px 16px;
          margin: 20px 0;
          border-radius: 4px;
          color: #1e40af;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to WORKORG! 🚀</h1>
        </div>
        <div class="content">
          <p style="font-size: 16px; color: #1f2937;">Hi <strong>${name}</strong>!</p>
          <p style="color: #374151;">Welcome to WORKORG - your new agile project management platform!</p>
          ${projectName ? `<div class="highlight">You've been successfully added to the project <strong>"${projectName}"</strong> and can start collaborating with your team right away.</div>` : ''}
          <p style="color: #374151; font-weight: 600; margin-top: 24px;">Here's what you can do with WORKORG:</p>
          <ul>
            <li>📋 Create and manage projects with your team</li>
            <li>✅ Organize tasks with our intuitive Kanban board</li>
            <li>👥 Collaborate with team members in real-time</li>
            <li>📅 Set deadlines and track progress</li>
            <li>🎯 Follow agile methodology for better productivity</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${frontendUrl}/dashboard" class="button">Go to Dashboard</a>
          </div>
          <p style="color: #6b7280;">If you have any questions or need help getting started, feel free to explore our features.</p>
          <p style="color: #1f2937; font-weight: 600;">Happy organizing!</p>
        </div>
        <div class="footer">
          <p style="margin: 8px 0; color: #6b7280;">© ${new Date().getFullYear()} WORKORG - Agile Project Management</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Welcome to WORKORG!
    
    Hi ${name}!
    
    Welcome to WORKORG - your new agile project management platform!
    ${projectName ? `You've been successfully added to the project "${projectName}".` : ''}
    
    Visit your dashboard: ${frontendUrl}/dashboard
    
    Happy organizing!
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to WORKORG! 🚀',
    html,
    text,
  });
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationToken: string
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          max-width: 600px;
          margin: 0 auto;
          padding: 0;
          background-color: #f3f4f6;
        }
        .container {
          background-color: #ffffff;
          margin: 20px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          background: #ffffff;
          padding: 40px 30px;
          color: #1f2937;
        }
        .content p {
          color: #374151;
          margin: 16px 0;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          margin: 24px 0;
          font-weight: bold;
          font-size: 16px;
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
        }
        .link-box {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          word-break: break-all;
          color: #4b5563;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          padding: 30px;
          background-color: #f9fafb;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        .note {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 12px 16px;
          margin: 20px 0;
          border-radius: 4px;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✉️ Verify Your Email Address</h1>
        </div>
        <div class="content">
          <p style="font-size: 16px; color: #1f2937;">Hi <strong>${name}</strong>!</p>
          <p style="color: #374151;">Thank you for registering with WORKORG! To complete your registration and activate your account, please verify your email address.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" class="button">Verify Email Address</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <div class="link-box">
            ${verificationLink}
          </div>
          <div class="note">
            <strong style="color: #92400e;">Important:</strong> This verification link will expire in 24 hours. If you didn't create an account with WORKORG, you can safely ignore this email.
          </div>
        </div>
        <div class="footer">
          <p style="margin: 8px 0; color: #6b7280;">© ${new Date().getFullYear()} WORKORG - Agile Project Management</p>
          <p style="margin: 8px 0; color: #9ca3af; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Verify Your Email Address
    
    Hi ${name}!
    
    Thank you for registering with WORKORG! To complete your registration, please verify your email address by visiting:
    ${verificationLink}
    
    This verification link will expire in 24 hours.
    
    If you didn't create an account with WORKORG, you can safely ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - WORKORG',
    html,
    text,
  });
};

export default {
  sendEmail,
  sendProjectInvitation,
  sendWelcomeEmail,
  sendVerificationEmail,
};

