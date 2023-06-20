const http = require("http");
const request = require("request");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const hostname = "0.0.0.0";
const port = 3003;

app.use(cors());

// Create a pool object to manage database connections
const pool = new Pool({
  user: "postgres",
  host: "db", //TODO: change this to db for docker (was localhost)
  database: "services_database",
  password: "mitos-password", //TODO: change this to mitos-password for docker
  port: 5432,
});

// DISTINCT
app.get("/services_for_evidence_distinct/:evidence_id", (req, res) => {
  // Write your SQL query as a string
  const evidence_id = req.params.evidence_id;

  const sqlQuery = `SELECT  DISTINCT se.evidence_description
    FROM services s
    INNER JOIN service_evidences se ON se.service_id = s.service_id
    WHERE se.evidence_id = ${evidence_id};`;

  //const sqlQuery = "select * from evidences";
  // Use the pool object to execute the query
  pool.query(sqlQuery, (err, result) => {
    if (err) {
      console.error(evidence_id, err);
      res.status(500).send("Error executing query");
    } else {
      res.send(result.rows);
    }
  });
});

app.get("/editted_services_for_evidence_distinct/:evidence_id", (req, res) => {
  // Write your SQL query as a string
  const evidence_id = req.params.evidence_id;

  const sqlQuery = `SELECT  DISTINCT se.evidence_description
    FROM services s
    INNER JOIN editted_service_evidences se ON se.service_id = s.service_id
    WHERE se.evidence_id = ${evidence_id};`;

  //const sqlQuery = "select * from evidences";
  // Use the pool object to execute the query
  pool.query(sqlQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error executing query");
    } else {
      res.send(result.rows);
    }
  });
});

// Define a route to execute a sample query
app.get("/services_for_evidence/:evidence_id", (req, res) => {
  // Write your SQL query as a string
  const evidence_id = req.params.evidence_id;

  const sqlQuery = `SELECT s.service_id, se.evidence_id, se.evidence_description
    FROM services s
    INNER JOIN service_evidences se ON se.service_id = s.service_id
    WHERE se.evidence_id = ${evidence_id};`;

  //const sqlQuery = "select * from evidences";
  // Use the pool object to execute the query
  pool.query(sqlQuery, (err, result) => {
    if (err) {
      console.error(evidence_id, err);
      res.status(500).send("Error executing query");
    } else {
      res.send(result.rows);
    }
  });
});

app.get("/editted_services_for_evidence/:evidence_id", (req, res) => {
  // Write your SQL query as a string
  const evidence_id = req.params.evidence_id;

  const sqlQuery = `SELECT s.service_id, se.evidence_id, se.evidence_description
    FROM services s
    INNER JOIN editted_service_evidences se ON se.service_id = s.service_id
    WHERE se.evidence_id = ${evidence_id};`;

  //const sqlQuery = "select * from evidences";
  // Use the pool object to execute the query
  pool.query(sqlQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error executing query");
    } else {
      res.send(result.rows);
    }
  });
});

app.get("/services", (req, res) => {
  // Build the options object with the dynamic parameter

  const page = req.query.page; // retrieves value of "page" (e.g. 2)
  const limit = req.query.limit; // retrieves value of "limit" (e.g. 10)

  const options = {
    url: `https://api.digigov.grnet.gr/v1/services?page=${page}&limit=${limit}`,
    headers: {
      "User-Agent": "request",
    },
  };

  request.get(options, (error, response, body) => {
    if (error) {
      res.statusCode = 500;
      res.end(`Error: ${error.message}`);
    } else {
      res.statusCode = response.statusCode;
      res.setHeader("Content-Type", "application/json");
      res.end(body);
    }
  });
});

app.get("/services/:process_id", (req, res) => {
  // Get the value of the 'name' parameter from the request object
  let process_id = req.params.process_id;
  if (process_id === "all") {
    process_id = "";
  }
  // console.log("req.querysss", process_id);
  // Build the options object with the dynamic parameter
  const options = {
    url: `https://api.digigov.grnet.gr/v1/services/${process_id}`,
    headers: {
      "User-Agent": "request",
    },
  };

  request.get(options, (error, response, body) => {
    if (error) {
      res.statusCode = 500;
      res.end(`Error: ${error.message}`);
    } else {
      res.statusCode = response.statusCode;
      res.setHeader("Content-Type", "application/json");
      res.end(body);
    }
  });
});

app.get("/services/search/:search_field/:search_param", (req, res) => {
  // Get the value of the 'name' parameter from the request object
  const search_field = encodeURIComponent(req.params.search_field);
  const search_param = encodeURIComponent(req.params.search_param);

  // Get the dynamic parameter from the request
  // Build the options object with the dynamic parameter
  const options = {
    url: `https://api.digigov.grnet.gr/v1/services/search/${search_field}/${search_param}`,
    headers: {
      "User-Agent": "request",
    },
  };

  request.get(options, (error, response, body) => {
    if (error) {
      res.statusCode = 500;
      res.end(`Error: ${error.message}`);
    } else {
      res.statusCode = response.statusCode;
      res.setHeader("Content-Type", "application/json");
      res.end(body);
    }
  });
});

app.get("/evidence/:evidence_id", (req, res) => {
  // Get the value of the 'name' parameter from the request object
  const evidence_id = req.params.evidence_id;

  // console.log("evidence_id", evidence_id);
  // Get the dynamic parameter from the request
  // Build the options object with the dynamic parameter
  const options = {
    url: `https://api.digigov.grnet.gr/v1/registries/evidence/${evidence_id}`,
    headers: {
      "User-Agent": "request",
    },
  };

  request.get(options, (error, response, body) => {
    if (error) {
      res.statusCode = 500;
      res.end(`Error: ${error.message}`);
    } else {
      res.statusCode = response.statusCode;
      res.setHeader("Content-Type", "application/json");
      res.end(body);
    }
  });
});

app.get("/ping", (req, res) => {
  res.send("Pong!");
});

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
