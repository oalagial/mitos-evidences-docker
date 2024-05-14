const axios = require("axios");
const { Pool } = require("pg");

// Create a pool object to manage database connections
const pool = new Pool({
    user: "postgres",
    host: "localhost", // TODO: change this to db for Docker (was localhost)
    database: "mitos-evidences", // changed this to postgres
    password: "1997.tria", // TODO: change this to mitos-password for Docker
});

async function createTable() {
    // SQL query to create a table
    const createServicesTableQuery = `
  DROP TABLE IF EXISTS services CASCADE;
  CREATE TABLE services (
    service_id INT PRIMARY KEY,
    service_title VARCHAR (400),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

    const createEvidencesTableQuery = `
  DROP TABLE IF EXISTS evidences CASCADE;
  CREATE TABLE evidences (
    evidence_id INT PRIMARY KEY,
    evidence_title VARCHAR (400),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

    const createServiceEvidencesTableQuery = `
  DROP TABLE IF EXISTS service_evidences CASCADE;
  CREATE TABLE service_evidences (
    id SERIAL PRIMARY KEY,
    service_id INT,
    evidence_id INT,
    evidence_description VARCHAR (40000),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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


createTable()
    .catch(error => console.error('Error:', error))
 //   .finally(() => pool.end());

// Function to fetch data from the API
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


// Usage
(async () => {

    try {
        const responseEvidences = await axios.get(
            "https://api.digigov.grnet.gr/v1/registries/evidence/all",
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
            }
        );

        for (const evidence of responseEvidences.data.data) {
            // const apiData = await fetchDataFromAPI(evidence.id);
            console.log("evidence_id", evidence.id);
            console.log("evidence_title", evidence.title.el);

            const insertEvidenceQuery = `INSERT INTO evidences (evidence_id, evidence_title, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)`;
            try {
                await pool.query(insertEvidenceQuery, [evidence?.id, evidence?.title?.el]);
                console.log('Data inserted into "evidences" table.');
            } catch (error) {
                console.error('Error inserting data:', error);
            }
            // For creating Excel files, call the function here if needed.
            // Example: createExcelFile(apiData.data.metadata, `./${service.id}.xlsx`, service.id);
        }



        const responseServices = await axios.get(
            "https://api.digigov.grnet.gr/v1/services?page=1&limit=10000",
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
            }
        );

        for (const service of responseServices.data.data) {
            const apiData = await fetchDataFromAPI(service.id);
             console.log("service_id", service?.id);
            // console.log("service_title", apiData.data.metadata.process.official_title);

            const insertServiceQuery = `INSERT INTO services (service_id, service_title, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)`;
            try {
                await pool.query(insertServiceQuery, [service?.id, service?.title?.el]);
                console.log('Data inserted into "services" table.');
            } catch (error) {
                console.error('Error inserting data:', error);
            }
            if(apiData.data.metadata.process_evidences) {
                for(const evidence of apiData.data.metadata.process_evidences) {
                    const insertServiceEvidencesQuery = `INSERT INTO service_evidences (service_id, evidence_id, evidence_description, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`;
                    try {
                        await pool.query(insertServiceEvidencesQuery, [service?.id, evidence.evidence_type, evidence.evidence_description]);
                        console.log('Data inserted into "service_evidences" table.');
                    } catch (error) {
                        console.error('Error inserting data:', error);
                    }
                }
            }

            // For creating Excel files, call the function here if needed.
            // Example: createExcelFile(apiData.data.metadata, `./${service.id}.xlsx`, service.id);
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        // Close the pool after all database operations are completed
        console.log("FINAL")
        pool.end();
    }
})();
