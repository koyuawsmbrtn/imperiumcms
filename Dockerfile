FROM alpine:latest

WORKDIR /app
ADD . /app

RUN apk update && apk upgrade
RUN apk add nodejs npm python3 redis git
RUN python3 -m ensurepip
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt
RUN npm install
RUN npm run build

EXPOSE 8080

CMD ["sh", "run.sh"]