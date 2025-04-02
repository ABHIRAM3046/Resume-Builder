pipeline{
     agent any
    tools{
        nodejs 'nodejs-23-10-0'
    }
     environment{
         SONAR_HOME= tool "Sonar"
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
                        echo $?
                        '''
                    }
                }
                stage("OWASP Dependency Check"){
                    steps{
                        dependencyCheck additionalArguments: '''
                            --scan ./ 
                            --out ./ 
                            --format html 
                            --prettyPrint''', odcInstallation: 'DC'
                        publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'dependency-check-jenkins.html', reportName: 'Dependency Check HTML Report', reportTitles: '', useWrapperFileDirectly: true])
                    }
                }
            }   
         }
         stage("SonarQube Analysis"){
             steps{
                timeout(time: 60, unit: 'Seconds') {
                    withSonarQubeEnv("Sonar"){
                        sh "$SONAR_HOME/bin/sonar-scanner -Dsonar.projectName=resume-builder -Dsonar.projectKey=resume_builder"
                    }
                    waitForQualityGate abortPipeline: true
                }
             }
         }
         stage("Remove Previous Docker Image and Container"){
             steps{
                 sh "docker stop resume-builder || true"
                 sh "docker rm resume-builder || true"
             }
         }
         stage("Docker Image Build"){
             steps{
                 sh "docker build -t resume-builder ."
             }
         }
         stage("Trivy Image Scan"){
             steps{
                  sh "trivy image --no-progress --severity HIGH,CRITICAL resume-builder"
             }
         }
         stage("Docker Run Deployment"){
             steps{
                 sh"docker run -d -p 5173:5173 --name resume-builder resume-builder"
             }
         }
     }
 }