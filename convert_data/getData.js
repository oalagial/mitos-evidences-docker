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

function createExcelFile(data, excelFilePath, service_id) {
  const convertArraysToStrings = (obj) => {
    const newObj = {};
    for (let key in obj) {
      if (Array.isArray(obj[key])) {
        // newObj[key] = obj[key]
        //   .map((item, index) => `${index + 1}) ${item}`)
        //   .join(" ");
        // console.log("", obj[key].length);
        if (obj[key].length > 1) {
          newObj[key] = obj[key]
            .map((item, index) => `${index + 1}) ${item}`)
            .join(" ");
        } else {
          newObj[key] = obj[key].map((item, index) => `${item}`).join(" ");
        }
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  };

  let workbook;
  if (fs.existsSync(excelFilePath)) {
    // Load the existing workbook if the file already exists
    workbook = xlsx.readFile(excelFilePath);
  } else {
    // Create a new workbook if the file doesn't exist
    workbook = xlsx.utils.book_new();
  }

  const worksheetName = "Data";
  let worksheet = workbook.Sheets[worksheetName];
  if (!worksheet) {
    // Create a new worksheet if it doesn't exist
    worksheet = xlsx.utils.json_to_sheet([]);
    workbook.SheetNames.push(worksheetName);
    workbook.Sheets[worksheetName] = worksheet;
  }

  const currentRowIndex = worksheet["!ref"]
    ? xlsx.utils.decode_range(worksheet["!ref"]).e.r + 1
    : 0;
  const jsonData = xlsx.utils.sheet_to_json(worksheet);

  // Convert the object or array data to an array and apply conversions
  const dataArray = Array.isArray(data)
    ? data.map(convertArraysToStrings)
    : [convertArraysToStrings(data)];

  // Add service_id as the first column in the data array
  const updatedData = dataArray.map((item) => ({
    service_id: service_id,
    ...item,
  }));

  // Append the new data to the existing data
  const finalData = jsonData.concat(updatedData);

  // Convert the updated data to worksheet format
  const updatedWorksheet = xlsx.utils.json_to_sheet(finalData);

  // Update the worksheet in the workbook
  workbook.Sheets[worksheetName] = updatedWorksheet;

  // Write the workbook to a file
  xlsx.writeFile(workbook, excelFilePath);
  //console.log("Data appended to", excelFilePath);
}

// Usage
(async () => {
  try {
    const response1 = await axios.get(
      "https://api.digigov.grnet.gr/v1/services?page=1&limit=10000",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );

    for (const service of response1.data.data) {
      console.log("service.id", service.id);
      const apiData = await fetchDataFromAPI(service.id);
      //console.log("apiData", apiData.data.metadata.process_evidences);

      for (const [key, value] of Object.entries(apiData.data.metadata)) {
        // console.log("file:", "key:", key, "value:", value);
        // console.log(key);

        createExcelFile(value, `./${key}.xlsx`, service.id);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
})();
