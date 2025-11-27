import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchReport } from "../store/ordersSlice";
import { toast } from "react-toastify";

export default function ReportsPage() {
  const dispatch = useDispatch();

  const { reportData, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchReport());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const recentTransitions = reportData?.recentTransitions || [];
  const statusCounts = reportData?.statusCounts || [];

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        Order Reports
      </Typography>

      {loading && <Typography>Loading...</Typography>}

      {/*Status Count + Item Breakdown */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5">Order Status Counts</Typography>
        <Divider sx={{ my: 2 }} />

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Total Orders</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {statusCounts.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.totalOrders}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Paper elevation={3} sx={{ p: 0, mb: 2 }}>
        <Typography variant="h5">Recent Status Transitions</Typography>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer ID</TableCell>
                <TableCell>Sku</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Current Status</TableCell>
                <TableCell>Step</TableCell>
                <TableCell>Step Status</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Transition Time</TableCell>
                <TableCell>Shipping Method</TableCell>
                <TableCell>Shipping Address</TableCell>
                <TableCell>Tracking ID</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {recentTransitions.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.orderId}</TableCell>
                  <TableCell>{row.customerId}</TableCell>
                  <TableCell>{row.item.sku}</TableCell>
                  <TableCell>{row.item.qty}</TableCell>
                  <TableCell>{row.currentStatus}</TableCell>
                  <TableCell>{row.step}</TableCell>
                  <TableCell>{row.stepStatus}</TableCell>
                  <TableCell>{row.logMessage}</TableCell>
                  <TableCell>
                    {new Date(row.transitionTime).toLocaleString()}
                  </TableCell>
                  <TableCell>{row.shippingMethod}</TableCell>
                  <TableCell>{row.shippingAddress}</TableCell>
                  <TableCell>{row.trackingId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}
