import { createSlice } from "@reduxjs/toolkit";

// isCharacterModalOpen: a Boolean value indicating whether a character modal is currently open.
// shownCharacter: an object representing the character being shown in the modal.
//  If no character is currently being shown, this property is set to null.
const initialState = {
  isEvidenceModalOpen: false,
  shownEvidence: {evidence_type: '', evidence_type_title: ''},
  isServiceModalOpen: false,
  shownService: null,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    // "closeCharacterModal", which sets both "isCharacterModalOpen" and "shownCharacter"
    // back to their initial values (false and null, respectively).
    openEvidenceModal: (state, action) => {
      state.isEvidenceModalOpen = true;
      state.shownEvidence = action.payload;
    },
    // "closeCharacterModal", which sets both "isCharacterModalOpen" and "shownCharacter"
    // back to their initial values (false and null, respectively).
    closeEvidenceModal: (state, action) => {
      state.isEvidenceModalOpen = false;
      state.shownEvidence = null;
    },
    openServiceModal: (state, action) => {
      state.isServiceModalOpen = true;
      state.shownService = action.payload;
    },
    // "closeCharacterModal", which sets both "isCharacterModalOpen" and "shownCharacter"
    // back to their initial values (false and null, respectively).
    closeServiceModal: (state, action) => {
      state.isServiceModalOpen = false;
      state.shownService = null;
    },
  },
});

export const {
  openEvidenceModal,
  closeEvidenceModal,
  openServiceModal,
  closeServiceModal,
} = modalSlice.actions;

export default modalSlice.reducer;
