FROM node:8-alpine
MAINTAINER Jon Ribeiro <contact@jonathas.com>

RUN apk update && apk add tzdata mongodb-tools &&\ 
    cp /usr/share/zoneinfo/Europe/Prague /etc/localtime &&\ 
    echo "Europe/Prague" > /etc/timezone &&\ 
    apk del tzdata && rm -rf /var/cache/apk/*

CMD chown root:root /etc/crontabs/root && /usr/sbin/crond -f