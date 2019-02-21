FROM centos/nodejs-8-centos7:latest
USER root

ENV APP_ROOT=/opt/app-root/src/express \
    PATH=/opt/rh/rh-nodejs8/root/usr/bin:$PATH

WORKDIR $APP_ROOT
COPY *.json $APP_ROOT/
RUN npm install && npm cache verify

COPY app.js $APP_ROOT/
COPY bin $APP_ROOT/bin
COPY public $APP_ROOT/public
COPY routes $APP_ROOT/routes
COPY views $APP_ROOT/views
EXPOSE 3000
CMD ["npm", "start"]
