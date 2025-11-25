import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";

export default function Navbar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="sticky" color="success" elevation={2}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Order Management System
          </Typography>
          <Button color="inherit" component={RouterLink} to="/order/create">
            Create Order
          </Button>
          <Button color="inherit" component={RouterLink} to="ag-grid">
            Order List
          </Button>
          <Button color="inherit" component={RouterLink} to="/orders">
            View Orders
          </Button>
          <Button color="inherit" component={RouterLink} to="/Report">
            View Report
          </Button>
          <Button color="inherit" component={RouterLink} to="/search">
            Search Order
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
