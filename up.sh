#!/bin/sh

docker network connect finance_network oracledb
docker container start oracledb

cd ~/Documents/Repos/FinanceAI
docker rm financeai
docker build --pull --rm -f "Dockerfile" -t financeai:latest "."
docker run --name financeai -p 8000:8000 --network finance_network financeai:latest