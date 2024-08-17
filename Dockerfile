# Image to build project with
FROM python:3.12.4

# Any environment variables set using ENV key=value

# WORKDIR is the location where the rest of instructions in Dockefile will run (can put another but at the end of each)
WORKDIR /FinanceAI

# Install dependencies
RUN apt-get update && apt-get install -y libaio1 wget unzip

# Create directory for Oracle Instant Client
RUN mkdir -p /opt/oracle/instantclient

# Install Oracle Instant Client
RUN wget https://download.oracle.com/otn_software/linux/instantclient/191000/instantclient-basic-linux.x64-19.10.0.0.0dbru.zip \
    && unzip instantclient-basic-linux.x64-19.10.0.0.0dbru.zip \
    && rm instantclient-basic-linux.x64-19.10.0.0.0dbru.zip \
    && mv instantclient_19_10 /opt/oracle/instantclient \
    && ln -s /opt/oracle/instantclient/libclntsh.so.19.1 /usr/lib/libclntsh.so \
    && ln -s /opt/oracle/instantclient/libclntshcore.so.19.1 /usr/lib/libclntshcore.so \
    && ln -s /opt/oracle/instantclient/libocci.so.19.1 /usr/lib/libocci.so

# Set Oracle environment variables
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient/instantclient_19_10

# Copy requirements file to cache
COPY requirements.txt .

# Install dependencies in requirements.txt file
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Sleep 30 seconds so that Oracle can start up, then Run Django server
ENTRYPOINT ["sh", "-c", "sleep 30 && python manage.py runserver_plus --cert-file cert.pem --key-file key.pem 0.0.0.0:8000"]