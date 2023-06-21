const axios = require("axios");
const xlsx = require("xlsx");
const fs = require("fs");

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

const excelFilePathWithEvidences = "./services_with_evidences.xlsx";
const excelFilePathWithoutEvidences = "./services_without_evidences.xlsx";

// Function to create or append data to an Excel file
function createExcelFile(data, excelFilePath) {
  let workbook;
  if (fs.existsSync(excelFilePath)) {
    // Load the existing workbook if the file already exists
    const existingWorkbook = xlsx.readFile(excelFilePath);
    workbook = existingWorkbook;
  } else {
    // Create a new workbook if the file doesn't exist
    workbook = xlsx.utils.book_new();
  }

  let worksheet;
  if (workbook.SheetNames.includes("Sheet1")) {
    // If "Sheet1" exists, get the reference to it
    worksheet = workbook.Sheets["Sheet1"];
  } else {
    // Otherwise, create a new worksheet with the name "Sheet1"
    worksheet = xlsx.utils.aoa_to_sheet([]);
    workbook.SheetNames.push("Sheet1");
    workbook.Sheets["Sheet1"] = worksheet;
  }

  // Append the data to the worksheet
  xlsx.utils.sheet_add_json(worksheet, data, { skipHeader: true, origin: -1 });

  // Save the updated workbook to the file
  xlsx.writeFile(workbook, excelFilePath);

  console.log("Excel file updated:", excelFilePath);
}

// Usage
(async () => {
  try {
    const response1 = await axios.get(
      "https://api.digigov.grnet.gr/v1/services?page=1&limit=8000",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );

    const allServicesWithEvidences = [];
    const allServicesWithoutEvidences = [];

    for (const service of response1.data.data) {
      console.log("service.id", service.id);
      const apiData = await fetchDataFromAPI(service.id);
      //console.log("apiData", apiData.data.metadata.process_evidences);
      if (apiData.data.metadata.process_evidences) {
        for (const evidence of apiData.data.metadata.process_evidences) {
          allServicesWithEvidences.push({
            service_id: service.id,
            ...evidence,
          });
        }
      } else {
        allServicesWithoutEvidences.push({
          service_id: service.id,
        });
      }
    }

    console.log("adding all services with evidences to an excel file");
    createExcelFile(allServicesWithEvidences, excelFilePathWithEvidences);

    console.log("adding all services without evidences to an excel file");
    createExcelFile(allServicesWithoutEvidences, excelFilePathWithoutEvidences);
  } catch (error) {
    console.error("Error:", error);
  }
})();
