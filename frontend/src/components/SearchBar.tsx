import { Button, TextField } from "@mui/material";
import React, { useState } from "react";
import styled from "styled-components";

const SearchBarContainer = styled.div`
  color: darkslategray;
  background-color: aliceblue;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
`;
interface SearchTerms {
  name: string;
  // tvShows: string;
}

interface SearchBarProps {
  handleSearchButtonClicked: (searchTerms: SearchTerms) => void;
}

// This component is a Search Bar for filtering based on name and TV show.
const SearchBar: React.FC<SearchBarProps> = ({ handleSearchButtonClicked }) => {
  // const [filterTvShow, setFilterTvShow] = useState("");
  const [filterName, setFilterName] = useState("");

  return (
    <SearchBarContainer>
      <div style={{ width: "40%", display: "flex" }}>
        <TextField
          label="Search by Name"
          data-testid="name-input"
          variant="outlined"
          onChange={(e) => {
            // Update filterName state when user types into the name search field
            setFilterName(e.target.value);
          }}
          sx={{ flexGrow: 1, marginLeft: "10px" }}
        />
        {/* <TextField
          label="Search by TV Show"
          data-testid="tvShow-input"
          variant="outlined"
          onChange={(e) => {
            // Update filterTvShow state when user types into the TV show search field
            setFilterTvShow(e.target.value);
          }}
          sx={{ flexGrow: 1, marginLeft: "10px" }}
        /> */}
      </div>
      {/* Button that triggers handleSearchButtonClicked function with current filterName and filterTvShow values */}
      <Button
        variant="contained"
        onClick={() => handleSearchButtonClicked({ name: filterName })}
      >
        Search
      </Button>
    </SearchBarContainer>
  );
};

export default SearchBar;
