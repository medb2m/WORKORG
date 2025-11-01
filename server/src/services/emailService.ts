import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Logo URL for email templates
const getLogoUrl = () => {
  const baseUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL || 'http://localhost:5000';
  // Remove /api if present and add /public/workorg_logo.png
  const cleanUrl = baseUrl.replace('/api', '');
  return `${cleanUrl}/public/workorg_logo.png`;
};

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
  const logoUrl = getLogoUrl();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #9333ea 100%);
          padding: 48px 30px;
          text-align: center;
          position: relative;
        }
        .logo-container {
          display: inline-block;
          margin-bottom: 20px;
        }
        .logo-img {
          width: 80px;
          height: 80px;
          display: block;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .content {
          background: #ffffff;
          padding: 48px 30px;
          color: #1f2937;
        }
        .content p {
          color: #374151;
          margin: 16px 0;
          font-size: 15px;
        }
        .highlight-box {
          background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
          border-left: 4px solid #2563eb;
          padding: 20px;
          margin: 24px 0;
          border-radius: 8px;
        }
        .project-name {
          color: #2563eb;
          font-weight: 700;
          font-size: 18px;
        }
        .inviter-name {
          color: #1f2937;
          font-weight: 600;
        }
        .button {
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #9333ea 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 12px;
          margin: 24px 0;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
          transition: all 0.3s ease;
        }
        .button:hover {
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.5);
          transform: translateY(-2px);
        }
        .link-box {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          border: 2px dashed #e5e7eb;
          word-break: break-all;
          color: #4b5563;
          font-size: 13px;
          font-family: monospace;
        }
        .info-box {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 16px;
          margin: 24px 0;
          border-radius: 8px;
        }
        .info-box-title {
          color: #92400e;
          font-weight: 700;
          margin: 0 0 8px 0;
        }
        .info-box-text {
          color: #92400e;
          margin: 0;
          font-size: 14px;
        }
        .features {
          margin: 24px 0;
        }
        .feature-item {
          display: flex;
          align-items: start;
          margin: 12px 0;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }
        .feature-icon {
          font-size: 20px;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .footer {
          text-align: center;
          padding: 32px 30px;
          background: linear-gradient(to bottom, #f9fafb 0%, #f3f4f6 100%);
          color: #6b7280;
          font-size: 13px;
          border-top: 1px solid #e5e7eb;
        }
        .footer-brand {
          color: #4b5563;
          font-weight: 600;
          margin: 0 0 8px 0;
        }
        .footer-text {
          margin: 4px 0;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-container">
            <img src="${logoUrl}" alt="WORKORG" class="logo-img" />
          </div>
          <h1>🎉 Project Invitation</h1>
        </div>
        
        <div class="content">
          <p style="font-size: 16px; color: #1f2937; margin-bottom: 24px;">Hello!</p>
          
          <div class="highlight-box">
            <p style="margin: 0; font-size: 16px;">
              <span class="inviter-name">${inviterName}</span> has invited you to collaborate on:
            </p>
            <p class="project-name" style="margin: 12px 0 0 0;">${projectName}</p>
          </div>

          <p style="color: #4b5563; margin-top: 24px;">
            Join your team on WORKORG - a modern agile project management platform that helps teams collaborate seamlessly and organize their work efficiently.
          </p>

          <div class="features">
            <div class="feature-item">
              <span class="feature-icon">📋</span>
              <span style="color: #4b5563;">Manage projects and tasks with ease</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✅</span>
              <span style="color: #4b5563;">Track progress with Kanban boards</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">👥</span>
              <span style="color: #4b5563;">Collaborate with your team in real-time</span>
            </div>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${invitationLink}" class="button">Accept Invitation & Join Team</a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Or copy and paste this link into your browser:</p>
          <div class="link-box">${invitationLink}</div>

          <div class="info-box">
            <p class="info-box-title">⏰ Invitation Expires in 7 Days</p>
            <p class="info-box-text">This invitation link will remain valid for the next 7 days. After that, you'll need to request a new invitation.</p>
          </div>

          <p style="color: #9ca3af; font-size: 13px; margin-top: 32px;">
            If you didn't expect this invitation or don't know ${inviterName}, you can safely ignore this email.
          </p>
        </div>

        <div class="footer">
          <p class="footer-brand">WORKORG - Agile Project Management</p>
          <p class="footer-text">© ${new Date().getFullYear()} WORKORG. All rights reserved.</p>
          <p class="footer-text" style="font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
You're Invited to Join a Project!

${inviterName} has invited you to join the project "${projectName}" on WORKORG.

WORKORG is a modern agile project management platform that helps teams collaborate and organize their work efficiently.

To accept this invitation and register, please visit:
${invitationLink}

This invitation link will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

---
© ${new Date().getFullYear()} WORKORG - Agile Project Management
  `;

  await sendEmail({
    to: email,
    subject: `🎉 You're invited to join "${projectName}" on WORKORG`,
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
  const logoUrl = getLogoUrl();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #9333ea 100%);
          padding: 48px 30px;
          text-align: center;
          position: relative;
        }
        .logo-container {
          display: inline-block;
          margin-bottom: 20px;
        }
        .logo-img {
          width: 80px;
          height: 80px;
          display: block;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .content {
          background: #ffffff;
          padding: 48px 30px;
          color: #1f2937;
        }
        .content p {
          color: #374151;
          margin: 16px 0;
          font-size: 15px;
        }
        .greeting {
          font-size: 18px;
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .highlight-box {
          background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
          border-left: 4px solid #2563eb;
          padding: 20px;
          margin: 24px 0;
          border-radius: 8px;
        }
        .highlight-box p {
          margin: 0;
          color: #1e40af;
          font-weight: 600;
        }
        .project-name {
          color: #1e3a8a;
          font-weight: 700;
          font-size: 17px;
        }
        .feature-grid {
          display: grid;
          gap: 12px;
          margin: 28px 0;
        }
        .feature-card {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          display: flex;
          align-items: start;
          transition: all 0.3s ease;
        }
        .feature-icon {
          font-size: 24px;
          margin-right: 14px;
          flex-shrink: 0;
        }
        .feature-content {
          flex: 1;
        }
        .feature-title {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
          font-size: 15px;
        }
        .feature-desc {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
        }
        .button {
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #9333ea 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 12px;
          margin: 28px 0;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
          transition: all 0.3s ease;
        }
        .button:hover {
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.5);
          transform: translateY(-2px);
        }
        .cta-section {
          text-align: center;
          margin: 32px 0;
          padding: 24px;
          background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
          border-radius: 12px;
        }
        .cta-text {
          margin: 0 0 20px 0;
          color: #4b5563;
          font-size: 15px;
        }
        .footer {
          text-align: center;
          padding: 32px 30px;
          background: linear-gradient(to bottom, #f9fafb 0%, #f3f4f6 100%);
          color: #6b7280;
          font-size: 13px;
          border-top: 1px solid #e5e7eb;
        }
        .footer-brand {
          color: #4b5563;
          font-weight: 600;
          margin: 0 0 8px 0;
        }
        .footer-text {
          margin: 4px 0;
          color: #9ca3af;
        }
        .closing {
          color: #2563eb;
          font-weight: 600;
          font-size: 16px;
          margin-top: 32px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-container">
            <img src="${logoUrl}" alt="WORKORG" class="logo-img" />
          </div>
          <h1>🚀 Welcome Aboard!</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hi ${name}! 👋</p>
          
          <p style="font-size: 16px; margin-bottom: 24px;">
            Welcome to <strong>WORKORG</strong> - your new agile project management platform designed to make team collaboration effortless and productive!
          </p>
          
          ${projectName ? `
          <div class="highlight-box">
            <p>🎉 You've been successfully added to:</p>
            <p class="project-name" style="margin-top: 8px;">${projectName}</p>
            <p style="margin-top: 12px; font-size: 14px;">You can start collaborating with your team right away!</p>
          </div>
          ` : ''}

          <p style="font-weight: 600; color: #1f2937; margin-top: 32px; margin-bottom: 16px; font-size: 16px;">
            ✨ What you can do with WORKORG:
          </p>

          <div class="feature-grid">
            <div class="feature-card">
              <span class="feature-icon">📋</span>
              <div class="feature-content">
                <p class="feature-title">Project Management</p>
                <p class="feature-desc">Create and manage multiple projects with your team</p>
              </div>
            </div>

            <div class="feature-card">
              <span class="feature-icon">✅</span>
              <div class="feature-content">
                <p class="feature-title">Kanban Boards</p>
                <p class="feature-desc">Organize tasks visually with our intuitive drag-and-drop interface</p>
              </div>
            </div>

            <div class="feature-card">
              <span class="feature-icon">👥</span>
              <div class="feature-content">
                <p class="feature-title">Team Collaboration</p>
                <p class="feature-desc">Work together in real-time and stay in sync</p>
              </div>
            </div>

            <div class="feature-card">
              <span class="feature-icon">📅</span>
              <div class="feature-content">
                <p class="feature-title">Deadline Tracking</p>
                <p class="feature-desc">Set dates and monitor progress effortlessly</p>
              </div>
            </div>

            <div class="feature-card">
              <span class="feature-icon">🎯</span>
              <div class="feature-content">
                <p class="feature-title">Agile Methodology</p>
                <p class="feature-desc">Follow best practices for maximum productivity</p>
              </div>
            </div>
          </div>

          <div class="cta-section">
            <p class="cta-text">Ready to get started? Access your dashboard now!</p>
            <a href="${frontendUrl}/dashboard" class="button">Open Dashboard</a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
            Need help getting started? Explore the platform and discover all the features designed to make your workflow smoother.
          </p>

          <p class="closing">Happy organizing! 🎉</p>
        </div>

        <div class="footer">
          <p class="footer-brand">WORKORG - Agile Project Management</p>
          <p class="footer-text">© ${new Date().getFullYear()} WORKORG. All rights reserved.</p>
          <p class="footer-text" style="font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to WORKORG!

Hi ${name}!

Welcome to WORKORG - your new agile project management platform!
${projectName ? `\nYou've been successfully added to the project "${projectName}" and can start collaborating with your team right away.\n` : ''}

What you can do with WORKORG:
- 📋 Create and manage multiple projects with your team
- ✅ Organize tasks visually with Kanban boards
- 👥 Collaborate with team members in real-time
- 📅 Set deadlines and track progress
- 🎯 Follow agile methodology for better productivity

Get started now:
${frontendUrl}/dashboard

Happy organizing!

---
© ${new Date().getFullYear()} WORKORG - Agile Project Management
  `;

  await sendEmail({
    to: email,
    subject: '🚀 Welcome to WORKORG - Let\'s Get Started!',
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
  const logoUrl = getLogoUrl();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #9333ea 100%);
          padding: 48px 30px;
          text-align: center;
          position: relative;
        }
        .logo-container {
          display: inline-block;
          margin-bottom: 20px;
        }
        .logo-img {
          width: 80px;
          height: 80px;
          display: block;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .content {
          background: #ffffff;
          padding: 48px 30px;
          color: #1f2937;
        }
        .content p {
          color: #374151;
          margin: 16px 0;
          font-size: 15px;
        }
        .greeting {
          font-size: 18px;
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .verification-box {
          background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
          border: 2px solid #2563eb;
          border-radius: 12px;
          padding: 24px;
          margin: 28px 0;
          text-align: center;
        }
        .verification-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }
        .verification-text {
          color: #1e40af;
          font-weight: 600;
          font-size: 16px;
          margin: 0;
        }
        .button {
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #9333ea 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 12px;
          margin: 28px 0;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
          transition: all 0.3s ease;
        }
        .button:hover {
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.5);
          transform: translateY(-2px);
        }
        .link-section {
          margin: 24px 0;
          padding: 20px;
          background: #f9fafb;
          border-radius: 10px;
        }
        .link-label {
          color: #6b7280;
          font-size: 13px;
          margin: 0 0 8px 0;
          font-weight: 500;
        }
        .link-box {
          background: #ffffff;
          padding: 12px 16px;
          border-radius: 8px;
          border: 2px dashed #d1d5db;
          word-break: break-all;
          color: #2563eb;
          font-size: 13px;
          font-family: monospace;
        }
        .warning-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
          border-left: 4px solid #f59e0b;
          padding: 20px;
          margin: 28px 0;
          border-radius: 10px;
        }
        .warning-title {
          color: #92400e;
          font-weight: 700;
          margin: 0 0 8px 0;
          font-size: 15px;
          display: flex;
          align-items: center;
        }
        .warning-icon {
          margin-right: 8px;
          font-size: 18px;
        }
        .warning-text {
          color: #92400e;
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }
        .footer {
          text-align: center;
          padding: 32px 30px;
          background: linear-gradient(to bottom, #f9fafb 0%, #f3f4f6 100%);
          color: #6b7280;
          font-size: 13px;
          border-top: 1px solid #e5e7eb;
        }
        .footer-brand {
          color: #4b5563;
          font-weight: 600;
          margin: 0 0 8px 0;
        }
        .footer-text {
          margin: 4px 0;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-container">
            <img src="${logoUrl}" alt="WORKORG" class="logo-img" />
          </div>
          <h1>✉️ Email Verification</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hi ${name}! 👋</p>
          
          <p style="font-size: 16px; margin-bottom: 24px;">
            Thank you for registering with <strong>WORKORG</strong>! We're excited to have you on board.
          </p>

          <div class="verification-box">
            <div class="verification-icon">🔐</div>
            <p class="verification-text">One more step to activate your account</p>
          </div>

          <p style="color: #4b5563; margin-bottom: 24px;">
            To complete your registration and unlock all features, please verify your email address by clicking the button below:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationLink}" class="button">Verify Email Address</a>
          </div>

          <div class="link-section">
            <p class="link-label">Or copy and paste this link into your browser:</p>
            <div class="link-box">${verificationLink}</div>
          </div>

          <div class="warning-box">
            <p class="warning-title">
              <span class="warning-icon">⏰</span>
              Time-Sensitive Link
            </p>
            <p class="warning-text">
              This verification link will expire in <strong>24 hours</strong>. If it expires, you can request a new verification email from the login page.
            </p>
          </div>

          <p style="color: #9ca3af; font-size: 13px; margin-top: 32px; padding-top: 24px; border-top: 1px dashed #e5e7eb;">
            <strong style="color: #6b7280;">Didn't create an account?</strong><br>
            If you didn't register for WORKORG, you can safely ignore this email. No account will be created without verification.
          </p>
        </div>

        <div class="footer">
          <p class="footer-brand">WORKORG - Agile Project Management</p>
          <p class="footer-text">© ${new Date().getFullYear()} WORKORG. All rights reserved.</p>
          <p class="footer-text" style="font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Verify Your Email Address

Hi ${name}!

Thank you for registering with WORKORG! We're excited to have you on board.

To complete your registration and activate your account, please verify your email address by visiting:
${verificationLink}

This verification link will expire in 24 hours.

If you didn't create an account with WORKORG, you can safely ignore this email.

---
© ${new Date().getFullYear()} WORKORG - Agile Project Management
  `;

  await sendEmail({
    to: email,
    subject: '✉️ Verify Your Email - WORKORG',
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

