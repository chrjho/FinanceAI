#!/bin/sh

docker start oracledb

sleep 60 && python manage.py runserver_plus --cert-file cert.pem --key-file key.pem 8000 &

cd finance-ai-react/
npm start