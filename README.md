# WORKORG - Agile Project Management

A modern, full-stack project management application inspired by agile methodology. Built with Next.js, Node.js, Express, and MongoDB.

## 🚀 Features

- **Sprint Planning**: Create 1-month projects with clear timelines
- **Team Collaboration**: Add members to projects and work together
- **Email Invitations**: Send invitation emails to unregistered users via SMTP
- **Kanban Board**: Visual task management with drag-and-drop columns
- **Task Management**: Create, assign, and track tasks with priorities and deadlines
- **Agile Workflow**: Todo, In Progress, Review, and Done stages
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Real-time Updates**: Instant task status updates
- **Welcome Emails**: Automated welcome messages for new team members

## 📋 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - API requests
- **Lucide React** - Icons
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 🛠️ Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running
- Git

### Setup

1. **Clone the repository**
```bash
cd workorg
```

2. **Install dependencies**

Frontend:
```bash
cd client
npm install
```

Backend:
```bash
cd ../server
npm install
```

3. **Configure environment variables**

Create `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/workorg
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development

# Email Configuration (Required for invitations)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-email-password
EMAIL_FROM=your-email@yourdomain.com
FRONTEND_URL=http://localhost:3000
```

Create `.env.local` file in the client directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. **Start MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

5. **Start the development servers**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

6. **Open your browser**
Navigate to `http://localhost:3000`

## 📱 Usage

### Getting Started

1. **Register an account**
   - Go to the homepage
   - Click "Get Started" or "Sign Up"
   - Fill in your details

2. **Create a project**
   - From the dashboard, click "New Project"
   - Enter project name, description, and timeline (1 month recommended)
   - Set the status (Planning, Active, On-hold, or Completed)

3. **Add team members**
   - Open a project
   - Click "Add Member"
   - Enter any email address
   - If registered: User is added immediately
   - If not registered: User receives an invitation email

4. **Create tasks**
   - In the project view, click the "+" icon on any column
   - Fill in task details:
     - Title and description
     - Priority (Low, Medium, High, Urgent)
     - Due date
     - Assign to a team member

5. **Manage tasks**
   - Use arrow buttons to move tasks between columns
   - Update task status: Todo → In Progress → Review → Done
   - Track progress on the Kanban board

## 🏗️ Project Structure

```
workorg/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable components
│   │   ├── lib/          # API client
│   │   └── store/        # State management
│   ├── public/           # Static files
│   └── package.json
│
├── server/               # Express backend
│   ├── src/
│   │   ├── models/      # MongoDB models
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth middleware
│   │   └── server.ts    # Entry point
│   └── package.json
│
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Set environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy

### Backend (VPS/Cloud)

1. **SSH into your VPS**
```bash
ssh user@your-server-ip
```

2. **Install Node.js and MongoDB**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y mongodb
```

3. **Clone and setup**
```bash
git clone <your-repo>
cd workorg/server
npm install
npm run build
```

4. **Setup environment variables**
```bash
nano .env
# Add your production values
```

5. **Use PM2 to run**
```bash
sudo npm install -g pm2
pm2 start dist/server.js --name workorg-api
pm2 startup
pm2 save
```

6. **Setup Nginx (optional)**
```bash
sudo apt-get install nginx
# Configure reverse proxy
```

## 🔐 Security Notes

- Change `JWT_SECRET` to a strong random string in production
- Use HTTPS in production
- Set up proper CORS settings
- Use environment variables for all secrets
- Implement rate limiting for API endpoints

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙋 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Express

