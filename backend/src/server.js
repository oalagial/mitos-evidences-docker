const http = require("http");
const request = require("request");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const xlsx = require("xlsx");
const fs = require("fs");
const axios = require("axios");
let pLimit;

// Dynamically import p-limit
import('p-limit').then((module) => {
  pLimit = module.default;
}).catch((error) => {
  console.error('Error importing p-limit:', error);
});

const app = express();
const hostname = "0.0.0.0";
const port = 3003;

app.use(cors());

// Create a pool object to manage database connections
const pool = new Pool({
  user: "postgres",
  host: "localhost", //TODO: change this to db for docker (was localhost)
  database: "mitos-evidences", // services_database
  password: "1997.tria", //TODO: change this to mitos-password for docker
    port: 5432, // TODO: comment this for docker
});

// Function to create or append data to an Excel file
function createExcelFile(data, excelFilePath, sheetName) {
  let workbook;
  if (fs.existsSync(excelFilePath)) {
    const existingWorkbook = xlsx.readFile(excelFilePath);
    workbook = existingWorkbook;
  } else {
    workbook = xlsx.utils.book_new();
  }

  let worksheet;
  if (workbook.SheetNames.includes(sheetName)) {
    worksheet = workbook.Sheets[sheetName];

    // Clear the existing content from the worksheet
    xlsx.utils.sheet_add_aoa(worksheet, [], { origin: -1 });
  } else {
    worksheet = xlsx.utils.aoa_to_sheet([]);
    workbook.SheetNames.push(sheetName);
    workbook.Sheets[sheetName] = worksheet;
  }

  xlsx.utils.sheet_add_json(worksheet, data, { skipHeader: true, origin: -1 });

  xlsx.writeFile(workbook, excelFilePath);

  console.log("Excel file updated:", excelFilePath);
}

const tempDir = "./temp_excel_files"; // Path to temporary directory

// Ensure the temporary directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

