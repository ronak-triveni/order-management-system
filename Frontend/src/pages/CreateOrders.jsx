import React, { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { createOrder, clearCreateResult } from "../store/ordersSlice";

import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuItem from "@mui/material/MenuItem";

export default function CreateOrders() {
  const dispatch = useDispatch();
  const { creating, createResult } = useSelector((s) => s.orders);

  const generateTrackingId = () =>
    "TRK-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      customer: { name: "", email: "", phone: "" },

      items: [{ sku: "", name: "", qty: 1, price: 0 }],

      shipping: {
        method: "",
        address: "",
        tracking: "",
      },

      extra: {},
    },
  });

  useEffect(() => {
    setValue("shipping.tracking", generateTrackingId());
  }, [setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data) => {
    data.shipping.tracking = generateTrackingId();
    await dispatch(createOrder(data));
    reset();
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create Order
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {/* CUSTOMER */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Customer</Typography>

            <Controller
              name="customer.name"
              control={control}
              render={({ field }) => (
                <TextField fullWidth label="Name" margin="normal" {...field} />
              )}
            />

            <Controller
              name="customer.email"
              control={control}
              render={({ field }) => (
                <TextField fullWidth label="Email" margin="normal" {...field} />
              )}
            />

            <Controller
              name="customer.phone"
              control={control}
              render={({ field }) => (
                <TextField fullWidth label="Phone" margin="normal" {...field} />
              )}
            />
          </Grid>

          {/* SHIPPING */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Shipping</Typography>

            {/* Shipping Method - Dropdown */}
            <Controller
              name="shipping.method"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  label="Shipping Method"
                  margin="normal"
                  {...field}
                >
                  {["Standard", "Express", "Same-Day"].map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Address - normal input (NOT dropdown) */}
            <Controller
              name="shipping.address"
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  label="Address"
                  margin="normal"
                  {...field}
                />
              )}
            />
          </Grid>

          {/* ITEMS */}
          <Grid item xs={12}>
            <Typography variant="subtitle1">Items</Typography>

            {fields.map((f, idx) => (
              <Grid container spacing={1} key={f.id} alignItems="center">
                <Grid item xs={6} md={3}>
                  <Controller
                    name={`items.${idx}.sku`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        label="SKU"
                        margin="normal"
                        {...field}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <Controller
                    name={`items.${idx}.name`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        label="Item Name"
                        margin="normal"
                        {...field}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={6} md={2}>
                  <Controller
                    name={`items.${idx}.qty`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        type="number"
                        label="Qty"
                        margin="normal"
                        {...field}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={6} md={2}>
                  <Controller
                    name={`items.${idx}.price`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        type="number"
                        label="Price"
                        margin="normal"
                        {...field}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <IconButton
                    color="error"
                    onClick={() => remove(idx)}
                    sx={{ mt: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              variant="outlined"
              onClick={() => append({ sku: "", name: "", qty: 1, price: 0 })}
            >
              Add Item
            </Button>
          </Grid>

          {/* SUBMIT */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={creating}
              color="success"
            >
              {creating ? "Creating..." : "Create Order"}
            </Button>

            {createResult && (
              <Box component="span" sx={{ ml: 2, color: "success.main" }}>
                Created orderId: {createResult.orderId}
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
