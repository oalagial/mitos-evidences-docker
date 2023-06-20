import React from "react";
import { useQuery } from "react-query";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useDispatch } from "react-redux";
import { openEvidenceModal } from "../features/modal/modalSlice";

interface Evidence {
  evidence_type: number;
  evidence_num_id: number;
  evidence_description: string;
}

interface EvidenceRowProps {
  evidence: Evidence;
}

const EvidenceRow = ({ evidence }: EvidenceRowProps) => {
  const dispatch = useDispatch();

  const {
    isLoading: isLoadingEvidenceType,
    // error,
    data: data_of_evidence_type,
    // refetch,
  } = useQuery(
    ["evidenceType", `${evidence.evidence_type}`],
    () => {
      let url = `http://localhost:3003/evidence/${evidence.evidence_type}`;

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
      enabled: !!evidence.evidence_type,
    }
  );

  if (isLoadingEvidenceType) {
    return <div>Loading...</div>;
  }

  if (evidence) {
    return (
      <TableRow
        onClick={() =>
          dispatch(
            openEvidenceModal({
              evidence_type: evidence.evidence_type,
              evidence_type_title: data_of_evidence_type.data.title.el,
            })
          )
        }
        key={evidence.evidence_type}
      >
        <TableCell>{evidence.evidence_num_id}</TableCell>
        <TableCell>{evidence.evidence_description}</TableCell>
        <TableCell>{evidence.evidence_type}</TableCell>
        <TableCell>{data_of_evidence_type.data.title.el}</TableCell>
      </TableRow>
    );
  }
};

export default EvidenceRow;
