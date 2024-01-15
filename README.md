# Northcoders News API

This News API contains two databases: a test database for testing and a database containing data intended to simulate real data

How to create and connect to these two databases -

To create test and development databases:
- create a .env.test file containing: PGDATABASE=nc_news_test
- create a .env.test file containing: PGDATABASE=nc_news
- in terminal run the following commands:

npm install
npm run setup-dbs
npm run seed