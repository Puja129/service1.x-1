/*
 * project ec service
 * author: apolo.yasuda@ge.com
 */

def cfc
def ntg

timestamps {

  node('ec-node') {

    currentBuild.result = "SUCCESS"

    try {

      stage('init'){

	checkout scm

	cfc = env.CF_ENV_CRED
	//gtid = env.GIT_ENV_CRED

	withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: cfc,
			  usernameVariable: 'CF_USER', passwordVariable: 'CF_PSWD']]) {	  
	  env.CF_USR = sh (
	  script: "echo ${CF_USER}",
	  returnStdout: true
	  ).trim()

	  env.CF_PWD = sh (
	  script: "echo ${CF_PSWD}",
	  returnStdout: true
	  ).trim()
	  env.CF_USER = env.CF_USR
	}
      }

      stage('build & deploy'){
	
	ntg = sh(returnStdout: true, script: "echo $EC_REV.$PROJECT_NAME.$BUILD_ID").trim()

	if (env.EC_TAG.trim()!="") {
	  sh "git checkout $EC_TAG"
	} else {
	  env.EC_TAG = ntg
	}
	
	sh """
chmod 755 ./build.sh
./build.sh -app $EC_APP_NAME -host $EC_SERVICE_HOST_SUB_DOMAIN \
-p $PROXY_URL -r $EC_REV \
-b $BUILD_NUMBER -e $PROJECT_NAME \
-ecadm $ADMIN_USR -ecpwd $ADMIN_PWD \
-zactokenurl $ZAC_UAA \
-zacurl $ZAC_URL \
-zacsvcid $ZAC_SERVICE_ID \
-zaccid $ZAC_CLIENT_ID \
-zaccscrt $ZAC_CLIENT_SECRET \
-nrgfeatrid $NUREGO_FEATURE_ID \
-nrgkey $NUREGO_API_KEY \
-newrelickey $NR_KEY
"""
      }

      stage('tag the build'){
        
	def ctg = sh(returnStdout: true, script: "git describe --tags --abbrev=0").trim()
	
	if (ctg==ntg) {
	  println "tag: "+ctg+" exists."
	  return
	}
	
	withCredentials([string(credentialsId: env.GIT_ENV_CRED.trim(), variable: 'TOKEN')]) {

	  def scmUrl = sh(returnStdout: true, script: 'git config remote.origin.url').trim()
	  def op = scmUrl.replace("https://","https://"+env.TOKEN+"@")
	  
	  sh '''
git config user.email "ec.robot@ge.com"
git config user.name "EC Robot"
'''
	  sh "git tag "+ntg+" -m 'tag "+ntg+"'"
	  sh "git push "+op+" --tags"

	}

      }

      stage('cleanup'){

	echo "clean up"
	deleteDir()
      }

      stage('exit'){

	echo "exit"
      }

    }
    catch (err) {

      currentBuild.result = "FAILURE"
      /*
	mail body: "project build error is here: ${env.BUILD_URL}" ,
	from: 'xxxx@yyyy.com',
	replyTo: 'yyyy@yyyy.com',
	subject: 'project build failed',
	to: 'zzzz@yyyyy.com'
      */
      deleteDir()
      throw err
    }

  }
}
