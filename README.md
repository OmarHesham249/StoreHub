# 🛒 StoreHub — 3-Tier DevSecOps Inventory Management System

[![AWS EKS](https://img.shields.io/badge/AWS%20EKS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/eks/)
[![Jenkins](https://img.shields.io/badge/Jenkins-%23D24939.svg?style=for-the-badge&logo=jenkins&logoColor=white)](https://www.jenkins.io/)
[![ArgoCD](https://img.shields.io/badge/Argo%20CD-%23F3F4F6.svg?style=for-the-badge&logo=argo&logoColor=FF4747)](https://argoproj.github.io/cd/)
[![Docker](https://img.shields.io/badge/Docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Helm](https://img.shields.io/badge/Helm-%230F162D.svg?style=for-the-badge&logo=helm&logoColor=white)](https://helm.sh/)
[![Trivy](https://img.shields.io/badge/Trivy-%234A37A0.svg?style=for-the-badge&logo=aquasecurity&logoColor=white)](https://trivy.dev/)
[![Nginx](https://img.shields.io/badge/Nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)](https://nginx.org/)

StoreHub is a full-stack, 3-tier web application designed with a microservices architecture. The infrastructure is deployed on **AWS EKS** (Elastic Kubernetes Service) with high availability. The entire deployment process is automated using **DevSecOps** and **GitOps** best practices.

---

## 🏗️ System Architecture

The application follows a stable **3-Tier Architecture**:
1. **Frontend Tier:** A web interface that serves the user experience. It is exposed securely via an **Nginx Reverse Proxy**.
2. **Backend Tier:** A web API that processes business logic and interacts with the database.
3. **Database Tier:** A secure database instance used to store and manage inventory data.

### Architecture Diagram
![StoreHub Architecture](https://github.com/OmarHesham249/StoreHub/blob/main/Screenshots/Project%20Architecture.png)

---

## 🚀 Key Features

* **🔄 Automated CI/CD:** Complete build, test, scan, and push pipeline automated through Jenkins.
* **🌐 GitOps Workflow:** Fully managed by **ArgoCD** to automatically sync the cluster state with this repository.
* **🛡️ Security First (DevSecOps):** Automatic vulnerability scanning of file systems and container images using **Trivy**.
* **🔀 Load Balancing:** Configured with **AWS Load Balancer Controller** for stable and efficient traffic distribution.
* **📦 Package Management:** Kubernetes manifests are dynamically structured and managed using **Helm Charts**.

---

## 🛠️ Tech Stack

* **Infrastructure:** AWS EKS, AWS EC2
* **CI/CD & GitOps:** Jenkins, ArgoCD
* **Containerization:** Docker, Kubernetes, Helm
* **Security:** Trivy Scan
* **Web Server & Proxy:** Nginx
* **Application Stack:** Node.js, React, PostgreSQL

---

## 🔄 CI/CD GitOps Pipeline Workflow

The pipeline automates the entire software delivery process securely:

1. **Checkout:** Pulls the latest code immediately when a change is pushed to the `main` branch.
2. **Install & Validate:** Installs dependencies and validates backend/frontend stability concurrently (Parallel execution).
3. **Build Images:** Builds Docker images for both services and tags them with the unique build number.
4. **Security Scan:** **Trivy** scans the newly built images for HIGH and CRITICAL vulnerabilities before any push.
5. **Push Images:** Safe and verified images are pushed to **DockerHub**.
6. **GitOps Update:** Jenkins automatically updates the image tags inside the `helm/storehub/values.yaml` file. **ArgoCD** detects this change and synchronizes the live cluster instantly.

### Jenkins Pipeline Stage View
![Jenkins Pipeline Success](https://github.com/OmarHesham249/StoreHub/blob/main/Screenshots/Jenkins%20Pipeline.png)

### ArgoCD Application Status
![ArgoCD Status](https://github.com/OmarHesham249/StoreHub/blob/main/Screenshots/ArgoCD.png)

---

## 💻 Access and Configuration

External traffic is securely routed to the EKS cluster using an Nginx reverse proxy configured on a separate instance (**StoreHub-Proxy**):

```nginx
server {
    listen 80;
    location / {
        proxy_pass http://<WORKER_NODE_IP>:<NODE_PORT>;
    }
}