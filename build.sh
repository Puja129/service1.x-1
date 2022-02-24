#!/bin/bash
#
#  Copyright (c) 2016 General Electric Company. All rights reserved.
#
#  The copyright to the computer software herein is the property of
#  General Electric Company. The software may be used and/or copied only
#  with the written permission of General Electric Company or in accordance
#  with the terms and conditions stipulated in the agreement/contract
#  under which the software has been supplied.
#
#  author: apolo.yasuda@ge.com
#

#set -x
set -e

function cf_push () {

    #no proxy needed w/ aws vm
    #export https_proxy=${PROXY}

    echo "cf login -a ${CF_END} -u ${CF_USER} -p ${CF_PWD} -o ${CF_ORG} -s ${CF_SPC}"
    
    cf login -a ${CF_END} -u ${CF_USER} -p ${CF_PWD} -o "${CF_ORG}" -s "${CF_SPC}"

    echo Checking CF Envs..

    cf a &> /dev/null
    if [ $? -eq 0 ] ; then   
	echo Good you have logged in the CF;
	cf push
	cf set-env ${APP}-${ENV} EC_PRVT_KEY "${EC_PRVT_KEY}"
	cf set-env ${APP}-${ENV} EC_PUB_KEY "${EC_PUB_KEY}"
    else 
	echo Please log in the Cloud Foundry org/space.; 
	exit 1;
    fi;

}

function readinputs () {

    if [ $# -eq 0 ]
    then
	printf "   %-*s\n" 10 "-app  | app name"
	printf "   %-*s\n" 10 "-p    | proxy"
	printf "   %-*s\n" 10 "-r    | revision"
	printf "   %-*s\n" 10 "-b    | build version by Jenkins"	
	printf "   %-*s\n" 10 "-e    | environemntal variables"
	printf "   %-*s\n" 10 "-user | cf username"
	printf "   %-*s\n" 10 "-pwd  | cf password"
	printf "   %-*s\n" 10 "-end  | cf endpoint"
	printf "   %-*s\n" 10 "-org  | cf org"
	printf "   %-*s\n" 10 "-spc  | cf space"
    else
	for ((i = 1; i <=$#; i++));
	do
	    case ${@:i:1} in
		-app)
		    APP=${@:i+1:1}
		    ;;
		-host)
		    HOST=${@:i+1:1}
		    ;;
		-p)
		    PROXY=${@:i+1:1}
		    ;;
		-r)
		    REV=${@:i+1:1}
		    ;;
		-b)
		    BUILD_VER=${@:i+1:1}
		    ;;
		-e)
		    ENV=${@:i+1:1}
		    ;;
		-user)
		    CF_USER=${@:i+1:1}
		    ;;
		-pwd)
		    CF_PWD=${@:i+1:1}		   
		    ;;
		-end)
		    CF_END=${@:i+1:1}		   
		    ;;
		-org)
		    CF_ORG=${@:i+1:1}		   
		    ;;
		-spc)
		    CF_SPC=${@:i+1:1}		   
		    ;;
                -ecurl)
                    EC_SERVICE_URI=${@:i+1:1}
                    ;;
                -zactokenurl)
                    ZAC_UAA=${@:i+1:1}
                    ;;
                -zacurl)
                    ZAC_URL=${@:i+1:1}
                    ;;
                -zacsvcid)
                    ZAC_SERVICE_ID=${@:i+1:1}
                    ;;
                -zaccid)
                    ZAC_CLIENT_ID=${@:i+1:1}
                    ;;
                -zaccscrt)
                    ZAC_CLIENT_SECRET=${@:i+1:1}
                    ;;
                -ecadm)
                    ADMIN_USR=${@:i+1:1}
                    ;;
                -ecpwd)
                    ADMIN_PWD=${@:i+1:1}
                    ;;
		-nrgfeatrid)
		    NUREGO_FEATURE_ID=${@:i+1:1}
                    ;;
		-nrgkey)
		    NUREGO_API_KEY=${@:i+1:1}
                    ;;
		-newrelickey)
		    NR_KEY=${@:i+1:1}
                    ;;
		-ecsettings)
		    EC_SETTINGS=${@:i+1:1}
		    EC_SETTINGS_ENCODE=$(echo -ne ${EC_SETTINGS} | base64);
                    ;;
		*)
		    #echo "Invalid option ${@:i:1}"
	            ;;
	    esac
	done
    fi

}
# readinputs $@

