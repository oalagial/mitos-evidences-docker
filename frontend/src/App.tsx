import React from "react";
import logo from "./logo.svg";
import "./App.css";
import MainPage from "./components/MainPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import Header from "./components/Header";
import ServiceModal from "./components/ServiceModal";
import EvidenceModal from "./components/EvidenceModal";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app code here */}
      <ServiceModal />
      <EvidenceModal />
      <Header />
      <ReactQueryDevtools initialIsOpen />
      <MainPage />
    </QueryClientProvider>
  );
}
export default App;
