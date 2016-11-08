FROM node:6.9.1

# Set the timezone.
RUN cp /usr/share/zoneinfo/Europe/Prague /etc/localtime

RUN apt-get update && apt-get install cron -y

RUN useradd -ms /bin/bash app && gpasswd -a app users && gpasswd -a app crontab

RUN touch /var/log/cron.log && chmod 777 /var/log/cron.log

USER app

WORKDIR /home/app

CMD (crontab -l 2>/dev/null; echo "00 00 * * * node /home/app/bin/app.js") | crontab - && tail -f /var/log/cron.log