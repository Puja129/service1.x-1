#
#  Copyright (c) 2019 General Electric Company. All rights reserved.
#
#  The copyright to the computer software herein is the property of
#  General Electric Company. The software may be used and/or copied only
#  with the written permission of General Electric Company or in accordance
#  with the terms and conditions stipulated in the agreement/contract
#  under which the software has been supplied.
#
#  author: apolo.yasuda@ge.com
#

FROM node:16-alpine
#FROM node:7

USER root
WORKDIR /root

COPY ./package.json ./

RUN apk update && apk add --no-cache wget curl git tree bash jq python3 && \
ln -sf /usr/bin/python3 /usr/bin/python && \
npm install

RUN echo 'export PATH=$PATH:$HOME/.ec' >> /etc/profile && mkdir -p ~/.ec && echo '#!/bin/bash' >> ./.ec/~tmp && \
echo 'source <(wget -q -O - https://raw.githubusercontent.com/EC-Release/sdk/disty/scripts/service1.x/service_v1.1.sh) "$@"' >> ./.ec/~tmp && \
chmod +x ./.ec/~tmp

ENTRYPOINT ["./.ec/~tmp"]
