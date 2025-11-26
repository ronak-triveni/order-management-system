import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Orders from "./pages/Orders";
import CreateOrder from "./pages/CreateOrders";
import Search from "./pages/Search";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import GenerateReport from "./pages/GenerateReport";
import OrdersGrid from "./pages/OrdersGrid";
import { ToastContainer, toast } from "react-toastify";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Box component="main" sx={{ minHeight: "calc(100vh - 64px)", py: 4 }}>
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<Orders />} />
            <Route path="/report" element={<GenerateReport />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order/create" element={<CreateOrder />} />
            <Route path="/search" element={<Search />} />
            <Route path="/ag-grid" element={<OrdersGrid />} />
          </Routes>
        </Container>
      </Box>
      <ToastContainer position="top-right" autoClose={1000} />
    </BrowserRouter>
  );
}
