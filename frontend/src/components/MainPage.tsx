import { useQuery } from "react-query";
import {Box, Button, Tab, Tabs, Typography} from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import ServicesTable from "./ServicesTable";
import EvidenceTypesTable from "./EvidenceTypesTable";
import {format} from "date-fns";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface ParametersType {
  name: string;
  // tvShows: string;
}

const MainPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const [parameters, setParameters] = useState<ParametersType>({
    name: "",
    // tvShows: "",
  });

  const {
    isLoading,
    error,
    data: evidences,
    refetch,
  } = useQuery(
    ["services", { page, pageSize, name: parameters.name }],
    () => {
      //let url = `https://api.digigov.grnet.gr/v1/services?page=${page}&limit=${pageSize}`;
      let url = `http://localhost:3003/services?page=${page}&limit=${pageSize}`;

      if (parameters.name) {
        url = `http://localhost:3003/services/search/title/${parameters.name}`;
      }

      return fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({ key1: "value1", key2: "value2" }), // set your body params here
      }).then((res) => {
        return res.json();
      });
    },
    {
      //This flag tells React Query to keep and display previous data while refetching in the background,
      // which reduces perceived latency and prevents UI flickers.
      keepPreviousData: true,
    }
  );

  const {
    isLoading: isLatestUpdateLoading,
    error: latestUpdateError,
    data: latestUpdate,
  } = useQuery(
      "latestUpdate",
      () =>
          fetch("http://localhost:3003/latest-update").then((res) =>
              res.json()
          ),
      {
        // This flag tells React Query to keep and display previous data while refetching in the background,
        // which reduces perceived latency and prevents UI flickers.
        keepPreviousData: true,
      }
  );


  useEffect(() => {
    refetch();
  }, [parameters]);

  const handleSearchButtonClicked = (parameters: ParametersType) => {
    setParameters(parameters);
  };

  const handlePageChanged = (page: number) => {
    setPage(page);
  };

  const handlePageSizeChanged = (pageSize: number) => {
    setPageSize(pageSize);
  };

  if (isLoading) return <div>'Loading...'</div>;


  const handleUpdateDataClicked = async () => {
    try {
      // Call your URL and update the data in the local database
      const response = await fetch('http://localhost:3003/update-data', {
        method: 'GET', // or 'POST' depending on your API
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update data');
      }

      // After clicked, reload the page
      window.location.reload();

      // Return the updated data or a success message
      return response.json();
    } catch (error) {
      throw error;
    }

  }


  let formattedDate = 'Not yet (refresh)';
  if (latestUpdate?.latestUpdatedAt) {
    const date = new Date(latestUpdate.latestUpdatedAt);
    formattedDate = format(date, 'dd-MM-yy hh:mm');
  }

  // if (error) return <div>'An error has occurred: ' + error.message</div>;
  return (
    <Box sx={{ width: "100%" }}>
      <div style={{display: 'flex', alignItems: 'end', justifyContent: 'end', }}>

       <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
         <Button
             variant="contained"
             onClick={handleUpdateDataClicked}
             style={{ marginTop: 8, marginRight: 14 }}
         >
           Update data (~3min)
         </Button>
         <span >
           <strong  style={{fontSize: '14px'}}>Latest update</strong>: <span style={{fontSize: '12px'}}>{formattedDate}</span>
        </span>
       </div>

      </div>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Evidence Types" {...a11yProps(0)} />
          <Tab label="Services" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <EvidenceTypesTable
          page={page}
          pageSize={pageSize}
          handlePageChanged={handlePageChanged}
          handlePageSizeChanged={handlePageSizeChanged}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box sx={{ margin: 4 }}>
          <SearchBar handleSearchButtonClicked={handleSearchButtonClicked} />
          <ServicesTable
            evidences={evidences}
            page={page}
            pageSize={pageSize}
            handlePageChanged={handlePageChanged}
            handlePageSizeChanged={handlePageSizeChanged}
          />
        </Box>
      </TabPanel>
    </Box>
  );
};

export default MainPage;
