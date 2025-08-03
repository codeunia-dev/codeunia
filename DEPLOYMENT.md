# Codeunia Deployment Guide

This guide covers deploying the Codeunia application to production environments.

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Vercel account
- Supabase project
- Environment variables configured

### Steps

1. **Fork/Clone the Repository**
   ```bash
   git clone https://github.com/your-username/codeunia.git
   cd codeunia
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

4. **Deploy to Vercel**
   ```bash
   npx vercel --prod
   ```

## 🔧 Manual Deployment

### Environment Setup

#### Required Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Application
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production
```

#### Optional Environment Variables
```env
# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Email Service (Optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down the URL and keys

2. **Run Database Migrations**
   ```bash
   # Connect to your Supabase database
   psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   
   # Run the migration files from database/migrations/
   \i database/migrations/complete-unified-setup.sql
   ```

3. **Verify Database Setup**
   ```bash
   # Run the verification script
   psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f database/verification/basic-database-verification.sql
   ```

### Build and Deploy

1. **Install Dependencies**
   ```bash
   npm ci --only=production
   ```

2. **Build the Application**
   ```bash
   npm run build
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  codeunia:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
    restart: unless-stopped
```

### Deploy with Docker
```bash
# Build and run
docker-compose up -d

# Or build manually
docker build -t codeunia .
docker run -p 3000:3000 --env-file .env.local codeunia
```

## 🔒 Security Checklist

### Pre-Deployment
- [ ] Environment variables are properly configured
- [ ] Database migrations are applied
- [ ] SSL certificates are configured
- [ ] Firewall rules are set up
- [ ] Rate limiting is configured
- [ ] CORS settings are properly configured

### Post-Deployment
- [ ] Test all authentication flows
- [ ] Verify payment integration
- [ ] Check email functionality
- [ ] Monitor error logs
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategies

## 📊 Monitoring and Analytics

### Recommended Tools
- **Error Tracking**: Sentry
- **Performance**: Vercel Analytics, Google Analytics
- **Uptime**: UptimeRobot, Pingdom
- **Logs**: Vercel Logs, Supabase Logs

### Setup Monitoring
```bash
# Install monitoring dependencies
npm install @sentry/nextjs

# Configure Sentry
npx @sentry/wizard -i nextjs
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   npm run clean
   npm run build
   ```

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure database is not paused

3. **Payment Integration Issues**
   - Verify Razorpay credentials
   - Check webhook configurations
   - Test in sandbox mode first

4. **Performance Issues**
   ```bash
   # Analyze bundle size
   npm run build:analyze
   
   # Check performance
   npm run performance:check
   ```

### Support
For deployment issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 📈 Performance Optimization

### Pre-deployment Optimizations
```bash
# Optimize images
npm run optimize:images

# Analyze bundle
npm run build:analyze

# Run performance checks
npm run performance:check
```

### Runtime Optimizations
- Enable Supabase connection pooling
- Configure CDN for static assets
- Implement caching strategies
- Monitor and optimize database queries

---

**Note**: This deployment guide is specific to the Codeunia application. Adjust configurations based on your specific requirements and infrastructure. 