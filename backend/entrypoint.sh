#!/bin/bash

apt-get update
apt-get install -y postgresql

PGPASSWORD=mitos-password pg_restore -U postgres -d services_database -h db < db_backup.sql

npm start
