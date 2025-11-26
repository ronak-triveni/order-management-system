import { React, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderById } from "../store/ordersSlice";
import { useForm, Controller } from "react-hook-form";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { toast } from "react-toastify";

export default function Orders() {
  const dispatch = useDispatch();
  const { currentOrder, loading, error } = useSelector((s) => s.orders);
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (currentOrder) {
      toast.success("Data Fetched Successfully");
    }
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { orderId: "" },
  });

  const onSubmit = (data) => {
    dispatch(fetchOrderById(data.orderId));
  };

  return (
    <Paper sx={{ p: 3 }} elevation={2}>
      <Typography variant="h5">Fetch Order</Typography>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", gap: 2, alignItems: "center", mt: 2 }}
      >
        <Controller
          name="orderId"
          control={control}
          rules={{
            required: "Order ID is required",
            pattern: {
              value: /^[0-9\-]+$/,
              message: "Order ID can contain only numbers",
            },
          }}
          render={({ field }) => (
            <TextField
              type="number"
              label="Order ID"
              {...field}
              error={!!errors.orderId}
              helperText={errors.orderId?.message}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          color="success"
        >
          {loading ? "Loading..." : "Fetch"}
        </Button>
      </Box>

      {currentOrder && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Order Details</Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ mt: 3 }}>
            Customer & Order Info
          </Typography>
          <Box sx={{ mt: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f2f5" }}>
                  <th style={{ padding: 8, textAlign: "left" }}>Name</th>
                  <th style={{ padding: 8, textAlign: "left" }}>Email</th>
                  <th style={{ padding: 8, textAlign: "left" }}>Address</th>
                  <th style={{ padding: 8, textAlign: "left" }}>Status</th>
                  <th style={{ padding: 8, textAlign: "left" }}>
                    Shipping Method
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td style={{ padding: 8 }}>{currentOrder.Customer?.name}</td>

                  <td style={{ padding: 8 }}>{currentOrder.Customer?.email}</td>

                  <td style={{ padding: 8 }}>
                    {currentOrder.orderDetails?.shipping?.address}
                  </td>

                  <td style={{ padding: 8 }}>{currentOrder.status}</td>

                  <td style={{ padding: 8 }}>
                    {currentOrder.orderDetails?.shipping?.method}
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1">Items</Typography>

          <Box sx={{ mt: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f2f5" }}>
                  <th style={{ padding: 8, textAlign: "left" }}>SKU</th>
                  <th style={{ padding: 8, textAlign: "left" }}>Name</th>
                  <th style={{ padding: 8, textAlign: "center" }}>Qty</th>
                  <th style={{ padding: 8, textAlign: "right" }}>Price</th>
                  <th style={{ padding: 8, textAlign: "right" }}>Total</th>
                </tr>
              </thead>

              <tbody>
                {currentOrder.orderDetails?.items?.map((item, idx) => (
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
                      {item.qty * item.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
