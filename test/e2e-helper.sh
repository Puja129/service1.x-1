#!/bin/bash

# $1: cognito tkn endpoint. $2: cognito clientid. $3: cognito client secrt
# output: the token
function fetchCognitoTkn() {
  echo my task

}
#my_token=$(fetchCognitoTkn "$COGNITO_URL" "$COGNITO_CID" "$COGNITO_CSC")
#jwtdec=$(echo "$my_token" | jq -R 'split(".") | .[0] | @base64d | fromjson')
#kid=$(echo "$jwtdec" | jq -r '.kid')
#echo kid: $kid

: 'cat << EOF



[*] test fetchCognitoTkn
-------------------------------------

my_token=$(fetchCognitoTkn "$COGNITO_URL" "$COGNITO_CID" "$COGNITO_CSC")

echo my_token: $my_token


EOF'
