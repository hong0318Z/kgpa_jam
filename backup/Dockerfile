FROM alpine:3.20

RUN apk add --no-cache postgresql16-client dcron tzdata

ENV TZ=Asia/Seoul

COPY backup-db.sh /usr/local/bin/backup-db.sh
RUN chmod +x /usr/local/bin/backup-db.sh \
    && echo "0 12 * * * /usr/local/bin/backup-db.sh >> /backups/backup.log 2>&1" > /etc/crontabs/root

CMD ["crond", "-f", "-l", "2"]
