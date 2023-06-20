import React from 'react';
import TableRow from "@mui/material/TableRow";
import {openEvidenceModal} from "../features/modal/modalSlice";
import TableCell from "@mui/material/TableCell";

interface ServiceWithEvidenceRowProps {
    service_id: number,
    evidence_description: string
}
const ServiceWithEvidenceRow = ({service_id, evidence_description}: ServiceWithEvidenceRowProps) => {
    return (
        <TableRow
            key={service_id}
        >
            <TableCell>{service_id}</TableCell>
            <TableCell>{evidence_description}</TableCell>
        </TableRow>
    );
};

export default ServiceWithEvidenceRow;