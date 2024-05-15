import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, styled, TablePagination, TableSortLabel } from "@mui/material";
import U from "../utils/utils.js";
import { useDispatch } from "react-redux";
// import { openCharacterModal } from "../features/modal/modalSlice";
import { visuallyHidden } from "@mui/utils";
import {
  openEvidenceModal,
  openServiceModal,
} from "../features/modal/modalSlice.js";
import { useQuery } from "react-query";
import CountEvidence from "./CountEvidence.jsx";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "dimgray",
    color: "gold",
    fontSize: 20,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

interface EvidenceTypesTableProps {
  page: number;
  pageSize: number;
  handlePageChanged: (arg0: number) => void;
  handlePageSizeChanged: (arg0: number) => void;
}

const EvidenceTypesTable: React.FC<EvidenceTypesTableProps> = ({
  page,
  pageSize,
  handlePageChanged,
  handlePageSizeChanged,
}) => {
  const [order, setOrder] = React.useState<string>("asc");
  const [orderBy, setOrderBy] = React.useState<string>("");
  const dispatch = useDispatch();

  const {
    isLoading: isLoadingEvidenceType,
    // error,
    data: evidence_types,
    // refetch,
  } = useQuery(
    ["evidenceType", `all`],
    () => {
      let url = `http://localhost:3003/evidence/all`;

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
      // enabled: !!evidence.evidence_type,
    }
  );

  // The handleRequestSort function is responsible for sorting a column in either ascending or
  // descending order, based on the current order and orderBy values.
  // This function takes in two params:
  // event: the click event
  // property: the new column that user want to sort by
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const createSortHandler =
    (property: string) => (event: React.MouseEvent<unknown>) => {
      handleRequestSort(event, property);
    };

  const totalPages = evidence_types?.total / evidence_types?.limit || 0;

  return (
    <Paper sx={{ width: "100%", mb: 2 }}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">No</StyledTableCell>
              <StyledTableCell align="center">
                Τίτλος (evidence_type)
              </StyledTableCell>
              <StyledTableCell align="center">
                Κωδικός (evidence_type)
              </StyledTableCell>
              <StyledTableCell align="center">
                Άθροισμα διαφορετικών evidence_description
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(evidence_types?.data) &&
            evidence_types?.data.length > 0 ? (
              U.stableSort(
                evidence_types?.data,
                U.getComparator(order, orderBy)
              )
                // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row: any, index: number) => {
                  return (
                    <StyledTableRow
                      key={row.title.el + row._id}
                      data-testid={row.title.el + row._id}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        dispatch(
                          openEvidenceModal({
                            evidence_type: row.id,
                            evidence_type_title: row.title.el,
                          })
                        )
                      }
                    >
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">{row.title.el}</TableCell>
                      <TableCell align="center">{row.id}</TableCell>
                      <TableCell align="center">
                        <CountEvidence evidence_type_id={row.id} />
                      </TableCell>
                    </StyledTableRow>
                  );
                })
            ) : (
              <StyledTableRow>
                <TableCell>No Data</TableCell>
              </StyledTableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/*<TablePagination*/}
      {/*    rowsPerPageOptions={[10, 20, 50, 100, 200, 500]}*/}
      {/*    count={pageSize * totalPages}*/}
      {/*    page={page - 1}*/}
      {/*    rowsPerPage={pageSize}*/}
      {/*    onPageChange={(e, page) => handlePageChanged(page + 1)}*/}
      {/*    onRowsPerPageChange={(e) => {*/}
      {/*        handlePageChanged(1);*/}
      {/*        handlePageSizeChanged(Number(e.target.value));*/}
      {/*    }}*/}
      {/*/>*/}
    </Paper>
  );
};

export default EvidenceTypesTable;
