# Changelog

All notable changes to WORKORG will be documented in this file.

## [1.1.0] - 2025-10-31

### Added
- **Email System Integration**
  - SMTP email service using nodemailer
  - Project invitation system for unregistered users
  - Automatic invitation emails with unique tokens
  - Welcome emails for new registrations
  - Beautiful HTML email templates
  
- **Invitation Features**
  - Send invitations to non-registered users via email
  - Invitation links expire after 7 days
  - Automatic project membership on registration
  - Invitation status tracking (pending, accepted, expired)
  - Resend invitation functionality
  
- **New API Endpoints**
  - `GET /api/invitations/token/:token` - Get invitation details
  - `POST /api/invitations/accept/:token` - Accept invitation
  - `GET /api/invitations/project/:projectId` - Get project invitations
  - `POST /api/invitations/resend/:invitationId` - Resend invitation
  
- **New Pages**
  - `/invite/[token]` - Invitation acceptance and registration page
  
- **Database Models**
  - Invitation model with token management
  - Email tracking and status
  
- **Documentation**
  - EMAIL_SETUP.md - Complete email configuration guide
  - Detailed SMTP provider configurations
  - Troubleshooting guide for email issues

### Changed
- Updated "Add Member" functionality to support both registered and unregistered users
- Enhanced member addition modal with success messages
- Improved registration flow to handle invitation tokens
- Better error handling for email service failures

### Fixed
- Input text visibility in all form fields (now darker for better readability)

## [1.0.0] - 2025-10-31

### Added
- Initial release of WORKORG
- Next.js 14 frontend with TypeScript
- Express backend with TypeScript
- MongoDB database integration
- User authentication with JWT
- Project management system
- Kanban board for task management
- Task creation, assignment, and tracking
- Team collaboration features
- Beautiful, modern UI with Tailwind CSS
- Responsive design for all devices
- Dashboard with project overview
- Multiple project status support
- Task priority levels (Low, Medium, High, Urgent)
- Task status workflow (Todo, In Progress, Review, Done)
- Due date tracking
- Member management
- Project statistics
- Complete documentation (README, QUICKSTART, DEPLOYMENT, CONTRIBUTING)

### Security
- Password hashing with bcrypt
- JWT token authentication
- Environment variable configuration
- Access control for projects and tasks
- Owner-only project management

---

## Version Format

- **Major.Minor.Patch** (e.g., 1.0.0)
- Major: Breaking changes
- Minor: New features (backwards compatible)
- Patch: Bug fixes and minor improvements

## Categories

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

