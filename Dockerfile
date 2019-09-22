FROM centos/nodejs-8-centos7:latest
USER root

ARG http_proxy
ARG https_proxy

ENV APP_ROOT=/opt/app-root/src/depot \
    PATH=/opt/rh/rh-nodejs8/root/usr/bin:$PATH \
    TITLE=Depot \
    UPLOAD_DIR=public/ftp \
    DOWNLOAD_DIR=/ftp \
    http_proxy=$http_proxy \
    https_proxy=$https_proxy

WORKDIR $APP_ROOT
COPY *.json $APP_ROOT/
RUN npm install && npm cache verify && \
    yum install -y createrepo && yum clean all

COPY app.js $APP_ROOT/
COPY bin $APP_ROOT/bin
COPY public $APP_ROOT/public
COPY routes $APP_ROOT/routes
COPY views $APP_ROOT/views
COPY lib $APP_ROOT/lib
COPY templates $APP_ROOT/templates
EXPOSE 3000
CMD ["npm", "start"]
