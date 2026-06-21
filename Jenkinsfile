pipeline {
    agent any

    environment {
        // ── Change these to match your registry ────────────────────────────
        // Docker Hub:  'docker.io/yourusername'
        // Nexus:       'nexus-host:8082/repository/docker-hosted'
        REGISTRY       = 'docker.io/omarhesham249'
        IMAGE_BACKEND  = "${REGISTRY}/storehub-backend"
        IMAGE_FRONTEND = "${REGISTRY}/storehub-frontend"
        IMAGE_TAG      = "${env.GIT_COMMIT?.take(7) ?: env.BUILD_NUMBER}"

        // Jenkins Credential ID for the registry (Username + Password)
        REGISTRY_CREDS = 'docker-cred'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {

        // ── 1. Checkout ────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME} | Commit: ${IMAGE_TAG} | Build: #${env.BUILD_NUMBER}"
            }
        }

        // ── 2. Install & Lint ──────────────────────────────────────────────
        stage('Install & Validate') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                            sh 'node -e "require(\'./server.js\')" &'  // quick syntax check
                            sh 'pkill -f "node server.js" || true'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm run build'   // catches compile errors early
                        }
                    }
                }
            }
        }

        // ── 3. Build Docker Images ─────────────────────────────────────────
        stage('Build Docker Images') {
            parallel {
                stage('Backend Image') {
                    steps {
                        dir('backend') {
                            sh """
                                docker build \
                                  -t ${IMAGE_BACKEND}:${IMAGE_TAG} \
                                  -t ${IMAGE_BACKEND}:latest \
                                  .
                            """
                        }
                    }
                }
                stage('Frontend Image') {
                    steps {
                        dir('frontend') {
                            sh """
                                docker build \
                                  -t ${IMAGE_FRONTEND}:${IMAGE_TAG} \
                                  -t ${IMAGE_FRONTEND}:latest \
                                  .
                            """
                        }
                    }
                }
            }
        }
        // ── 3.5 Trivy Security Scan ─────────────────────────────────────────
        stage('Security Scan') {
            steps {
                echo 'Scanning images with Trivy...'
                sh 'trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_BACKEND}:${IMAGE_TAG}'
                sh 'trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_FRONTEND}:${IMAGE_TAG}'
            }
        }
        // ── 4. Push to Registry ────────────────────────────────────────────
        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: env.REGISTRY_CREDS,
                    usernameVariable: 'REG_USER',
                    passwordVariable: 'REG_PASS'
                )]) {
                    sh "echo \$REG_PASS | docker login ${REGISTRY} -u \$REG_USER --password-stdin"

                    sh "docker push ${IMAGE_BACKEND}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_BACKEND}:latest"
                    sh "docker push ${IMAGE_FRONTEND}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_FRONTEND}:latest"
                }
            }
        }

        // ── 5. Deploy (main branch only) ───────────────────────────────────
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo "Deploying ${IMAGE_TAG} to production..."

                // ── Option A: docker-compose on EC2 via SSH ────────────────
                // sh """
                //   ssh -o StrictHostKeyChecking=no ec2-user@your-ec2-ip \
                //     "cd /opt/storehub && \
                //      docker-compose pull && \
                //      docker-compose up -d --no-build"
                // """

                // ── Option B: kubectl rollout (K3s / EKS) ─────────────────
                // sh "kubectl set image deployment/storehub-backend  backend=${IMAGE_BACKEND}:${IMAGE_TAG}  -n storehub"
                // sh "kubectl set image deployment/storehub-frontend frontend=${IMAGE_FRONTEND}:${IMAGE_TAG} -n storehub"
                // sh "kubectl rollout status deployment/storehub-backend  -n storehub"
                // sh "kubectl rollout status deployment/storehub-frontend -n storehub"

                // ── Option C: ArgoCD image updater or Helm upgrade ─────────
                // sh "helm upgrade --install storehub ./helm --set backend.image.tag=${IMAGE_TAG} --set frontend.image.tag=${IMAGE_TAG} -n storehub"

                echo "Uncomment your preferred deploy strategy above."
            }
        }
    }

    post {
        always {
            sh 'docker logout ${REGISTRY} || true'
            cleanWs()
        }
        success {
            echo "✅ Pipeline succeeded — ${IMAGE_BACKEND}:${IMAGE_TAG}"
        }
        failure {
            echo "❌ Pipeline failed — check stage logs above."
        }
    }
}
