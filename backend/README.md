Prerequisites
Ensure that you have the following prerequisites installed:
Node.js: Install Node.js from the official website (https://nodejs.org).
PostgreSQL: Install PostgreSQL on your system (https://www.postgresql.org/download/).

Installation
Clone or download the project code to your local machine.

Database Setup
Create a new PostgreSQL database or use an existing one to connect the server.
Modify the code in your SQL file according to your requirements.

Server Configuration
Locate the section containing the database connection configuration:
const pool = new Pool({
user: "postgres",
host: "localhost",
database: "services_database",
password: "password",
});
Modify the configuration parameters (user, host, database, password) to match your PostgreSQL setup.

Server Startup
#npm install
#node server.js
The server should now be running and listening for requests.

Testing the Server
Open a web browser or API testing tool (e.g., Postman).
Access the server using the following URL: http://127.0.0.1:3003/services/all
If the server is running correctly, you should receive a response or see the server logs in the terminal.
