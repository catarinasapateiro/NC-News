# NC News Seeding

- Create 2 .env files inside NORTHCODERS-NEWS-BE folder

  1. File Name: .env.test
     Content: PGDATABASE=nc_news_test

  2. File Name: .env.development
     Content: PGDATABASE=nc_news

- Run the following commands in the terminal to check if the connections to each database are working correctly.

  1. Command: npm run test-seed
     Expected log: Connected to nc_news_test

  2. Command: npm run seed-dev
     Expected log: Connected to nc_news

- If you have problems connecting to the databases, check the path in the connection.js file. You might have created your .env files in the wrong folder.
