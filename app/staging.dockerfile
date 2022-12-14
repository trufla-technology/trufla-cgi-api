FROM node:6.4

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN cd $(npm root -g)/npm \
    && npm install fs-extra \
    && sed -i -e s/graceful-fs/fs-extra/ -e s/fs.rename/fs.move/ ./lib/utils/rename.js
RUN npm install pm2 -g
RUN npm install -g sails@0.12.4
RUN npm install -g mocha
RUN npm install sails@0.12.4

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

CMD ["pm2-docker", "app.js"]