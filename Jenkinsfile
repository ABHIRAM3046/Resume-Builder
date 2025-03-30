pipeline{
     agent any
     environment{
         SONAR_HOME= tool "Sonar"
     }
     stages{
         stage("Get Code From Github"){
             steps{
                 git url:"https://github.com/ABHIRAM3046/Resume-Builder.git",branch:"master"
             }
         }
         stage("SonarQube Analysis"){
             steps{
                 withSonarQubeEnv("Sonar"){
                     sh "$SONAR_HOME/bin/sonar-scanner -Dsonar.projectName=resume-builder -Dsonar.projectKey=resume_builder"
                 }
             }
         }
         stage("OWASP Dependency Check"){
             steps{
                 dependencyCheck additionalArguments: '--scan ./' , odcInstallation: 'DC'
                 dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
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