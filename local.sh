#!/bin/sh

docker start oracledb

sleep 30 && python manage.py runserver_plus --cert-file cert.pem --key-file key.pem 8000 &

cd finance-ai-react/
npm start