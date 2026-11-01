# Automated Docker Deployment Guide

A reusable guide for setting up automated deployment for a new project using:

- **Docker** — Containerize the application.
- **GitHub Actions** — Automate the build and deployment workflow.
- **GHCR** — Store Docker images.
- **Render** — Host the application.

The goal is simple: **push code to `main` and automatically deploy the latest version of your application.**

---

## 1. Deployment Architecture

```text
Developer pushes code to GitHub (main)
                  |
                  v
          GitHub Actions starts
                  |
                  v
          Build frontend
                  |
                  v
          Build backend
                  |
                  v
          Build Docker image
                  |
                  v
          Push image to GHCR
                  |
                  v
       Trigger Render Deploy Hook
                  |
                  v
          Render pulls image
                  |
                  v
          Application goes live
```

---

## 2. Prepare the Project

First, create your application and make sure both frontend and backend work correctly.

Example project structure:

```text
my-project/
├── client/
├── server/
├── .github/
│   └── workflows/
│       └── deployment.yml
├── Dockerfile
├── .dockerignore
└── .gitignore
```

Before proceeding, ensure:

- Frontend builds successfully.
- Backend builds successfully.
- Backend can serve the production frontend files.
- Backend reads its port from `process.env.PORT`.
- Environment variables are not hardcoded.
- Application works locally.

## 3. Create the Required Files

You can copy these files directly from your existing `test-deployment` project and adjust them for the new project.

| File | Responsibility |
|---|---|
| `Dockerfile` | Builds the frontend, backend and production image. |
| `.dockerignore` | Excludes unnecessary files from Docker's build context. |
| `.gitignore` | Prevents committing files such as `.env` and `node_modules`. |
| `.github/workflows/deployment.yml` | Automates Docker builds, GHCR publishing and Render deployment. |

### Dockerfile

Use a multi-stage Docker build:

1. Build the frontend.
2. Build the backend.
3. Remove backend development dependencies.
4. Create a lightweight production image.
5. Copy compiled backend files, production dependencies and frontend build into it.

**Things to customize:**

- Frontend and backend directory paths.
- Build commands.
- Frontend output directory.
- Backend compiled entry point.
- Production start command.
- Port configuration.

### .dockerignore

Exclude unnecessary files:

```text
node_modules
**/node_modules

.git
.github

**/.env
**/.env.*

**/dist
server/public

.DS_Store
npm-debug.log
```

Adjust paths according to your project structure.

### .gitignore

Make sure you exclude:

- `node_modules`
- `.env` files
- Build output
- Logs
- `.DS_Store`

---

## 4. Test Docker Locally

Before configuring CI/CD, verify that your Docker image works.

Build the image:

```bash
docker build -t my-project .
```

Run the container:

```bash
docker run -d \
  --name my-project \
  -p 8000:8000 \
  --env-file server/.env \
  my-project
```

Verify:

- Frontend loads.
- Backend API works.
- Database connection works.
- Container logs show no errors.

Useful commands:

```bash
# Check running containers
docker ps

# View container logs
docker logs my-project

# Stop container
docker stop my-project

# Remove container
docker rm my-project
```

---

## 5. Push the Project to GitHub

Initialize Git:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
```

Connect your GitHub repository:

```bash
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

Make sure `.env` files are not committed.

---

## 6. Configure GitHub Actions

Copy the following workflow from your `test-deployment` project:

```text
.github/workflows/deployment.yml
```

The workflow should:

1. Trigger on pushes to `main`.
2. Check out the repository.
3. Set up Docker Buildx.
4. Authenticate with GHCR.
5. Generate Docker image tags.
6. Build and push the image.
7. Trigger the Render Deploy Hook.

### Important configuration

The workflow uses:

```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
```

GitHub Actions authenticates with GHCR using:

```yaml
permissions:
  contents: read
  packages: write
```

And:

```yaml
password: ${{ secrets.GITHUB_TOKEN }}
```

The workflow publishes two image tags:

- `latest`
- `sha-<commit-hash>`

No manual Docker image upload is necessary.

---

## 7. Configure GHCR

GHCR (GitHub Container Registry) stores your Docker images.

Your workflow automatically publishes images to:

```text
ghcr.io/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY:latest
```

For example:

```text
ghcr.io/abhinav-not-found/test-deployment:latest
```

