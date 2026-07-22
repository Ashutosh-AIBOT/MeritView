FROM node:20-alpine
WORKDIR /app
RUN npm install -g json-server
COPY mock-llm/db.json /app/db.json
EXPOSE 4000
CMD ["json-server", "--watch", "/app/db.json", "--port", "4000", "--host", "0.0.0.0"]
