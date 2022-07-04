const sonarqubeScanner = require('sonarqube-scanner');

sonarqubeScanner({
  serverUrl: 'http://3.145.83.31:9000',
    options : {
      'sonar.projectDescription': 'This is Node JS Hello World Application',
      'sonar.projectName': 'nodejs-app',
      'sonar.projectKey': 'nodejs-app',
      'sonar.sourceEncoding': 'UTF-8',
      'sonar.login': 'b8ac66a236d39234e02ce5f9f4132c941feee81d',
      'sonar.language': 'js',
      'sonar.sources': '.',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
    },
}, () => {});
