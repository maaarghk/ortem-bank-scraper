# references: https://github.com/buildkite/docker-puppeteer/blob/master/Dockerfile
#             https://paul.kinlan.me/hosting-puppeteer-in-a-docker-container/
FROM node:10.17.0-slim@sha256:17df3b18bc0f1d3ebccbd91e8ca8e2b06d67cb4dc6ca55e8c09c36c39fd4535d

RUN  apt-get update \
     # Install latest chrome dev package, which installs the necessary libs to
     # make the bundled version of Chromium that Puppeteer installs work.
     && apt-get install -y wget --no-install-recommends \
     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
     && apt-get update \
     && apt-get install -y google-chrome-unstable fonts-ipafont-gothic \
        fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont libxtst6 \
        libxss1 --no-install-recommends \
     && rm -rf /var/lib/apt/lists/*


RUN usermod -aG audio,video node \
    && mkdir -p /home/node/Downloads

ADD ./app /home/node/app
RUN chown -R node:node /home/node

# Run everything after as non-privileged user.
USER node
WORKDIR /home/node/app
RUN npm i
EXPOSE 8084

CMD [ "node", "index.js" ]