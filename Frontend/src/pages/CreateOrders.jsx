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
import { toast } from "react-toastify";

export default function CreateOrders() {
  const dispatch = useDispatch();
  const { creating, createResult, error } = useSelector((s) => s.orders);
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const generateTrackingId = () =>
    "TRK-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      customer: { name: "", email: "", phone: "" },

      items: [{ sku: "", name: "", qty: 1, price: "" }],

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
    const result = await dispatch(createOrder(data));
    if (createOrder.rejected.match(result)) return;

    if (createOrder.fulfilled.match(result)) {
      toast.success("Order created successfully!");
      reset();
      dispatch(clearCreateResult());
    }
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
              rules={{
                required: "Name is required",
                maxLength: { value: 20, message: "Max 20 characters allowed" },
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: "Name can contain letters only",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  fullWidth
                  label="Name"
                  margin="normal"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            {/* EMAIL */}
            <Controller
              name="customer.email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  fullWidth
                  label="Email"
                  margin="normal"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="customer.phone"
              control={control}
              rules={{
                required: "Phone Number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Phone must be 10 digits",
                  maxLength: 10,
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  type="number"
                  fullWidth
                  label="Phone"
                  margin="normal"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          {/* SHIPPING */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Shipping</Typography>

            {/* SHIPPING METHOD */}
            <Controller
              name="shipping.method"
              control={control}
              rules={{
                required: "Please select shipping method!",
              }}
              render={({ field, fieldState }) => (
                <TextField
                  select
                  fullWidth
                  label="Shipping Method"
                  margin="normal"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  {["Standard", "Express", "Same-Day"].map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* ADDRESS */}
            <Controller
              name="shipping.address"
              control={control}
              rules={{
                required: "Address is required",
                maxLength: {
                  value: 50,
                  message: "Max character length exceed!",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  fullWidth
                  label="Address"
                  margin="normal"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
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
                    rules={{ required: "SKU required" }}
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        label="SKU"
                        margin="normal"
                        {...field}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>

                {/* ITEM NAME */}
                <Grid item xs={6} md={3}>
                  <Controller
                    name={`items.${idx}.name`}
                    control={control}
                    rules={{ required: "Item name required" }}
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        label="Item Name"
                        margin="normal"
                        {...field}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={6} md={2}>
                  <Controller
                    name={`items.${idx}.qty`}
                    control={control}
                    rules={{
                      required: "Qty required",
                      min: { value: 1, message: "Min 1" },
                    }}
                    render={({ field, fieldState }) => (
                      <TextField
                        type="number"
                        label="Qty"
                        margin="normal"
                        {...field}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>

                {/* PRICE */}
                <Grid item xs={6} md={2}>
                  <Controller
                    name={`items.${idx}.price`}
                    control={control}
                    rules={{
                      required: "Price required",
                      min: { value: 0, message: "Cannot be negative" },
                      max: {
                        value: 1000000,
                        message: "Order value cannot be more than 1000000",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <TextField
                        type="number"
                        label="Price"
                        margin="normal"
                        {...field}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
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
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
