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
import { openServiceModal } from "../features/modal/modalSlice.js";
import ServiceRow from "./ServiceRow";

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

interface ServicesTableProps {
  evidences: any;
  page: number;
  pageSize: number;
  handlePageChanged: (arg0: number) => void;
  handlePageSizeChanged: (arg0: number) => void;
}

const ServicesTable: React.FC<ServicesTableProps> = ({
  evidences,
  page,
  pageSize,
  handlePageChanged,
  handlePageSizeChanged,
}) => {
  const [order, setOrder] = React.useState<string>("asc");
  const [orderBy, setOrderBy] = React.useState<string>("");
  const dispatch = useDispatch();

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

  const totalPages = evidences.total / evidences.limit || 0;

  return (
    <Paper sx={{ width: "100%", mb: 2 }}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {/* <StyledTableCell
                key="name"
                align="center"
                sortDirection={orderBy === "name" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={createSortHandler("name")}
                >
                  Name
                  {orderBy === "name" ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === "desc"
                        ? "sorted descending"
                        : "sorted ascending"}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </StyledTableCell> */}
              <StyledTableCell align="center">Name of Service</StyledTableCell>
              <StyledTableCell align="center">Id of Service</StyledTableCell>
              <StyledTableCell align="center">
                Count of Evidences
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(evidences.data) && evidences.data.length > 0 ? (
              U.stableSort(evidences.data, U.getComparator(order, orderBy))
                // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row: any, index: number) => {
                  return <ServiceRow service={row} />;
                })
            ) : (
              <StyledTableRow>
                <TableCell>No Data</TableCell>
              </StyledTableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 50, 100, 200, 500]}
        count={pageSize * totalPages}
        page={page - 1}
        rowsPerPage={pageSize}
        onPageChange={(e, page) => handlePageChanged(page + 1)}
        onRowsPerPageChange={(e) => {
          handlePageChanged(1);
          handlePageSizeChanged(Number(e.target.value));
        }}
      />
    </Paper>
  );
};

export default ServicesTable;
