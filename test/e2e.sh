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

[1] mockup legacy setting
-------------------------------------
EOF

EC_SETTING=$(echo '{"my-test-id":{"ids":["my-aid-1","my-aid-2"],"trustedIssuerIds":["legacy-cf-uaa-url"]}}' | base64 -w0)      

cat << EOF

[2] launch service instance
-------------------------------------
EOF

mkdir -p ./svcs
docker run --name=svc \
-e EC_SVC_ID=$EC_SVC_ID \
-e EC_SVC_URL=$EC_SVC_URL \
-e EC_ADM_TKN=$EC_ADM_TKN \
-e EC_SAC_DN=$EC_SAC_DN \
-e EC_ATH_DN=$EC_ATH_DN \
-e EC_CID=$EC_CID \
-e EC_CSC=$EC_CSC \
-e EC_SETTING=$EC_SETTING \
-e EC_SCRIPT_1=$EC_SCRIPT_1 \
-e EC_SCRIPT_2=$EC_SCRIPT_2 \
-e EC_SCRIPT_3=$EC_SCRIPT_3 \
-v $(pwd)/svcs:/root/svcs \
-d \
ghcr.io/ec-release/service:v1.1 &> /dev/null

sleep 10

cat << EOF

[3] verify serialised service setting 
-------------------------------------
EOF

tree ./svcs
cat ./svcs/$EC_SVC_ID.json