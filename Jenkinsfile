def scan_type
def target
pipeline {
    
    agent any
	
	 parameters {
         choice  choices: ["Baseline", "APIS", "Full"],
                 description: 'Type of scan that is going to perform inside the container',
                 name: 'SCAN_TYPE'
 
         string defaultValue: "https://example.com",
                 description: 'Target URL to scan',
                 name: 'TARGET'
 
         booleanParam defaultValue: true,
                 description: 'Parameter to know if wanna generate report.',
                 name: 'GENERATE_REPORT'
     }
    
    environment {
        imageName = "docker-app-registry"
        dockerImage = ''
	AWS_DEFAULT_REGION = "us-east-2"
    }
    
    stages {
        stage('Code checkout') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/master']], extensions: [], userRemoteConfigs: [[credentialsId: 'github-credentials', url: 'https://github.com/rajatgit123/NodeTaskApp.git']]])                   
           }
        }
		
        stage("sonarqube analysis"){
            steps{
                nodejs(nodeJSInstallationName: 'nodejs'){
                    withSonarQubeEnv('sonar'){
                        sh "npm install"
                        sh "npm install sonar-scanner"
                        sh "npm run sonar"
       }
      }
     }
    }
	
    // Building Docker images
 stage('Building image') {
      steps{
        script {
          dockerImage = docker.build imageName
        }
      }
    }

    stage ('Docker Image Push Stage') {
		 steps{
		    
		  	sh 'aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 514141280285.dkr.ecr.us-east-2.amazonaws.com'
			sh 'docker tag docker-app-registry:latest 514141280285.dkr.ecr.us-east-2.amazonaws.com/docker-app-registry:latest'
			sh 'docker push 514141280285.dkr.ecr.us-east-2.amazonaws.com/docker-app-registry:latest'  
    
		}
		}
    stage ('Run container on ECS') {
	steps{
		  withCredentials([aws(accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: 'rajatid', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')])
		  {
                        sh '''
			set +x
                        
		        
			aws ecs register-task-definition --cli-input-json file://web-server.json
			aws ecs run-task --cluster nodejs-new --task-definition web-server
			aws ecs update-service --cluster nodejs-new --service new-service --task-definition web-server --desired-count 1
						 
      
			'''
		}
         }
    }
    stage('Slack notification'){
            steps{
                slackSend message: 'code passes sonarqube analysis'
		slackSend message: 'docker image is deployed on ecs cluster'
		slackSend message: 'OWASP checks are implemented and report is generated !!'
            }
        }
	 
	
	stage('Pipeline Info') {
                 steps {
                     script {
                         echo "<--Parameter Initialization-->"
                         echo """
                         The current parameters are:
                             Scan Type: ${params.SCAN_TYPE}
                             Target: ${params.TARGET}
                             Generate report: ${params.GENERATE_REPORT}
                         """
                     }
                 }
         }
 
         stage('Setting up OWASP ZAP') {
             steps {
                 script {
                         echo "Pulling up last OWASP ZAP container --> Start"
                         sh 'docker pull owasp/zap2docker-stable'
                         echo "Pulling up last VMS container --> End"
                         echo "Starting container --> Start"
                         sh """
                         docker run -dt --name owasp \
                         owasp/zap2docker-stable \
                         /bin/bash
                         """
                 }
             }
         }
 
 
         stage('Prepare wrk directory') {
             when {
                         environment name : 'GENERATE_REPORT', value: 'true'
             }
             steps {
                 script {
                         sh """
                             docker exec owasp \
                             mkdir /zap/wrk
                         """
                     }
                 }
         }
 
 
         stage('Scanning target on owasp') {
             steps {
                 script {
                     scan_type = "${params.SCAN_TYPE}"
                     echo "----> scan_type: $scan_type"
                     target = "${params.TARGET}"
                     if(scan_type == "Baseline"){
                         sh """
                             docker exec owasp \
                             zap-baseline.py \
                             -t $target \
                             -x report.xml \
                             -I
                         """
                     }
                     else if(scan_type == "APIS"){
                         sh """
                             docker exec owasp \
                             zap-api-scan.py \
                             -t $target \
                             -x report.xml \
                             -I
                         """
                     }
                     else if(scan_type == "Full"){
                         sh """
                             docker exec owasp \
                             zap-full-scan.py \
                             -t $target \
                             //-x report.xml
                             -I
                         """
                         //-x report-$(date +%d-%b-%Y).xml
                     }
                     else{
                         echo "Something went wrong..."
                     }
                 }
             }
         }
         stage('Copy Report to Workspace'){
             steps {
                 script {
                     sh '''
                         docker cp owasp:/zap/wrk/report.xml ${WORKSPACE}/report.xml
                     '''
                 }
             }
         }
     }
        
     post {
             always {
                 echo "Removing container"
                 sh '''
                     docker stop owasp
                     docker rm owasp
                 '''
             }
         }
   
}
