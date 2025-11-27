import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchOrders } from "../store/ordersSlice";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { toast } from "react-toastify";

export default function Search() {
  const [input, setInput] = useState("");
  const dispatch = useDispatch();

  const { searchResults, loading, error } = useSelector((s) => s.orders);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const doSearch = () => {
    if (!input.trim()) {
      toast.warning("Enter search text before searching");
      return;
    }
    dispatch(searchOrders({ input, page: 1, size: 20 }));
  };

  return (
    <Paper sx={{ p: 3 }} elevation={2}>
      <Typography variant="h5">Search Orders</Typography>

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <TextField
          fullWidth
          label="Search by customer name, orderId, item name or status"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={doSearch}
          disabled={loading}
          color="success"
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </Box>

      {searchResults && searchResults.results && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Results</Typography>
          <Divider sx={{ my: 2 }} />

          <List>
            {searchResults.results.map((r, i) => {
              const source = r._source || r;

              const orderId = source.orderId || r._id;
              const customer = {
                name: source.customerName || "N/A",
              };

              const items = source.items || [];

              return (
                <ListItem
                  key={i}
                  sx={{
                    mb: 3,
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    display: "block",
                    p: 2,
                  }}
                >
                  {/* ORDER SUMMARY TABLE */}
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Order Summary
                  </Typography>

                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f0f2f5" }}>
                        <th style={{ padding: 4, textAlign: "left" }}>
                          Order ID
                        </th>
                        <th style={{ padding: 8, textAlign: "left" }}>Name</th>
                        <th style={{ padding: 8, textAlign: "left" }}>
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td style={{ padding: 8 }}>{orderId}</td>
                        <td style={{ padding: 8 }}>{customer.name}</td>
                        <td style={{ padding: 8 }}>{source.status}</td>
                      </tr>
                    </tbody>
                  </table>

                  <Divider sx={{ my: 2 }} />

                  {/* ITEMS TABLE */}
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Items
                  </Typography>

                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f0f2f5" }}>
                        <th style={{ padding: 8, textAlign: "left" }}>SKU</th>
                        <th style={{ padding: 8, textAlign: "left" }}>Name</th>
                        <th style={{ padding: 8, textAlign: "center" }}>Qty</th>
                        <th style={{ padding: 8, textAlign: "right" }}>
                          Price
                        </th>
                        <th style={{ padding: 8, textAlign: "right" }}>
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: 8 }}>{item.sku}</td>
                          <td style={{ padding: 8 }}>{item.name}</td>
                          <td style={{ padding: 8, textAlign: "center" }}>
                            {item.qty}
                          </td>
                          <td style={{ padding: 8, textAlign: "right" }}>
                            {item.price}
                          </td>
                          <td style={{ padding: 8, textAlign: "right" }}>
                            {item.qty * Number(item.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </Paper>
  );
}
