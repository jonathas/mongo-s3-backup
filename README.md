# Mongo S3 Backup

[![Build Status](https://travis-ci.org/jonathas/mongo-s3-backup.svg?branch=master)](https://travis-ci.org/jonathas/mongo-s3-backup) [![Coverage Status](https://coveralls.io/repos/github/jonathas/mongo-s3-backup/badge.svg?branch=master)](https://coveralls.io/github/jonathas/mongo-s3-backup?branch=master)

A script that generates a dump from your MongoDB databases, compresses this dump as tar.bz2, generates a hash file for integrity check and then uploads both files to your Amazon S3 bucket.

In order to test it, be sure to have the following dependencies installed on your system:

- MongoDB installed and running
- [yarn](https://yarnpkg.com/)
- [docker](https://www.docker.com)
- [docker-compose](https://docs.docker.com/compose/install/)

Before running anything, please configure your AWS credentials inside the .env file.

You can run the backup script directly on your system and [configure cron by yourself](https://corenominal.org/2016/05/12/howto-setup-a-crontab-file/) or use the Docker config provided. 

In order to start the Docker container and configure cron inside of it to run the script every day at 00:00 CET, run:

```
$ make
```

If you don't want to use Docker, just run instead:

```
$ make no-docker
```

And then configure the script directly on your system's cron.