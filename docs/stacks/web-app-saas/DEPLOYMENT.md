# Deployment (web-app-saas)

Patterns for the three common deployment targets in this profile.  Pick one during kickoff.

## Azure App Service

Same shape as warehouse-analytics deployment (see that profile's `DEPLOYMENT.md`), but without the snapshot/blob-sync layer since web apps read from the database directly.

App Service: Linux, Node 22 LTS or .NET 8, startup command appropriate to the stack.

Required env vars on App Service:

- `NODE_ENV=production` (Node)
- `ASPNETCORE_ENVIRONMENT=Production` (.NET)
- `PORT=8080`
- Database connection string (in `ConnectionStrings:Default` for .NET, in `DATABASE_URL` or similar for Node)
- Auth provider config (`AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, etc. depending on provider)
- Stripe / payment secrets if applicable (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)

Database firewall: if using Azure SQL, allow Azure services to access the database, OR use a private endpoint.  If using Postgres on RDS or elsewhere, allow the App Service outbound IPs.

GitHub Actions: same `test.yml` and `deploy.yml` patterns as warehouse-analytics.  Skip `snapshot.yml`.

## AWS EC2 + RDS

For projects where you want full control over the environment.  Personal projects often start here because the at-rest cost is lower than Azure App Service.

VPC layout:

- One VPC with public and private subnets across two AZs.
- EC2 in public subnet (or behind a load balancer in public, EC2 in private).
- RDS in private subnet, accessible only from EC2 security group.
- Security group for EC2: allow inbound 22 from your IP, 80/443 from `0.0.0.0/0`.
- Security group for RDS: allow inbound DB port from the EC2 security group only.

EC2 instance setup:

- Ubuntu 24 LTS, t4g.small or t3.small for general-purpose apps.
- Systemd service for the app: `/etc/systemd/system/<project-slug>.service`.
- Nginx reverse proxy in front, TLS via Let's Encrypt and certbot.
- App lives in `/opt/<project-slug>/`, owned by a non-root user.

Deployment via GitHub Actions: runner SSHes into EC2, pulls latest code, installs deps, restarts the systemd service.  Secrets in GitHub:

- `EC2_HOST` (Elastic IP or DNS)
- `EC2_USERNAME` (usually `ubuntu`)
- `EC2_SSH_KEY` (private key dedicated to GitHub Actions, not your personal key)
- Database credentials (`RDS_HOST`, `RDS_USERNAME`, `RDS_PASSWORD`, etc.)

For zero-downtime deploys: blue/green via two systemd services on different ports, nginx upstream swap.  Skip this complexity for personal projects -- accept the 2-3 second restart.

## Vercel

For Next.js apps with serverless backend functions.

Connect the GitHub repo at vercel.com.  Vercel auto-detects Next.js and builds on every push.

Default branch behavior:

- `main` deploys to production.
- `dev` and other branches deploy to preview URLs.

Env vars: Vercel dashboard > Project > Settings > Environment Variables.  Separate by environment (Production, Preview, Development).  Use `vercel env pull` to populate local `.env.local` for dev.

Serverless constraints to design around:

- Function timeout: 10s on Hobby, 60s on Pro, 300s on Enterprise.
- Cold starts: 200-500ms on Hobby for the first request after idle.
- No persistent state between invocations.  Use a serverless-friendly database client (`@neondatabase/serverless` for Postgres) or the Supabase JS client.  Don't use a long-lived `pg.Pool`.

For long-running jobs: don't use Vercel.  Move them to GitHub Actions, AWS Lambda with EventBridge, or a worker process elsewhere.

## Which one to pick

- Existing Microsoft tenant, integrating with Azure AD or Microsoft Identity: **Azure App Service**.
- Want maximum control, comfortable with Linux ops, lower at-rest cost: **AWS EC2 + RDS**.
- Building with Next.js, want zero infra, OK with serverless constraints: **Vercel**.
- None of the above clearly applies: pick the one your team already has ops experience with.

## Things to never do

Don't put database servers in public subnets.

Don't commit `.env`, `.pem`, or any secret file.

Don't share a single service account across all your projects.

Don't deploy by scp/sftp.  Always go through git so the deployed code matches a known commit.

Don't pay for bandwidth you can offload.  Large media assets belong in S3 or Cloudflare R2 with a CDN, not in the application server.
