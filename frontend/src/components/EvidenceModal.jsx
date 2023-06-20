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
import React, { useState } from "react";
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

// This component renders a modal that displays detailed information about a selected character.
const EvidenceModal = () => {
  const dispatch = useDispatch();
  const shownEvidence = useSelector((state) => state.modal.shownEvidence);
  const isEvidenceModalOpen = useSelector(
    (state) => state.modal.isEvidenceModalOpen
  );
  const [showClustered, setShowClustered] = useState(false);

  // const {
  //   isLoading,
  //   error,
  //   data: evidence,
  //   refetch,
  // } = useQuery(
  //   ["evidence", `${shownEvidence?.evidence_type}`],
  //   () => {
  //     let url = `http://localhost:3003/evidence/${shownEvidence?.evidence_type}`;
  //     return fetch(url, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       // body: JSON.stringify({ key1: "value1", key2: "value2" }), // set your body params here
  //     }).then((res) => {
  //       return res.json();
  //     });
  //   },
  //   {
  //     //This flag tells React Query to keep and display previous data while refetching in the background,
  //     // which reduces perceived latency and prevents UI flickers.
  //     keepPreviousData: true,
  //     enabled: !!shownEvidence?.evidence_type,
  //   }
  // );

  const {
    isLoadingEvidence_in_services,
    // error,
    data: evidence_in_services,
    // refetch,
  } = useQuery(
    [
      `${showClustered ? "editted_" : ""}evidence_in_services`,
      `${shownEvidence?.evidence_type}`,
    ],
    () => {
      let url = `http://localhost:3003/${
        showClustered ? "editted_" : ""
      }services_for_evidence_distinct/${shownEvidence?.evidence_type}`;

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
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

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
          <Button
            variant="contained"
            onClick={() => setShowClustered((old) => !old)}
          >
            {showClustered ? "Show original data" : "Show clustered data"}
          </Button>
          <h2>
            {shownEvidence?.evidence_type} -{" "}
            {shownEvidence?.evidence_type_title}
          </h2>
          <h3>
            {showClustered
              ? "Clustered data (with OpenRefine)"
              : "Original data"}
          </h3>
          <h4>({evidence_in_services?.length})</h4>
          {/* <h4>{evidence?.data.title.el}</h4> */}
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Service Id</TableCell>
                  <TableCell>Description of Evidence</TableCell>
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
                    key={index}
                  />
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[
                      5, 10, 25,
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
            onClick={() => {
              dispatch(closeEvidenceModal({}));
            }}
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
