pipeline{
     agent any
    tools{
        nodejs 'nodejs-23-10-0'
    }
     environment{
        SONAR_HOME= tool "Sonar"
        VITE_SUPABASE_URL = credentials('VITE_SUPABASE_URL')
        VITE_SUPABASE_ANON_KEY = credentials('VITE_SUPABASE_ANON_KEY')
     }
     stages{
        stage('Install Dependencies'){
             steps{
                 sh "npm install --no audit"
             }
         }
         stage('Dependency Check'){
            parallel{
                 stage('NPM Dependency Audit'){
                    steps{
                        sh '''npm audit --audit-level=critical
                        '''
                    }
                }
                stage("OWASP Dependency Check"){
                    steps{
                        dependencyCheck additionalArguments: '''
                            --scan ./ 
                            --out ./ 
                            --format HTML 
                            --disableYarnAudit \
                            --prettyPrint''', odcInstallation: 'DC'
                        publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'dependency-check-jenkins.html', reportName: 'Dependency Check HTML Report', reportTitles: '', useWrapperFileDirectly: true])
                    }
                }
            }   
         }
         stage("SonarQube Analysis"){
             steps{
                withSonarQubeEnv("Sonar"){
                    sh "$SONAR_HOME/bin/sonar-scanner -Dsonar.projectName=resume-builder -Dsonar.sources=src/ -Dsonar.projectKey=resume_builder"
                }
                waitForQualityGate abortPipeline: true
             }
         }
        
        stage("Docker Image Build"){
            steps{
                sh "docker build --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL --build-arg  VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY -t abhiram3046/resume-builder:$GIT_COMMIT . "
            }
        }
        stage("Trivy Vulnerability Scanner"){
            steps{
                sh'''
                trivy image --no-progress abhiram3046/resume-builder:$GIT_COMMIT --severity MEDIUM 
                trivy image --no-progress abhiram3046/resume-builder:$GIT_COMMIT --severity HIGH,CRITICAL
                '''
            }
        }
        stage("Push Docker Image"){
            steps{
                withDockerRegistry(credentialsId: 'Docker-hub', url: '') {
                    sh "docker push abhiram3046/resume-builder:$GIT_COMMIT"
                }
            }
        }
        //  stage("Docker Run Deployment"){
        //      steps{
        //          sh"docker run -d -p 5173:5173 --name resume-builder resume-builder"
        //      }
        //  }
     }
 }