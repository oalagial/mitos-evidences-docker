import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Modal,
  TableFooter,
  TablePagination,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeEvidenceModal } from "../features/modal/modalSlice";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useQuery } from "react-query";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import EvidenceRow from "./EvidenceRow";
import ServiceWithEvidenceRow from "./ServiceWithEvidenceRow";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import axios from "axios";

// This component renders a modal that displays detailed information about a selected character.
const EvidenceModal = () => {
  const dispatch = useDispatch();
  const shownEvidence = useSelector((state) => state.modal.shownEvidence);
  const isEvidenceModalOpen = useSelector(
    (state) => state.modal.isEvidenceModalOpen
  );
  const [optionToShow, setOptionToShow] = useState("original");

  useEffect(() => {
    setOptionToShow("original");
  }, [shownEvidence]);
  //
  // const keyPressedListener = useCallback(
  //     (e) => {
  //       makeSomething();
  //
  //       if (idOfVesselInAddMode !== null) {
  //         if (e.key === 'Escape') {
  //           cancelAddMode(idOfVesselInAddMode);
  //         }
  //         if (e.key === 'Backspace' || e.key === 'Delete') {
  //           removeVessel(idOfVesselInAddMode, null, vesselsState);
  //         }
  //         if (e.key === 'u') {
  //           handlePinUnpinVessel(idOfVesselInAddMode, false);
  //           cancelAddMode(idOfVesselInAddMode);
  //         }
  //         if (e.key === 'p') {
  //           handlePinUnpinVessel(idOfVesselInAddMode, true);
  //           cancelAddMode(idOfVesselInAddMode);
  //         }
  //       }
  //     },
  //     [idOfVesselInAddMode, vesselsState, cancelAddMode],
  // );

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3003/export/${shownEvidence?.evidence_type}`,
        {
          responseType: "blob", // Set the response type to 'blob'
        }
      );

      // Create a temporary download link
      const downloadUrl = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `${shownEvidence?.evidence_type}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  let prep_url;

  switch (optionToShow) {
    case "original":
      prep_url = "services_for_evidence_distinct";
      break;
    case "clustered":
      prep_url = "editted_services_for_evidence_distinct";
      break;
    case "clustered_v2":
      prep_url = "editted_v2_services_for_evidence_distinct";
      break;
    default:
      console.log(`Sorry, we are out of ${optionToShow}.`);
  }

  const {
    isLoadingEvidence_in_services,
    // error,
    data: evidence_in_services,
    // refetch,
  } = useQuery(
    [prep_url, `${shownEvidence?.evidence_type}`],
    () => {
      let url = `http://localhost:3003/${prep_url}/${shownEvidence?.evidence_type}`;

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
      enabled: !!shownEvidence?.evidence_type,
    }
  );

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(50);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - evidence_in_services?.length)
      : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!isEvidenceModalOpen) {
    return null;
  }

  return (
    <Modal
      open={isEvidenceModalOpen}
      onClose={() => {
        dispatch(closeEvidenceModal({}));
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <div>
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(1, 300px)",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              onClick={() => setOptionToShow("original")}
            >
              Show original data
            </Button>
            {/* <Button
              variant="contained"
              onClick={() => setOptionToShow("clustered")}
            >
              Show clusted data
            </Button>
            <Button
              variant="contained"
              onClick={() => setOptionToShow("clustered_v2")}
            >
              Show clusted data V2
            </Button> */}
          </Box>

          <h2>
            {shownEvidence?.evidence_type} -{" "}
            {shownEvidence?.evidence_type_title}
          </h2>
          <h3>
            {(() => {
              switch (optionToShow) {
                case "original":
                  return "Original data";
                case "clustered":
                  return "Clustered data (with OpenRefine)";
                case "clustered_v2":
                  return "Clusted data v2 (with manual+openRefine)";
                default:
                  return "";
              }
            })()}
          </h3>
          <div>
            <span>Count of different evidende_descriptions: </span>
            <span style={{ fontWeight: "bold" }}>
              {evidence_in_services?.length}
            </span>
          </div>
          {/* <h4>{evidence?.data.title.el}</h4> */}
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  {/* <TableCell>Index</TableCell> */}
                  <TableCell>Description of Evidence</TableCell>
                  <TableCell>Service using this evidence_description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? evidence_in_services?.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                  : evidence_in_services
                )?.map((item, index) => (
                  <ServiceWithEvidenceRow
                    service_id={item.service_id}
                    evidence_description={item.evidence_description}
                    service_ids={item.service_ids}
                    key={index}
                    index={index}
                  />
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[
                      50, 100, 150,
                      // { label: "All", value: -1 },
                    ]}
                    colSpan={3}
                    count={evidence_in_services?.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      inputProps: {
                        "aria-label": "rows per page",
                      },
                      native: true,
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          <Button
            variant="contained"
            onClick={handleDownload}
            style={{ marginTop: 8, marginRight: 14 }}
          >
            Export
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              dispatch(closeEvidenceModal({}));
            }}
            style={{ marginTop: 8 }}
          >
            Return to list
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: 10,
  textAlign: "center",
  maxHeight: "80vh",
  overflow: "scroll",
};

export default EvidenceModal;
