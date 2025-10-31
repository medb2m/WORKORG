# WORKORG Deployment Guide

Complete guide to deploy WORKORG to your VPS server.

## 📋 Prerequisites

- VPS server (Ubuntu 20.04+ recommended)
- Domain name (optional but recommended)
- SSH access to your server
- MongoDB installed or MongoDB Atlas account

## 🚀 VPS Deployment

### Step 1: Prepare Your VPS

1. **SSH into your server**
```bash
ssh user@your-server-ip
```

2. **Update system packages**
```bash
sudo apt update
sudo apt upgrade -y
```

3. **Install Node.js 18+**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Verify installation
```

4. **Install MongoDB (if not using MongoDB Atlas)**
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

5. **Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
```

6. **Install Nginx**
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 2: Deploy Backend

1. **Clone your repository**
```bash
cd /home/your-user
git clone https://github.com/yourusername/workorg.git
cd workorg/server
```

2. **Install dependencies**
```bash
npm install
```

3. **Create production environment file**
```bash
nano .env
```

Add:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/workorg
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/workorg

JWT_SECRET=generate-a-strong-random-secret-here
NODE_ENV=production
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. **Build the backend**
```bash
npm run build
```

5. **Start with PM2**
```bash
pm2 start dist/server.js --name workorg-api
pm2 startup  # Follow the instructions
pm2 save
```

6. **Verify it's running**
```bash
pm2 status
curl http://localhost:5000/api/health
```

### Step 3: Deploy Frontend

1. **Navigate to client directory**
```bash
cd ../client
```

2. **Install dependencies**
```bash
npm install
```

3. **Create production environment file**
```bash
nano .env.local
```

Add:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
# OR if using same server:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. **Build the frontend**
```bash
npm run build
```

5. **Start with PM2**
```bash
pm2 start npm --name workorg-client -- start
pm2 save
```

### Step 4: Configure Nginx

1. **Create Nginx configuration**
```bash
sudo nano /etc/nginx/sites-available/workorg
```

Add this configuration:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. **Enable the site**
```bash
sudo ln -s /etc/nginx/sites-available/workorg /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### Step 5: Setup SSL with Let's Encrypt (Recommended)

1. **Install Certbot**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

2. **Obtain SSL certificate**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

3. **Auto-renewal**
```bash
sudo certbot renew --dry-run
```

### Step 6: Setup Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## 📊 Monitoring

### View logs
```bash
# PM2 logs
pm2 logs workorg-api
pm2 logs workorg-client

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Monitor processes
```bash
pm2 status
pm2 monit
```

## 🔄 Updates

When you need to update the application:

```bash
cd /home/your-user/workorg

# Pull latest changes
git pull

# Update backend
cd server
npm install
npm run build
pm2 restart workorg-api

# Update frontend
cd ../client
npm install
npm run build
pm2 restart workorg-client
```

## 🔐 Security Checklist

- ✅ Use strong JWT secret
- ✅ Enable HTTPS with SSL
- ✅ Configure firewall
- ✅ Use environment variables for secrets
- ✅ Keep system packages updated
- ✅ Set up MongoDB authentication
- ✅ Regular backups
- ✅ Monitor logs regularly

## 🗄️ Database Backup

### Manual backup
```bash
mongodump --db workorg --out /backup/mongodb/$(date +%Y%m%d)
```

### Automated backup script
```bash
nano /home/your-user/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mongodump --db workorg --out $BACKUP_DIR/$DATE
# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

```bash
chmod +x /home/your-user/backup-db.sh
crontab -e
# Add: 0 2 * * * /home/your-user/backup-db.sh
```

## 🆘 Troubleshooting

### Backend not responding
```bash
pm2 logs workorg-api
pm2 restart workorg-api
```

### Frontend not loading
```bash
pm2 logs workorg-client
pm2 restart workorg-client
```

### MongoDB connection issues
```bash
sudo systemctl status mongod
sudo systemctl restart mongod
```

### Nginx errors
```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl restart nginx
```

## 📞 Support

For issues, check:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `/var/log/nginx/`
3. MongoDB logs: `/var/log/mongodb/`

---

🎉 Your WORKORG application should now be live and running on your VPS!

