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

cat << EOF


[i] environment setting
-------------------------------------
EOF
source <(wget -q -O - https://raw.githubusercontent.com/EC-Release/sdk/disty/scripts/libs/db.sh)
crdj=$(getCredJson "cred.json" "$EC_GITHUB_TOKEN")
EC_CID=$(echo $crdj | jq -r ".svc1_1Test.devId")
EC_CSC=$(echo $crdj | jq -r ".svc1_1Test.ownerHash")

cat << EOF


[ii] mockup legacy setting
-------------------------------------
EOF

#EC_SETTING=$(printf '{"%s":{"ids":["my-aid-1","my-aid-2"],"trustedIssuerIds":["legacy-cf-uaa-url"]}}' "$EC_SVC_ID" | jq -aRs . | base64 -w0)      
EC_SETTING=$(printf '{"%s":{"ids":["my-aid-1","my-aid-2"],"trustedIssuerIds":["legacy-cf-uaa-url"]}}' "$EC_SVC_ID" | base64 -w0)      

cat << EOF


[iii] launch service instance
-------------------------------------
EOF

PORT=7990
mkdir -p ./svcs
#timeout -k 10 10 \
docker run --name=svc \
-e EC_SVC_ID=$EC_SVC_ID \
-e EC_SVC_URL=$EC_SVC_URL \
-e EC_SAC_URL=$EC_SAC_URL \
-e EC_ATH_URL=$EC_ATH_URL \
-e EC_ADM_TKN=$EC_ADM_TKN \
-e EC_CID=$EC_CID \
-e EC_CSC=$EC_CSC \
-e EC_SETTING=$EC_SETTING \
-e EC_SCRIPT_1=$EC_SCRIPT_1 \
-e EC_SCRIPT_2=$EC_SCRIPT_2 \
-e EC_SCRIPT_3=$EC_SCRIPT_3 \
-e PORT=$PORT \
-v $(pwd)/svcs:/root/svcs \
-p $PORT:$PORT \
ghcr.io/ec-release/svc:v1.1
#-d \
#ghcr.io/ec-release/svc:v1.1 &> /dev/null

exit 0
#curl "http://localhost:$PORT/v1.1/info/"

#docker logs svc --tail 1000
#exit 0

cat << EOF


[iv] launch agent instance
-------------------------------------
EOF

CA_PPS=$(echo $crdj | jq -r ".agt4Svc1_1Test.ownerHash")
docker run \
-e AGENT_REV=v1.hokkaido.213 \
-e EC_PPS=$CA_PPS ghcr.io/ec-release/agent:v1 -ver

: 'GTW_TKN=$(printf "admin:%s" "$SvcTkn" | base64 -w0)
GTW_PRT="7991"
GTW_URL="http://localhost:$GTW_PRT"
SVC_URL="http://localhost:$PORT"

agent \
-tkn "$GTW_TKN" \
-sst "$SVC_URL" \
-hst "$GTW_URL" \
-mod "gateway" \
-prt "$GTW_PRT"

agent \
-cid "my-cognito-client-id" \
-csc "my-cognito-client-secret" \
-oa2 "my-cognito-tkn-url" \
-sst "$SVC_URL" \
-hst "$GTW_URL" \
-mod "server" \
-dbg'


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

# beging proxy test
: 'curl http://localhost:$PORT/v1.2beta > .tmp
cat .tmp
docker logs svc --tail 500
exit 0'
# end proxy test

x=1; y=0; count=50
while [ $x -le $count ]
do
  #ts=$(curl -X POST -sS -H 'Authorization: Bearer my-bearer-token' -w "%{time_total}" -o /dev/null "http://localhost:$PORT/v1.1/api/token/validate")
  ts=$(curl -X POST -sS -H 'Authorization: Bearer my-bearer-token' -w "%{time_total}" -o ./tmp "http://localhost:$PORT/v1.1/api/token/validate")
  cat ./tmp && rm ./tmp
  printf "\n[%s] total time taken: %s sec.\n" "$x" "$ts"
  x=$(( $x + 1 ))
  y=$(awk "BEGIN{print $y+$ts}")
  sleep 0.5
done

y=$(awk "BEGIN{print $y/$count}")

btkn=$(getSdcTkn "$EC_CID" "$EC_CSC" "$EC_ATH_URL")
tdat=$(printf '{"parent":"%s","averagedTime":"%s","numOfRuns":"%s","objective":"integration service endpoints","path":"/v1.1/api/token/validate","logs":"https://github.com/ayasuda-ge/service1.x/actions/runs/%s"}' "06ba9042-3b53-4b77-b71d-cd6f6417a4b2" "$y" "$count" "$GITHUB_RUN_ID")
echo $tdat
insertData "$EC_SAC_URL" "service e2e build [$EC_BUILD_ID]" "$btkn" "$tdat"

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
