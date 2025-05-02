# NC News

- NC News is a backend and frontend project which aims to create a NC news website hosted online
- Link to hosted code version: https://nc-news-cs.onrender.com/

# Cloning NC News

- Please fork and clone the main repository stored in https://github.com/catarinasapateiro/NC-News

# Installing required dependencies

- Refer to the package.json file and install all dependencies under Dependencies and Devdependencies
- Minimum required versions

  1.  express - 5.1.0
  2.  Node js - v23.8.0

# Repository structure

- The repository is organised in different folders

  1. Folder Name: **tests**
     Content: Includes all tests files runned with jest and supertest

  2. Folder Name: app
     Content: Includes our Express server where different requests(get,post,patch and delete) are send to our databases(test and development). The app folder is organised following the MVC structure (Model,View and Controller)

  3. Folder Name: db
     Content: Includes our PostgreSQL databases(test and development). The databases are seeded through the seed js file. This file ensures the databases will be populated with the tables (articles,comments,toppics and users) and corresponding content. The content is simplified on the test database, but it follows the same structure of the development file.

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
