FROM node:11.9.0
ENV APP_ROOT /usr/src/express

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
