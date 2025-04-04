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
                sh "printenv"
                sh "docker build -t abhiram3046/resume-builder:$GIT_COMMIT ."
            }
        }
        stage("Trivy Vulnerability Scanner"){
            steps{
                sh'''
                trivy image abhiram3046/resume-builder:$GIT_COMMIT \
                        --severity LOW,MEDIUM,HIGH \
                        --exit-code 0 \
                        --quiet \
                        --format json -o trivy-image-MEDIUM-results.json

                trivy image abhiram3046/resume-builder:$GIT_COMMIT \
                        --severity CRITICAL \
                        --exit-code 1 \
                        --quiet \
                        --format json -o trivy-image-CRITICAL-results.json
                '''
            }
        }
        //  stage("Docker Run Deployment"){
        //      steps{
        //          sh"docker run -d -p 5173:5173 --name resume-builder resume-builder"
        //      }
        //  }
     }
 }