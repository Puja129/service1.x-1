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
# development memo:
# this test is to demonstrate the resiliency of the upgraded EC service v1.1, sac, and its-
# service-2-sac integration, with the goals [1]avoiding potential human error/silos during a manual-
# tests, [2]migrating current EC service instances deployed in cloud foundry to a targeted K8 inst-
# [3]providing data to enable performance analysis.
#

cat << EOF

-------------------------------------
[i] environment setting
-------------------------------------
EOF
source <(wget -q -O - https://raw.githubusercontent.com/EC-Release/sdk/disty/scripts/libs/db.sh)

#need helps!
source <(wget -q -O - https://raw.githubusercontent.com/ayasuda-ge/service1.x/1.1/test/e2e-helper.sh)

SVC_PORT=7990
EC_ADM_TKN="my-legacy-admin-token"
EC_SVC_ID="my-test-id"
EC_SVC_URL="http://localhost:${SVC_PORT}"

SAC_MST_PORT=7991
SAC_SLV_PORT=7992
SAC_TYPE_MST="master"
SAC_TYPE_SLV="slave"
SAC_URL_MST="http://localhost:${SAC_MST_PORT}"
SAC_URL_SLV="http://localhost:${SAC_SLV_PORT}"

CGNTO_URL="<cognito-url>"
CGNTO_CID="<cognito-csc>"
CGNTO_CSC="<cognito-cid>"

crdj=$(getCredJson "cred.json" "$EC_GITHUB_TOKEN")
EC_CID=$(echo $crdj | jq -r ".svc1_1Test.devId")
EC_CSC=$(echo $crdj | jq -r ".svc1_1Test.ownerHash")
AGT_HS=$(echo $crdj | jq -r ".svc1_1Test.pps4agt1")

cat << EOF

-------------------------------------
[ii] mockup legacy setting
-------------------------------------
EOF

#EC_SETTING=$(printf '{"%s":{"ids":["my-aid-1","my-aid-2"],"trustedIssuerIds":["legacy-cf-uaa-url"]}}' "$EC_SVC_ID" | jq -aRs . | base64 -w0)      
EC_SETTING=$(printf '{"%s":{"ids":["my-aid-1","my-aid-2"],"trustedIssuerIds":["legacy-cf-uaa-url"]}}' "$EC_SVC_ID" | base64 -w0)      

cat << EOF

-------------------------------------
[iii] launch sac master
-------------------------------------
EOF

docker run \
--network=host \
--name="$SAC_TYPE_MST" \
-e SAC_TYPE="$SAC_TYPE_MST" \
-e SAC_URL="$SAC_URL_MST" \
-e EC_CID="$EC_CID" \
-e EC_CSC="$EC_CSC" \
-e EC_PORT=":$SAC_MST_PORT" \
-p "$SAC_MST_PORT:$SAC_MST_PORT" \
-d \
ghcr.io/ec-release/sac:"$SAC_TYPE_MST" &> /dev/null
 
sleep 10
 
cat << EOF

-------------------------------------
[iv] launch sac slave
-------------------------------------
EOF

docker run \
--network=host \
--name="$SAC_TYPE_SLV" \
-e SAC_TYPE="$SAC_TYPE_SLV" \
-e SAC_URL_MST="$SAC_URL_MST" \
-e SAC_URL="$SAC_URL_SLV" \
-e EC_CID="$EC_CID" \
-e EC_CSC="$EC_CSC" \
-e EC_PORT=":$SAC_SLV_PORT" \
-p "$SAC_SLV_PORT:$SAC_SLV_PORT" \
-d \
ghcr.io/ec-release/sac:"$SAC_TYPE_SLV" &> /dev/null

sleep 10

cat << EOF

-------------------------------------
[v] launch service instance
-------------------------------------
EOF

mkdir -p ./svcs

docker run \
--network=host \
--name=svc \
-e EC_SVC_ID="$EC_SVC_ID" \
-e EC_SVC_URL="$EC_SVC_URL" \
-e EC_SAC_MSTR_URL="$SAC_URL_MST" \
-e EC_SAC_SLAV_URL="$SAC_URL_SLV" \
-e EC_ADM_TKN="$EC_ADM_TKN" \
-e EC_CID="$EC_CID" \
-e EC_CSC="$EC_CSC" \
-e EC_SETTING="$EC_SETTING" \
-e EC_PORT=":$SVC_PORT" \
-v "$(pwd)/svcs:/root/svcs" \
-p "$SVC_PORT:$SVC_PORT" \
-d \
ghcr.io/ec-release/svc:1.1 &> /dev/null

sleep 10

cat << EOF

-------------------------------------
[vi] launch agent instance
-------------------------------------
EOF

docker run \
--network=host \
-e AGENT_REV=v1.hokkaido.213 \
-e EC_PPS="$AGT_HS" ghcr.io/ec-release/agt:1 -ver

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

-------------------------------------
[vii] initialising test
-------------------------------------

EOF

cat << EOF

-------------------------------------
[viii] verify serialised service setting 
-------------------------------------

EOF

tree ./svcs
cat ./svcs/$EC_SVC_ID.json

cat << EOF

-------------------------------------
[viv] endpoints checking
-------------------------------------

EOF

#do nothing

cat << EOF


 - admin call
 - Auth Basic
 - /v1/index/
 - /v1.1/index/swagger.json
 
EOF

count=20

x=1
while [ $x -le "$count" ]
do
  curl -u "admin:$EC_ADM_TKN" -sS -w "\n[$x] time taken: %{time_total}s (v1)\n" -o /dev/null "${EC_SVC_URL}/v1/index/"
  sleep 0.5
  curl -u "admin:$EC_ADM_TKN" -sS -w "\n[$x] time taken: %{time_total}s (v1.1)\n" -o /dev/null "${EC_SVC_URL}/v1.1/index/swagger.json"
  x=$(( $x + 1 ))
  sleep 0.5
done

cat << EOF


 - admin call
 - Auth Basic
 - /v1/health/memory
 - /v1.1/health/memory
 
EOF

x=1
while [ $x -le "$count" ]
do
  curl -u "admin:$EC_ADM_TKN" -sS -w "\n[$x] time taken: %{time_total}s (v1)" "${EC_SVC_URL}/v1/health/memory"
  sleep 0.5
  curl -u "admin:$EC_ADM_TKN" -sS -w "\n[$x] time taken: %{time_total}s (v1.1)" "${EC_SVC_URL}/v1.1/health/memory"
  x=$(( $x + 1 ))
  sleep 0.5
done

cat << EOF


 - cognito token validation (sac)
 - Auth Bearer
 - the flow:
   |_ <cognito-url>/oauth/token               |
     |_ <sac-master>/**/**/<ec-cid>/reg       v
       |_ <sac-slave>/**/**/<svc-id>/vfy
         |_ /v1/api/token/validate            | 
           |_ /v1.1/api/token/validate        v
 
EOF


#my_token=$(fetchCognitoTkn <$cgnto-url> <$cgnto-cid> <$cgnto-csc>)
#format of the req body
#req_body=$(printf '{"hello":"world","token":"%s"}' "$my_token" | jq -aRs . )
#curl <sac> -h <some-header> -d "$req_body"

x=1; y1=0; y2=0
while [ "$x" -le "$count" ]
do
  #ts=$(curl -X POST -sS -H 'Authorization: Bearer my-bearer-token' -w "%{time_total}" -o /dev/null "http://localhost:$PORT/v1.1/api/token/validate")
  ts1=$(curl -X POST -sS -H 'Authorization: Bearer my-bearer-token' -w "%{time_total} (v1)" -o ./tmp "${EC_SVC_URL}/v1/api/token/validate")
  sleep 0.5
  ts2=$(curl -X POST -sS -H 'Authorization: Bearer my-bearer-token' -w "%{time_total} (v1.1)" -o ./tmp "${EC_SVC_URL}/v1.1/api/token/validate")
  cat ./tmp && rm ./tmp
  printf "\n[%s] total time taken: %s sec." "$x" "$ts1"
  printf "\n[%s] total time taken: %s sec." "$x" "$ts2"
  x=$(( $x + 1 ))
  y1=$(awk "BEGIN{print $y1+$ts1}")
  y2=$(awk "BEGIN{print $y2+$ts2}")
  sleep 0.5
done

y1=$(awk "BEGIN{print $y1/$count}")
y2=$(awk "BEGIN{print $y2/$count}")

btkn=$(getSdcTkn "$EC_CID" "$EC_CSC" "$SAC_URL_MST")
tdat=$(printf '{"parent":"%s","averagedTimeV1":"%s","averagedTimeV2":"%s","numOfRuns":"%s","objective":"integration service endpoints","pathV1":"/v1/api/token/validate","pathV2":"/v1.1/api/token/validate","logs":"https://github.com/ayasuda-ge/service1.x/actions/runs/%s"}' "06ba9042-3b53-4b77-b71d-cd6f6417a4b2" "$y1" "$y2" "$count" "$GITHUB_RUN_ID")
echo $tdat
insertData "$SAC_URL_SLV" "service e2e build [$EC_BUILD_ID]" "$btkn" "$tdat"

cat << EOF


 - cert retrieval call
 - Auth Basic
 - /v1/api/pubkey
 - /v1.1/api/pubkey
 
EOF

x=1
while [ $x -le "$count" ]
do
  curl -u "admin:$EC_ADM_TKN" -sS -w "\n[$x] total time taken: %{time_total}s (v1)" --output /dev/null "${EC_SVC_URL}/v1/api/pubkey"
  sleep 0.5
  curl -u "admin:$EC_ADM_TKN" -sS -w "\n[$x] total time taken: %{time_total}s (v1.1)" --output /dev/null "${EC_SVC_URL}/v1.1/api/pubkey"
  x=$(( $x + 1 ))
  sleep 0.5
done

cat << EOF

-------------------------------------
[vv] logs dump & qa data sync
-------------------------------------
EOF
docker logs svc --tail 500
sleep 10
