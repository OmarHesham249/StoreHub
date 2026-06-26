pipeline {
    agent any

    environment {
        // ── Registry & Images ──────────────────────────────────────────────
        DOCKER_BUILDKIT = '1' 
        REGISTRY       = 'docker.io/omarhesham249'
        IMAGE_BACKEND  = "${REGISTRY}/storehub-backend"
        IMAGE_FRONTEND = "${REGISTRY}/storehub-frontend"
        IMAGE_TAG      = "${env.GIT_COMMIT?.take(7) ?: env.BUILD_NUMBER}"

        // ── Credentials IDs ────────────────────────────────────────────────
        REGISTRY_CREDS = 'docker-cred'
        GITHUB_CREDS   = 'github-cred' // ضفنا ده عشان جينكينز يقدر يعدل في الجيت هب

        // ── Helm Repository (GitOps) ───────────────────────────────────────
        // حط هنا رابط ريبو الـ Helm بتاعك بدل ده
        HELM_REPO      = 'github.com/OmarHesham249/StoreHub.git' 
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

        // ── 2. Install & Validate ──────────────────────────────────────────
        stage('Install & Validate') {
            parallel {
                stage('Backend') {
                     steps {
                         dir('backend') {
                            sh 'npm install'
                            // تم تصليح الـ Quotes هنا عشان متعملش إيرور
                            sh 'node -e "require(\'./server.js\')" &'
                            sh 'pkill -f "node -e" || true'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npx tsc --noEmit'   
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

        // ── 3.5 Trivy Security Scan ────────────────────────────────────────
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
                    sh "echo \$REG_PASS | docker login -u \$REG_USER --password-stdin"

                    sh "docker push ${IMAGE_BACKEND}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_BACKEND}:latest"
                    sh "docker push ${IMAGE_FRONTEND}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_FRONTEND}:latest"
                }
            }
        }

        // ── 5. Deploy (GitOps via ArgoCD) ──────────────────────────────────
        stage('GitOps Update') {
            when {
                branch 'main' // هيعمل Deploy بس لو إنت على الـ main
            }
            steps {
                echo "Updating Helm repo with new tag: ${IMAGE_TAG}..."
                
                withCredentials([usernamePassword(
                    credentialsId: env.GITHUB_CREDS, 
                    usernameVariable: 'GIT_USER', 
                    passwordVariable: 'GIT_PASS'
                )]) {
                    sh """
                    git config --global user.email "jenkins@storehub.local"
                    git config --global user.name "Jenkins CI"
                    
                    # استنساخ ريبو الـ Helm
                    git clone https://\${GIT_USER}:\${GIT_PASS}@${HELM_REPO} helm-repo
                    cd helm-repo
                    
                    # تعديل رقم التاج للفرونت والباك في ملف الـ values.yaml
                    # (تأكد إن مسار الملف جوه الريبو صح)
                    sed -i "s/tag: .*/tag: '${IMAGE_TAG}'/g" helm/storehub/values.yaml
                    
                    # رفع التعديلات لجيت هب
                    git add helm/storehub/values.yaml
                    git commit -m "🚀 CI: Update images tag to ${IMAGE_TAG}"
                    git push origin main
                    """
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout ${REGISTRY} || true'
            cleanWs()
        }
        success {
            echo "✅ Pipeline succeeded — Images pushed and GitOps repo updated to ${IMAGE_TAG}"
        }
        failure {
            echo "❌ Pipeline failed — check stage logs above."
        }
    }
}