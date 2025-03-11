pipeline {
    agent any

    environment {
        NODE_VERSION = '20.11.1'
        SUPABASE_URL = credentials('VITE_SUPABASE_URL')
        SUPABASE_ANON_KEY = credentials('VITE_SUPABASE_ANON_KEY')
        AWS_ACCESS_KEY_ID = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
        AWS_DEFAULT_REGION = 'us-east-1'
        EC2_HOST = credentials('EC2_HOST')
        EC2_USER = credentials('EC2_USER')
        EC2_KEY = credentials('EC2_KEY')
    }

    stages {
        stage('Setup Node.js') {
            steps {
                script {
                    sh """
                        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
                        . ~/.nvm/nvm.sh
                        nvm install ${NODE_VERSION}
                        nvm use ${NODE_VERSION}
                    """
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test'
            }
        }

        stage('Build') {
            steps {
                withEnv([
                    "VITE_SUPABASE_URL=${SUPABASE_URL}",
                    "VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}"
                ]) {
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    sh """
                        scp -i ${EC2_KEY} -r dist/* ${EC2_USER}@${EC2_HOST}:/var/www/html/
                    """
                }
            }
        }
    }

    post {
        always {
            node('master') {
                cleanWs()
            }
        }
        success {
            echo 'Deployment to EC2 successful!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}