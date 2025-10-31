# Email Setup Guide for WORKORG

This guide explains how to configure email functionality for WORKORG using SMTP.

## 📧 Email Features

WORKORG uses email for:
- **Project Invitations**: Send invitation emails to unregistered users
- **Welcome Emails**: Greet new users when they register
- **Account Notifications**: Keep team members informed

## 🔧 Configuration

### 1. Update Server Environment Variables

Edit `server/.env` and add the following email configuration:

```env
# Email Configuration
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-email-password-here
EMAIL_FROM=your-email@yourdomain.com
FRONTEND_URL=http://localhost:3000
```

### 2. Configuration Options

#### SMTP Settings

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | Your SMTP server address | `smtp.hostinger.com` |
| `SMTP_PORT` | SMTP port (465 for SSL, 587 for TLS) | `465` |
| `SMTP_SECURE` | Use SSL/TLS (true for 465, false for 587) | `true` |
| `SMTP_USER` | Your email address | `your-email@yourdomain.com` |
| `SMTP_PASS` | Your email password | `YourPassword123` |
| `EMAIL_FROM` | Sender email address | `your-email@yourdomain.com` |
| `FRONTEND_URL` | Your frontend URL for links | `http://localhost:3000` |

### 3. Common SMTP Providers

#### Hostinger
```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
```

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
# Note: Use App Password, not regular password
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
```

#### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
```

## 🚀 How It Works

### 1. Adding Team Members

When a project owner adds a member by email:

**If user is registered:**
- User is immediately added to the project
- No email is sent

**If user is NOT registered:**
- An invitation email is sent
- Email contains a unique invitation link
- Link expires in 7 days
- User clicks link → completes registration → automatically added to project

### 2. Invitation Flow

```
Project Owner enters email
         ↓
System checks if user exists
         ↓
    ┌────┴────┐
    ↓         ↓
  Exists    Doesn't Exist
    ↓         ↓
  Add       Send Invitation Email
 Direct         ↓
              User Receives Email
                   ↓
              User Clicks Link
                   ↓
           Complete Registration
                   ↓
      Automatically Added to Project
```

### 3. Email Templates

WORKORG sends three types of emails:

#### Project Invitation Email
- Sent to unregistered users
- Contains invitation link
- Shows project name and inviter
- Expires in 7 days

#### Welcome Email (with Project)
- Sent after invitation registration
- Confirms project membership
- Includes dashboard link

#### Welcome Email (regular)
- Sent to new registrations
- Introduces WORKORG features
- Includes dashboard link

## 🔐 Security Notes

### Best Practices

1. **Never commit `.env` file to version control**
   - Already in `.gitignore`
   - Always use `.env.example` for reference

2. **Use App Passwords for Gmail**
   - Regular passwords won't work
   - Generate at: https://myaccount.google.com/apppasswords

3. **Keep credentials secure**
   - Use environment variables in production
   - Rotate passwords regularly

4. **Production Settings**
   ```env
   FRONTEND_URL=https://yourdomain.com
   EMAIL_FROM=noreply@yourdomain.com
   ```

## 🧪 Testing Email

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Start the Server

```bash
npm run dev
```

You should see:
```
✅ Email service is ready to send messages
```

### 3. Test Invitation

1. Create a project
2. Try to add a non-existent email
3. Check the email inbox
4. Click the invitation link
5. Complete registration

### 4. Troubleshooting

#### "Email service configuration error"
- Check SMTP credentials
- Verify SMTP_HOST and SMTP_PORT
- Ensure firewall allows outbound SMTP

#### "Failed to send email"
- Check internet connection
- Verify email account is active
- Check spam folder
- Review server logs for details

#### "Authentication failed"
- Double-check SMTP_USER and SMTP_PASS
- For Gmail, use App Password
- Ensure account allows SMTP

## 📊 Monitoring

### Check Email Service Status

The server logs show email service status:

```bash
✅ Email service is ready to send messages  # Working
❌ Email service configuration error        # Failed
```

### View Email Logs

```bash
# Server logs show:
✅ Email sent successfully to user@example.com
❌ Failed to send email: [error details]
```

## 🔄 Email Service Code

The email service is located at:
- `server/src/services/emailService.ts`

Key functions:
- `sendProjectInvitation()` - Send invitation to join project
- `sendWelcomeEmail()` - Welcome new users
- `sendEmail()` - Generic email sender

## 🌐 Production Deployment

### Update Environment Variables

On your VPS, update `/path/to/server/.env`:

```env
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-production-password
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### Restart Server

```bash
pm2 restart workorg-api
```

## 📝 API Endpoints

### Get Invitation Details
```
GET /api/invitations/token/:token
```

### Accept Invitation
```
POST /api/invitations/accept/:token
Body: { userId: string }
```

### Get Project Invitations
```
GET /api/invitations/project/:projectId
Headers: Authorization: Bearer <token>
```

### Resend Invitation
```
POST /api/invitations/resend/:invitationId
Headers: Authorization: Bearer <token>
```

## ✅ Checklist

Before going to production:

- [ ] SMTP credentials configured
- [ ] Email service verified
- [ ] Test invitation flow
- [ ] Update FRONTEND_URL
- [ ] Use production email address
- [ ] Test from production server
- [ ] Check spam folder settings
- [ ] Monitor email logs

---

## 💡 Tips

1. **Use a dedicated email** for sending (e.g., `noreply@yourdomain.com`)
2. **Monitor email limits** - most providers have daily limits
3. **Add your domain to SPF/DKIM** records to avoid spam
4. **Test thoroughly** before production
5. **Keep backups** of your email credentials

For issues or questions, check server logs or review the email service code!