app.get("/export/:evidence_id", async (req, res) => {
  const evidence_id = req.params.evidence_id;
  const sqlQuery = `SELECT se.evidence_description, se.service_id, se.evidence_id, se.updated_at
    FROM services s
    INNER JOIN service_evidences se ON se.service_id = s.service_id
    WHERE se.evidence_id = ${evidence_id};`;

  try {
    const result = await new Promise((resolve, reject) => {
      pool.query(sqlQuery, (err, result) => {
        if (err) {
          console.error(evidence_id, err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    const excelFilePathWithEvidences = `${tempDir}/services_with_evidences_${evidence_id}.xlsx`;
    const allServicesWithEvidences = [];

    for (const service of result.rows) {
      allServicesWithEvidences.push({
        service_id: service.service_id,
        evidence_id: service.evidence_id,
        evidence_description: service.evidence_description,
      });
    }

    await createExcelFile(
      allServicesWithEvidences,
      excelFilePathWithEvidences,
      evidence_id
    );

    const fileData = fs.readFileSync(excelFilePathWithEvidences);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=file_${evidence_id}.xlsx`
    );

    res.send(fileData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating or sending the Excel file.");
  }
});

// DISTINCT
app.get("/services_for_evidence_distinct/:evidence_id", (req, res) => {
  // Write your SQL query as a string
  const evidence_id = req.params.evidence_id;

  // const sqlQuery = `SELECT  DISTINCT se.evidence_description, se.service_id
  //   FROM services s
  //   INNER JOIN service_evidences se ON se.service_id = s.service_id
  //   WHERE se.evidence_id = ${evidence_id};`;

  const sqlQuery = `
    SELECT se.evidence_description, STRING_AGG(se.service_id::TEXT, ',') AS service_ids, MAX(se.updated_at) AS updated_at
    FROM services s
    INNER JOIN service_evidences se ON se.service_id = s.service_id
    WHERE se.evidence_id = ${evidence_id}
    GROUP BY se.evidence_description;`;

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

  // const sqlQuery = `SELECT  DISTINCT se.evidence_description
  //   FROM services s
  //   INNER JOIN clustered_evidences se ON se.service_id = s.service_id
  //   WHERE se.evidence_id = ${evidence_id};`;

  const sqlQuery = `SELECT  DISTINCT evidence_description
    FROM clustered_evidences
    WHERE evidence_id = ${evidence_id};`;

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

app.get(
  "/editted_v2_services_for_evidence_distinct/:evidence_id",
  (req, res) => {
    // Write your SQL query as a string
    const evidence_id = req.params.evidence_id;

    // const sqlQuery = `SELECT  DISTINCT se.evidence_description
    //   FROM services s
    //   INNER JOIN clustered_evidences se ON se.service_id = s.service_id
    //   WHERE se.evidence_id = ${evidence_id};`;

    const sqlQuery = `SELECT  DISTINCT evidence_description
    FROM clustered_evidences_v2
    WHERE evidence_id = ${evidence_id};`;

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
  }
);

// Define a route to execute a sample query
app.get("/services_for_evidence/:evidence_id", (req, res) => {
  // Write your SQL query as a string
  const evidence_id = req.params.evidence_id;

  const sqlQuery = `SELECT s.service_id, se.evidence_id, se.evidence_description, se.updated_at
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
    INNER JOIN clustered_evidences se ON se.service_id = s.service_id
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

app.get('/update-data', (req, res) => {
  setImmediate(async () => {
    try {
      await createTable(); // Create database tables
      await updateDataFromAPI(); // Fetch data from external APIs and insert into the database
    } catch (error) {
      console.error('Error updating data:', error);
    }
  });
  res.json({ message: 'Data update started' });
});

// Function to create database tables
async function createTable() {
  // SQL query to create a table
  const createServicesTableQuery = `
  DROP TABLE IF EXISTS services CASCADE;
  CREATE TABLE services (
    service_id INT PRIMARY KEY,
    service_title VARCHAR (2000),
    updated_at TIMESTAMP
  )
`;

  const createEvidencesTableQuery = `
  DROP TABLE IF EXISTS evidences CASCADE;
  CREATE TABLE evidences (
    evidence_id INT PRIMARY KEY,
    evidence_title VARCHAR (1000),
    updated_at TIMESTAMP
  )
`;

  const createServiceEvidencesTableQuery = `
  DROP TABLE IF EXISTS service_evidences CASCADE;
  CREATE TABLE service_evidences (
    id SERIAL PRIMARY KEY,
    service_id INT,
    evidence_id INT,
    evidence_description VARCHAR (4000),
    updated_at TIMESTAMP

  )
`;



  const client = await pool.connect();
  try {
    await client.query(createServicesTableQuery);
    console.log('Table "services" created successfully.');
    await client.query(createEvidencesTableQuery);
    console.log('Table "evidences" created successfully.');
    await client.query(createServiceEvidencesTableQuery);
    console.log('Table "evidences" created successfully.');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    client.release();
  }
}
// Function to fetch data from APIs and update the database

async function fetchDataFromAPI(serviceId) {
  try {
    const response = await axios.get(
        `https://api.digigov.grnet.gr/v1/services/${serviceId}`,
        {
          headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching data from API:", error);
    throw error;
  }
}


// Function to fetch data from APIs and update the database

async function updateDataFromAPI() {
  try {
    const limit = pLimit(10); // Limit to 10 concurrent tasks

    const responseEvidences = await axios.get(
        "https://api.digigov.grnet.gr/v1/registries/evidence/all",
        {
          headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
    );

    console.log('responseEvidences', responseEvidences.data.data.length)

    const evidenceInserts = responseEvidences.data.data.map((evidence) => {
      return limit(() => pool.query(
          `INSERT INTO evidences (evidence_id, evidence_title, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
          [evidence?.id, evidence?.title?.el]
      ));
    });

    console.log('evidenceInserts', evidenceInserts.length)

    await Promise.all(evidenceInserts);

    const responseServices = await axios.get(
        "https://api.digigov.grnet.gr/v1/services?page=1&limit=10000",
        {
          headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
    );

    console.log('responseServices', responseServices.data.data.length)

      const serviceInserts = responseServices.data.data.map(async (service) => {
        const apiData = await limit(() => fetchDataFromAPI(service.id));

        const serviceInsert = limit(() => pool.query(
            `INSERT INTO services (service_id, service_title, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
            [service?.id, service?.title?.el]
        ));

        const evidenceInserts = apiData.data.metadata.process_evidences ? apiData.data.metadata.process_evidences.map(
            (evidence) => {
              return limit(() => pool.query(
                  `INSERT INTO service_evidences (service_id, evidence_id, evidence_description, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
                  [service?.id, evidence.evidence_type, evidence.evidence_description]
              ));
            }
        ) : [];

        console.log('serviceInsert', serviceInsert)
        return Promise.all([serviceInsert, ...evidenceInserts]);
      });
      await Promise.all(serviceInserts);
      console.log('finished')

  } catch (error) {
    console.error("Error fetching and updating data from API:", error);
    throw error;
  }
}

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
