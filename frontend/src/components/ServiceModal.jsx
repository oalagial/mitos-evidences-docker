import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Modal,
  Typography,
} from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  closeServiceModal,
  openEvidenceModal,
} from "../features/modal/modalSlice";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useQuery } from "react-query";
import EvidenceRow from "./EvidenceRow";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { styled, TablePagination, TableSortLabel } from "@mui/material";

// This component renders a modal that displays detailed information about a selected character.
const ServiceModal = () => {
  const dispatch = useDispatch();
  const service = useSelector((state) => state.modal.shownService);
  const isServiceModalOpen = useSelector(
    (state) => state.modal.isServiceModalOpen
  );

  const {
    isLoading,
    error,
    data: service_details,
    refetch,
  } = useQuery(
    ["service", `${service?.id}`],
    () => {
      //let url = `https://api.digigov.grnet.gr/v1/services?page=${page}&limit=${pageSize}`;
      let url = `http://localhost:3003/services/${service?.id}`;

      // if (parameters.name || parameters.tvShows) {
      //   url = `https://api.disneyapi.dev/character?name=${parameters.name}&tvShows=${parameters.tvShows}`;
      // }

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
      enabled: !!service,
    }
  );

  {
    console.log("aaa3", service_details, service);
  }
  // if (service_id) {
  return (
    <Modal
      open={isServiceModalOpen}
      onClose={() => {
        dispatch(closeServiceModal({}));
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <h2>
          {service?.title.el} - {service?.id}
        </h2>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead >
              <TableRow>
                <TableCell sx={{fontWeight: 'bold'}}>No</TableCell>
                <TableCell sx={{fontWeight: 'bold'}}>Description of Evidence</TableCell>
                <TableCell sx={{fontWeight: 'bold'}}>Id (Evidence Type)</TableCell>
                <TableCell sx={{fontWeight: 'bold'}}>Title (Evidence Type)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {service_details?.data.metadata.hasOwnProperty(
                "process_evidences"
              ) ? (
                service_details?.data.metadata.process_evidences?.map(
                  (evidence) => (
                    <EvidenceRow
                      evidence={evidence}
                      key={evidence.evidence_num_id + evidence.evidence_type}
                    />

                    // <div
                    //   onClick={() =>
                    //     dispatch(openEvidenceModal(evidence.evidence_type))
                    //   }
                    // >
                    //   <span>
                    //   </span>
                    // </div>
                  )
                )
              ) : (
                <TableRow>
                  <TableCell>No Data</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Modal>
  );
  // }
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: 10,
  textAlign: "center",
  maxHeight: "80vh",
  overflow: "scroll",
};

export default ServiceModal;
