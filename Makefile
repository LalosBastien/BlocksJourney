# linux / windows / mac
OS = mac

ifdef BUILD_ENV
  OS = $(BUILD_ENV)
endif

install: ;\
  npm install

start: ;\
  npm run start

browser: ;\
  npm run ng:serve

build-dev: ;\
  npm run build

build-prod: ;\
 npm run build:prod

electron: ;\
  npm run electron:local

package: ;\
  npm run electron:$(OS)

clean: ;\
  rm -rf  node_modules  \
          dist          \
          app-builds    \
          main.js       \

all: clean install start
