import React from "react";
import {useQuery} from "react-query";
import { format } from 'date-fns';

const CountEvidence = ({ evidence_type_id }) => {
  const {
    isLoadingEvidence_in_services,
    // error,
    data: evidence_in_services,
    // refetch,
  } = useQuery(
    ['services_for_evidence_distinct', `${evidence_type_id}`],
    () => {
      let url = `http://localhost:3003/services_for_evidence_distinct/${evidence_type_id}`;

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
      // enabled: !!shownEvidence?.evidence_type,
    }
  );

    const latestUpdatedAt = evidence_in_services?.reduce((latest, item) => {
        if (!item.updated_at) return latest;
        const itemDate = new Date(item.updated_at);
        return latest > itemDate ? latest : itemDate;
    }, new Date(0));

    return (
        <div>
            <strong>{evidence_in_services?.length}</strong>
        </div>
    );
};

export default CountEvidence;
