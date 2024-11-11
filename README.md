# GitHub Actions CI/CD Workflow

This GitHub Actions workflow automates building, testing, and deploying a Dockerized application with version control. It ensures deployments are triggered only when a new version is detected.

## Workflow Triggers

The workflow is triggered on:
- **Push** events to the `master` branch, excluding non-essential files (`README.md`, docs, tests, scripts, logs).
- **Pull requests** targeting the `master` branch.

## Jobs

### 1. `check-version` Job
**Purpose**: Checks if a new version of the application exists by comparing the current version with the previous one in the infrastructure repository.

#### Steps:
- **Checkout code**: Retrieves the source code.
- **Checkout infrastructure repo**: Clones the infrastructure repo to fetch the latest deployed version.
- **Extract previous version**: Extracts the current Docker image version from `argocd-deployment.yml`.
- **Check current version**: Reads the version from the `VERSION` file and compares it with the previous version. Sets the `has_new_version` output to trigger a build if a new version is detected.

### 2. `build` Job
**Purpose**: Builds the application only if `check-version` detects a new version.

#### Steps:
- **Setup Node.js**: Configures Node.js environment.
- **Install dependencies**: Installs the required dependencies for the application.
- **Run build**: Builds the application.
- **Debug**: Outputs the GitHub run number and the current version for logging.

### 3. `docker` Job
**Purpose**: Builds and pushes the Docker image to Docker Hub if a new version is detected.

#### Steps:
- **Login to Docker Hub**: Authenticates Docker Hub with stored credentials.
- **Set up Docker Buildx**: Configures Docker Buildx for cross-platform builds.
- **Build and push image**: Builds the Docker image and pushes it with the current version tag.

### 4. `deploy` Job
**Purpose**: Deploys the updated Docker image to the Kubernetes cluster via Argo CD.

#### Steps:
- **Checkout infrastructure repo**: Retrieves the infrastructure code.
- **Update deployment image tag**: Updates the `argocd-deployment.yml` file with the new Docker image version.
- **Commit and push changes**: Commits the updated image tag to the infrastructure repository to trigger an Argo CD sync.

## Environment Variables
- **GIT_TOKEN**: Used for accessing the infrastructure repository.
- **DOCKER_USERNAME** and **DOCKER_PASSWORD**: Used to authenticate with Docker Hub.

## Secrets Required
- **GIT_TOKEN**: Token for accessing the infrastructure repository.
- **DOCKER_USERNAME** and **DOCKER_PASSWORD**: Docker Hub credentials.
- **GIT_EMAIL** and **GIT_USERNAME**: Information for Git commits in the infrastructure repo.

## Files Referenced
- **VERSION**: Contains the current application version.
- **argocd-deployment.yml**: Kubernetes deployment file where the Docker image tag is updated.

## Usage
Ensure the required secrets are set up in your GitHub repository before using this workflow.

---