echo done reading args
#manifest
eval "sed -i -e 's#{APP}#${APP}#g' ./manifest.yml"
eval "sed -i -e 's#{ENV}#${ENV}#g' ./manifest.yml"
eval "sed -i -e 's#{EC_TAG}#${EC_TAG}#g' ./manifest.yml"
#eval "sed -i -e 's#{BUILD_ID}#${BUILD_ID}#g' ./manifest.yml"
eval "sed -i -e 's#{BASE}#${REV}#g' ./manifest.yml"
eval "sed -i -e 's#{ZAC_UAA}#${ZAC_UAA}#g' ./manifest.yml"
eval "sed -i -e 's#{ZAC_URL}#${ZAC_URL}#g' ./manifest.yml"
eval "sed -i -e 's#{ZAC_SERVICE_ID}#${ZAC_SERVICE_ID}#g' ./manifest.yml"
eval "sed -i -e 's#{ZAC_CLIENT_ID}#${ZAC_CLIENT_ID}#g' ./manifest.yml"
eval "sed -i -e 's#{ZAC_CLIENT_SECRET}#${ZAC_CLIENT_SECRET}#g' ./manifest.yml"
eval "sed -i -e 's#{ADMIN_USR}#${ADMIN_USR}#g' ./manifest.yml"
eval "sed -i -e 's#{ADMIN_PWD}#${ADMIN_PWD}#g' ./manifest.yml"
eval "sed -i -e 's#{NUREGO_ENDPOINT}#${NUREGO_ENDPOINT}#g' ./manifest.yml"
eval "sed -i -e 's#{NUREGO_FEATURE_ID}#${NUREGO_FEATURE_ID}#g' ./manifest.yml"
eval "sed -i -e 's#{NUREGO_USAGE_FEATURE_ID}#${NUREGO_USAGE_FEATURE_ID}#g' ./manifest.yml"

eval "sed -i -e 's#{NUREGO_API_KEY}#${NUREGO_API_KEY}#g' ./manifest.yml"
eval "sed -i -e 's#{NR_KEY}#${NR_KEY}#g' ./manifest.yml"
#eval "sed -i -e 's#{EC_SETTINGS}#${EC_SETTINGS_ENCODE}#g' ./manifest.yml"
eval "sed -i -e 's#{EC_PRVT_PWD}#${EC_PRVT_PWD}#g' ./manifest.yml"

eval "sed -i -e 's#{NUREGO_TKN_USR}#${NUREGO_TKN_USR}#g' ./manifest.yml"
eval "sed -i -e 's#{NUREGO_TKN_PWD}#${NUREGO_TKN_PWD}#g' ./manifest.yml"
eval "sed -i -e 's#{NUREGO_TKN_INS}#${NUREGO_TKN_INS}#g' ./manifest.yml"
eval "sed -i -e 's#{NUREGO_TKN_URL}#${NUREGO_TKN_URL}#g' ./manifest.yml"

eval "sed -i -e 's#{CF_USR}#${CF_USR}#g' ./manifest.yml"
eval "sed -i -e 's#{CF_PWD}#${CF_PWD}#g' ./manifest.yml"
eval "sed -i -e 's#{CF_LOGIN}#${CF_LOGIN}#g' ./manifest.yml"
eval "sed -i -e 's#{CF_API}#${CF_API}#g' ./manifest.yml"

#swagger
#eval "sed -i -e 's#{HOST}#${APP}-${ENV}.${HOST}#g' ./assets/swagger.json"
eval "sed -i -e 's#{BASE}#${REV}#g' ./assets/swagger.json"
eval "sed -i -e 's#{ENV}#${EC_TAG}#g' ./assets/swagger.json"

#index.html
#eval "sed -i -e 's#{APP_PATH}#/${REV}/index#g' ./assets/index.html"

cf_push

