import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import moment from "moment-timezone";
import { fetchOrdersGrid } from "../store/ordersSlice";

import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function OrdersGrid() {
  const dispatch = useDispatch();
  const { gridData, loading, error } = useSelector((state) => state.orders);
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const [gridApi, setGridApi] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [sortModel, setSortModel] = useState([]);

  const formatItems = (items) => {
    if (!items || items.length === 0) return "No items";
    return items.map((item) => `${item.name}`);
  };

  const columns = [
    {
      field: "id",
      headerName: "Order ID",
      sortable: true,
      width: 85,
      filter: "agNumberColumnFilter",
    },
    {
      field: "customerId",
      headerName: "Customer ID",
      sortable: true,
      width: 110,
      filter: "agNumberColumnFilter",
    },
    {
      field: "status",
      headerName: "Status",
      sortable: true,
      width: 110,
      filter: "agTextColumnFilter",
    },

    {
      field: "items",
      headerName: "Items",
      flex: 1,
      width: 150,
      filter: "agTextColumnFilter",
      cellRenderer: (params) => {
        return (
          <div style={{ whiteSpace: "pre-line", lineHeight: "18px" }}>
            {formatItems(params.value)}
          </div>
        );
      },
    },

    {
      field: "itemsCount",
      headerName: "Qty",
      width: 90,
      filter: "agNumberColumnFilter",
    },

    {
      field: "shippingMethod",
      headerName: "Ship Method",
      width: 130,
      filter: "agTextColumnFilter",
    },
    {
      field: "shippingAddress",
      headerName: "Address",
      width: 140,
      filter: "agTextColumnFilter",
    },

    {
      field: "createdAtCST",
      headerName: "Created At",
      sortable: true,
      filter: "agDateColumnFilter",
      width: 160,
      valueFormatter: (params) =>
        moment(params.value).format("MM/DD/YYYY hh:mm A"),
    },
    {
      field: "updatedAtCST",
      headerName: "Updated At",
      sortable: true,
      width: 160,
      valueFormatter: (params) =>
        moment(params.value).format("MM/DD/YYYY hh:mm A"),
    },
  ];

  const fetchData = useCallback(() => {
    const sortBy = sortModel[0]?.colId || "createdAt";
    const sortDir = sortModel[0]?.sort?.toUpperCase() || "DESC";
    const filters = gridApi?.getFilterModel() || {};

    dispatch(
      fetchOrdersGrid({
        page,
        size: pageSize,
        sortBy,
        sortDir,
        filters: JSON.stringify(filters),
      })
    );
  }, [dispatch, page, sortModel, gridApi]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const onPaginationChanged = () => {
    if (!gridApi) return;
    const currentPage = gridApi.paginationGetCurrentPage() + 1;
    if (currentPage !== page) setPage(currentPage);
  };

  const onSortChanged = () => {
    if (!gridApi) return;
    setSortModel(gridApi.getSortModel());
  };

  const onFilterChanged = () => {
    if (!gridApi) return;
    fetchData();
  };

  return (
    <div
      className="ag-theme-alpine"
      style={{
        height: 500,
        width: "100%",
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <AgGridReact
        columnDefs={columns}
        rowData={gridData?.results || []}
        pagination={true}
        paginationPageSize={pageSize}
        onGridReady={onGridReady}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        rowSelection="single"
        animateRows={true}
        overlayLoadingTemplate={
          '<span class="ag-overlay-loading-center">Loading...</span>'
        }
        overlayNoRowsTemplate={
          '<span class="ag-overlay-loading-center">No Orders Found</span>'
        }
        onFilterChanged={onFilterChanged}
      />

      {loading && (
        <div style={{ marginTop: 10, textAlign: "center" }}>Loading...</div>
      )}
    </div>
  );
}
