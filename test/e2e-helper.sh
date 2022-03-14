#!/bin/bash

# $1: cognito tkn endpoint. $2: cognito clientid. $3: cognito client secrt
# output: the token
function fetchCognitoTkn() {
  echo my task
  #do somthing
}

cat << EOF



[*] test fetchCognitoTkn
-------------------------------------

my_token=$(fetchCognitoTkn <$cgnto-url> <$cgnto-cid> <$cgnto-csc>)

echo my_token: $my_token


EOF
