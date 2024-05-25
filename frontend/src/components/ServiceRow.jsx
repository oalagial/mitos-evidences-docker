// @flow
import * as React from "react";
import { useQuery } from "react-query";
import { openServiceModal } from "../features/modal/modalSlice";
import TableCell from "@mui/material/TableCell";
import { styled } from "@mui/material";
import TableRow from "@mui/material/TableRow";
import { useDispatch } from "react-redux";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

type Props = {};

const ServiceRow = ({ service }) => {
  const dispatch = useDispatch();

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

  return (
    <StyledTableRow
      key={service.title.el + service._id}
      data-testid={service.title.el + service._id}
      style={{ cursor: "pointer" }}
      onClick={() => dispatch(openServiceModal(service))}
    >
      <TableCell align="center">{service.title.el}</TableCell>
      <TableCell align="center">{service.id}</TableCell>
      <TableCell align="center">
        {service_details?.data?.metadata?.process_evidences?.length || 0}
      </TableCell>
    </StyledTableRow>
  );
};

export default ServiceRow;
