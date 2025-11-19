# Deploying FastAPI to AWS EC2

This guide outlines the step-by-step process to deploy your FastAPI backend to AWS EC2 using Docker. This approach is optimized for cost (Free Tier eligible) and resource usage.

## Why EC2?
- **Cost**: Eligible for AWS Free Tier (750 hours/month of `t2.micro` or `t3.micro` instances for the first 12 months).
- **Compatibility**: Your application uses `apscheduler` for background tasks. Serverless options like AWS Lambda freeze execution between requests, which would stop your scheduler. EC2 runs continuously, making it the best fit.

## Prerequisites
- An AWS Account (Create one at [aws.amazon.com](https://aws.amazon.com/)).
- A terminal with SSH access.

---

## Step 1: Launch an EC2 Instance

1.  **Log in to AWS Console** and search for **EC2**.
2.  Click **Launch Instance**.
3.  **Name**: `super-tic-tac-toe-backend`
4.  **OS Images (AMI)**: Select **Ubuntu** (Ubuntu Server 24.04 LTS is fine).
5.  **Instance Type**: Select **t2.micro** (or `t3.micro` if `t2` is unavailable). Look for the "Free tier eligible" tag.
    *   *Specs*: 1 vCPU, 1 GiB Memory.
6.  **Key Pair**:
    *   Click **Create new key pair**.
    *   Name: `fastapi-key`.
    *   Type: `RSA`.
    *   Format: `.pem`.
    *   **Download the file** and save it safely (e.g., `~/.ssh/fastapi-key.pem`).
7.  **Network Settings**:
    *   Check **Allow SSH traffic from** -> **My IP** (for security) or **Anywhere** (easier but less secure).
    *   Check **Allow HTTP traffic from the internet**.
    *   Check **Allow HTTPS traffic from the internet**.
8.  Click **Launch Instance**.

---

## Step 2: Connect to Your Instance

1.  Open your terminal.
2.  Navigate to where you saved the key:
    ```bash
    cd ~/.ssh
    ```
3.  Restrict key permissions (required):
    ```bash
    chmod 400 fastapi-key.pem
    ```
4.  Connect via SSH (replace `YOUR_INSTANCE_PUBLIC_IP` with the IP from the EC2 console):
    ```bash
    ssh -i "fastapi-key.pem" ubuntu@YOUR_INSTANCE_PUBLIC_IP
    ```

---

## Step 3: Install Docker & Git

Once connected to the server, run the following commands to update the system and install necessary tools.

```bash
# Update package list
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io

# Start Docker and enable it to run on boot
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the docker group (avoids using sudo for docker commands)
sudo usermod -aG docker $USER
```

**Note**: You need to log out and log back in for the group change to take effect. Type `exit` and then SSH in again.

---

## Step 4: Deploy the Application

1.  **Clone your repository**:
    ```bash
    git clone https://github.com/CVamsi27/super-tic-tac-toe.git
    cd super-tic-tac-toe
    ```
    *(Note: If your repo is private, you'll need to generate a GitHub Personal Access Token and use it in the clone URL: `https://username:token@github.com/...`)*

2.  **Create the Environment File**:
    Create a `.env` file with your production secrets.
    ```bash
    nano .env
    ```
    Paste your environment variables (DATABASE_URL, etc.). Press `Ctrl+O` to save and `Ctrl+X` to exit.

3.  **Build and Run with Docker Compose**:
    Since we added a `docker-compose.yml`, deployment is simple.
    
    First, install Docker Compose (if not already included, though modern Docker includes `docker compose`):
    ```bash
    # Check if docker compose works
    docker compose version
    ```
    
    Run the app:
    ```bash
    docker compose up -d --build
    ```
    *   `-d`: Detached mode (runs in background).
    *   `--build`: Rebuilds the image.

4.  **Verify**:
    Check if the container is running:
    ```bash
    docker ps
    ```

---

## Step 5: Configure Security Group (Firewall)

By default, your app runs on port `8000`, but the EC2 firewall might block it.

1.  Go back to the **AWS EC2 Console**.
2.  Select your instance -> **Security** tab -> Click the **Security Group** (e.g., `sg-xxxx`).
3.  Click **Edit inbound rules**.
4.  Add Rule:
    *   **Type**: Custom TCP
    *   **Port range**: `8000`
    *   **Source**: `0.0.0.0/0` (Anywhere)
5.  Click **Save rules**.

Now you can access your API at: `http://YOUR_INSTANCE_PUBLIC_IP:8000/api/py/docs`

---

## Cost Analysis (Monthly)

| Item | Type | Cost (Free Tier) | Cost (After 12 Months) |
| :--- | :--- | :--- | :--- |
| **Compute** | EC2 t2.micro | **$0.00** (750 hrs/mo) | ~$8.50/mo |
| **Storage** | EBS (30GB) | **$0.00** (30GB free) | ~$2.40/mo |
| **Data Transfer** | Outbound | **$0.00** (100GB free) | ~$0.09/GB |
| **Total** | | **$0.00** | **~$11.00/mo** |

*Note: Prices are estimates based on us-east-1 region.*
