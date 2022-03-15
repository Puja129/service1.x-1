#!/bin/bash

# $1: cognito tkn endpoint. $2: cognito clientid. $3: cognito client secrt
# output: the token
function fetchCognitoTkn() {
  auth=$(echo -n "$2:$3" | base64)
  resp=$(curl -s -X POST "$1" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H "Authorization: Basic $auth" \
  -d 'grant_type=client_credentials')
  #printf "{\"resp\":\"%s\"}" "${resp}"
  #val_resp=$(echo "${resp}" | grep "$access_token")
  echo "$resp" | jq -r '.access_token'
  #printf '%s' "$my_token"
}
my_token=$(fetchCognitoTkn "$COGNITO_URL" "$COGNITO_CID" "$COGNITO_CSC")
jwtdec=$(echo "$my_token" | jq -R 'split(".") | .[0] | @base64d | fromjson')
kid=$(echo "$jwtdec" | jq -r '.kid')
echo kid: $kid

: 'cat << EOF



[*] test fetchCognitoTkn
-------------------------------------

my_token=$(fetchCognitoTkn "$COGNITO_URL" "$COGNITO_CID" "$COGNITO_CSC")

echo my_token: $my_token


EOF'