If your package is private, Render needs credentials to pull it.

Create a GitHub Personal Access Token (classic) with:

```text
read:packages
```

Keep this token private.

---

## 8. Create a Render Web Service

Open the [Render Dashboard](https://dashboard.render.com/).

1. Click **New → Web Service**.
2. Select **Existing Image**.
3. Enter your GHCR image URL:

```text
ghcr.io/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY:latest
```

4. Add GHCR registry credentials:
   - Username: Your GitHub username.
   - Password: GitHub PAT with `read:packages`.
5. Configure the service name and region.
6. Add your application environment variables.

Example:

```text
PORT=10000
MONGODB_URI=your_database_connection_string
```

Use the actual environment variable names expected by your application.

Click **Deploy**.

Once deployment succeeds, Render provides a public URL for your application.

---

## 9. Enable Automatic Render Deployment

**Important:** Render does not automatically redeploy an image-backed service just because the `latest` Docker image tag changes.

You need to configure a Render Deploy Hook.

### Create a Deploy Hook

1. Open your Render service.
2. Go to **Settings**.
3. Find **Deploy Hook**.
4. Create a new hook.
5. Copy its URL.

### Add the URL to GitHub Secrets

Open your GitHub repository:

```text
Settings
  → Secrets and variables
  → Actions
  → New repository secret
```

Create:

```text
Name: RENDER_DEPLOY_HOOK
Value: YOUR_RENDER_DEPLOY_HOOK_URL
```

Never commit this URL to your repository.

### Add the trigger to GitHub Actions

After the Docker image build-and-push step, add:

```yaml
- name: Trigger Render deployment
  env:
    RENDER_DEPLOY_HOOK: ${{ secrets.RENDER_DEPLOY_HOOK }}
  run: |
    curl --fail --silent --show-error \
      --request POST \
      "$RENDER_DEPLOY_HOOK"
```

This tells Render to deploy the newly published image.

---

## 10. Test the Complete Pipeline

Make a small change in your application.

Commit and push:

```bash
git add .
git commit -m "test: automated deployment"
git push origin main
```

Check GitHub Actions:

- Docker image builds successfully.
- Image is pushed to GHCR.
- Render Deploy Hook is triggered.

Then check Render:

- A new deployment appears under Events.
- Deployment completes successfully.
- Your live application reflects the changes.

---

## 11. Final Checklist

Use this checklist whenever setting up deployment for a new project.

- [ ] Frontend and backend work locally.
- [ ] Production frontend build works.
- [ ] Backend serves production frontend files.
- [ ] `Dockerfile` created and configured.
- [ ] `.dockerignore` created.
- [ ] `.gitignore` configured.
- [ ] Docker image builds locally.
- [ ] Docker container works locally.
- [ ] Project pushed to GitHub.
- [ ] GitHub Actions workflow configured.
- [ ] GHCR image publishing works.
- [ ] Render Web Service created using Existing Image.
- [ ] GHCR registry credentials configured.
- [ ] Production environment variables configured.
- [ ] Render Deploy Hook created.
- [ ] `RENDER_DEPLOY_HOOK` added to GitHub Secrets.
- [ ] GitHub Actions triggers Render deployment.
- [ ] End-to-end deployment tested successfully.

---

## 12. What You Get

Once everything is configured, your deployment process becomes:

```text
git add .
git commit -m "your changes"
git push origin main
```

That's it.

GitHub Actions handles building and publishing the Docker image, and Render handles deployment.

**You no longer need to manually build Docker images, push them to GHCR or deploy them through the Render dashboard.**

---

## Important Notes

1. **New project, new Render service:** Create a separate Render service and Deploy Hook for each new application.
2. **GitHub secrets:** Add the `RENDER_DEPLOY_HOOK` secret to each repository.
3. **GHCR credentials:** Private packages require valid registry credentials.
4. **Environment variables:** Configure production secrets in Render, not in the Docker image or Git repository.
5. **Architecture:** Ensure the image supports `linux/amd64`, which is required by Render.
6. **Image tags:** The `latest` tag is convenient for deployment; SHA tags help identify specific builds.
7. **Deployment failures:** Check GitHub Actions logs and Render deployment logs to identify the failing step.

**Reusable reference project:** `test-deployment`

Use it as your starting template for future projects. Copy the deployment configuration, adjust project-specific paths and commands, and follow this guide.