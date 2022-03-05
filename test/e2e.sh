#!/bin/bash
#
#  Copyright (c) 2020 General Electric Company. All rights reserved.
#
#  The copyright to the computer software herein is the property of
#  General Electric Company. The software may be used and/or copied only
#  with the written permission of General Electric Company or in accordance
#  with the terms and conditions stipulated in the agreement/contract
#  under which the software has been supplied.
#
#  author: apolo.yasuda@ge.com
#

[i] environment setting
-------------------------------------
source <(wget -O - https://raw.githubusercontent.com/EC-Release/sdk/disty/scripts/libs/db.sh)
crdj=$(getCredJson "cred.json" "$EC_GITHUB_TOKEN")
CA_PPS=$(echo $crdj | jq -r ".svcE2ETest.ownerHash")

cat << EOF


[ii] mockup legacy setting
-------------------------------------
EOF

EC_SETTING=$(printf "{\"%s\":{\"ids\":[\"my-aid-1\",\"my-aid-2\"],\"trustedIssuerIds\":[\"legacy-cf-uaa-url\"]}}" "$EC_SVC_ID" | base64 -w0)      

cat << EOF


[iii] launch service instance
-------------------------------------
EOF

PORT=7790
mkdir -p ./svcs
#timeout -k 10 10 \
docker run --name=svc \
-e EC_SVC_ID=$EC_SVC_ID \
-e EC_SVC_URL_PUB=$EC_SVC_URL_PUB \
-e EC_SVC_URL_NAT=$EC_SVC_URL_NAT \
-e EC_ADM_TKN=$EC_ADM_TKN \
-e EC_SAC_URL=$EC_SAC_URL \
-e EC_ATH_URL=$EC_ATH_URL \
-e EC_CID=$EC_CID \
-e EC_CSC=$EC_CSC \
-e EC_SETTING=$EC_SETTING \
-e EC_SCRIPT_1=$EC_SCRIPT_1 \
-e EC_SCRIPT_2=$EC_SCRIPT_2 \
-e EC_SCRIPT_3=$EC_SCRIPT_3 \
-e PORT=$PORT \
-v $(pwd)/svcs:/root/svcs \
-d \
-p $PORT:$PORT \
ghcr.io/ec-release/service:v1.1 &> /dev/null

cat << EOF


[iv] launch agent instance
-------------------------------------
EOF

docker run \
-e AGENT_REV=v1.hokkaido.213 \
-e EC_PPS=$CA_PPS -it ghcr.io/ec-release/oci/agent:v1 -ver

cat << EOF


[v] initialising test
-------------------------------------
EOF

sleep 10

cat << EOF


[vi] verify serialised service setting 
-------------------------------------
EOF

tree ./svcs
cat ./svcs/$EC_SVC_ID.json

cat << EOF


[vii] endpoints checking
-------------------------------------

 - cognito token validation (sac)
 - Auth Bearer
 - /v1.1/api/token/validate
 
EOF

x=1
while [ $x -le 50 ]
do
  curl -X POST -sS -H 'Authorization: Bearer my-bearer-token' -w "\n[$x] total time taken: %{time_total}s\n" http://localhost:$PORT/v1.1/api/token/validate
  x=$(( $x + 1 ))
  sleep 0.5
done

cat << EOF


 - admin call
 - Auth Basic
 - /v1.1/health/memory
 
EOF

x=1
while [ $x -le 50 ]
do
  curl -u "admin:$EC_ADM_TKN" -sS -w "\n[$x] total time taken: %{time_total}s\n" http://localhost:$PORT/v1.1/health/memory
  x=$(( $x + 1 ))
  sleep 1
done

cat << EOF


 - cert retrieval call
 - Auth Basic
 - /v1.1/api/pubkey
 
EOF

x=1
while [ $x -le 50 ]
do
  curl -u "admin:$EC_ADM_TKN" -sS -w "\n[$x] total time taken: %{time_total}s (test content discarded)\n" --output /dev/null http://localhost:$PORT/v1.1/api/pubkey
  x=$(( $x + 1 ))
  sleep 1
done

cat << EOF


[vii] logs dump
-------------------------------------
EOF
docker logs svc --tail 500
