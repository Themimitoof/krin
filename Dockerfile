FROM node:10-alpine
LABEL maintainer="Michael \"themimitoof\" Vieira <contact+dev[ÄT]mvieira[døt]fr>"


WORKDIR /krin
COPY --chown=991:991 . .

RUN addgroup -g991 krin && \
    adduser -S -u991 -Gkrin krin && \
    chown krin:krin -R /krin

USER 991:991
RUN npm i

RUN [ ! -f config/krin.json ] && cp config/krin.json.sample config/krin.json || :
RUN [ ! -f config/database.json ] && cp config/database.json.sample config/database.json || :
RUN [ ! -f db/krin.db ] && touch db/krin.db || :

EXPOSE 8095
CMD npm run prod