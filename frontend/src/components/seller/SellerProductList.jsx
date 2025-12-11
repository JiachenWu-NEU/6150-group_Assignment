import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Store as StoreIcon,
} from "@mui/icons-material";
import { getUserInfo, logout } from "../../utils/auth";
import {
  getMyProducts,
  deleteProduct,
  updateProductAvailability,
  getVenderOrders,
  updateProduct,
} from "../../services/sellerApi";
import { useNavigate } from "react-router-dom";

function SellerProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0: on sale, 1: inactive, 2: sold

  // Edit dialog
  const [editDialog, setEditDialog] = useState({
    open: false,
    product: null,
  });
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    description: "",
  });

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    productId: null,
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Get user info
  useEffect(() => {
    const user = getUserInfo();
    console.log("User info:", user);
    if (!user) {
      navigate("/login");
    } else {
      setUserInfo(user);
    }
  }, [navigate]);

  // Fetch products & orders
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const productsResponse = await getMyProducts();
      if (productsResponse.data) {
        setProducts(productsResponse.data);
      }

      const ordersResponse = await getVenderOrders();
      if (ordersResponse.data) {
        setOrders(ordersResponse.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showSnackbar("Failed to load data. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddProduct = () => {
    navigate("/seller/add-product");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleEditClick = (product) => {
    setEditForm({
      name: product.name,
      price: product.price,
      description: product.description,
    });
    setEditDialog({ open: true, product });
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, product: null });
  };

  const handleEditSave = async () => {
    try {
      await updateProduct(editDialog.product.id, editForm);
      showSnackbar("Product updated successfully.", "success");
      handleEditClose();
      fetchData();
    } catch (error) {
      console.error("Failed to update product:", error);
      showSnackbar("Failed to update product. Please try again.", "error");
    }
  };

  const handleDeleteClick = (productId) => {
    setDeleteDialog({ open: true, productId });
  };

  const handleDeleteClose = () => {
    setDeleteDialog({ open: false, productId: null });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(deleteDialog.productId);
      showSnackbar("Product deleted successfully.", "success");
      handleDeleteClose();
      fetchData();
    } catch (error) {
      console.error("Failed to delete product:", error);
      showSnackbar("Failed to delete product. Please try again.", "error");
    }
  };

  const handleToggleAvailability = async (productId, currentStatus) => {
    try {
      await updateProductAvailability(productId, !currentStatus);
      showSnackbar(
        currentStatus
          ? "Product has been deactivated."
          : "Product has been activated.",
        "success"
      );
      fetchData();
    } catch (error) {
      console.error("Failed to toggle availability:", error);
      showSnackbar("Operation failed. Please try again.", "error");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Products for tab 0 & 1
  const getFilteredProducts = () => {
    if (tabValue === 0) {
      return products.filter((p) => p.isOnSale);
    }
    if (tabValue === 1) {
      return products.filter((p) => !p.isOnSale);
    }
    // Sold tab uses orders, not products
    return [];
  };

  const filteredProducts = getFilteredProducts();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* AppBar */}
      <AppBar position="sticky">
        <Toolbar>
          <StoreIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Vender Center
          </Typography>

          {userInfo && (
            <IconButton
              color="inherit"
              onClick={handleProfile}
              sx={{ mr: 1 }}
            >
              <PersonIcon />
            </IconButton>
          )}

          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header + Add button */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            mb: 3,
          }}
        >
          <Typography variant="h4">My Products</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
            size="large"
            sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}
          >
            Add New Product
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={`On Sale (${products.filter((p) => p.isOnSale).length})`}
            />
            <Tab
              label={`Inactive (${products.filter((p) => !p.isOnSale).length})`}
            />
            <Tab label={`Sold (${orders.length})`} />
          </Tabs>
        </Box>

        {/* Content area */}
        {tabValue === 2 ? (
          // Sold tab: show orders list
          orders.length === 0 ? (
            <Alert severity="info">No sales yet.</Alert>
          ) : (
            <Grid container spacing={3}>
              {orders.map((order, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={`${order.orderId}-${index}`}
                >
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        order.imagePath
                          ? `http://localhost:3000${order.imagePath}`
                          : "https://via.placeholder.com/300x200?text=No+Image"
                      }
                      alt={order.productName}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {order.productName}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Chip
                          label={`Qty: ${order.quantity}`}
                          color="success"
                          size="small"
                          sx={{ alignSelf: "flex-start" }}
                        />
                      
                        {order.address && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontWeight: 500 }}
                            >
                              Address:
                            </Typography>
                            <Chip
                              label={order.address}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        Sold at:{" "}
                        {new Date(order.purchaseDate).toLocaleString()}
                      </Typography>
                    </CardContent>
                    {/* No actions on sold tab */}
                  </Card>
                </Grid>
              ))}
            </Grid>
          )
        ) : filteredProducts.length === 0 ? (
          <Alert severity="info">
            {tabValue === 0 && "No products on sale."}
            {tabValue === 1 && "No inactive products."}
          </Alert>
        ) : (
          // On sale / inactive products grid
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={product.id}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  {!product.isOnSale && (
                    <Chip
                      label="Inactive"
                      color="default"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 1,
                      }}
                    />
                  )}

                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      product.imagePath
                        ? `http://localhost:3000${product.imagePath}`
                        : "https://via.placeholder.com/300x200?text=No+Image"
                    }
                    alt={product.name}
                    sx={{ objectFit: "cover" }}
                  />

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {product.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        mb: 2,
                      }}
                    >
                      {product.description}
                    </Typography>

                    <Typography variant="h5" color="error" fontWeight="bold">
                      ${Number(product.price).toLocaleString()}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Published at:{" "}
                      {new Date(product.createdAt).toLocaleString()}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditClick(product)}
                      fullWidth
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color={product.isOnSale ? "warning" : "success"}
                      startIcon={
                        product.isOnSale ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )
                      }
                      onClick={() =>
                        handleToggleAvailability(product.id, product.isOnSale)
                      }
                      fullWidth
                    >
                      {product.isOnSale ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(product.id)}
                      fullWidth
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Edit dialog */}
      <Dialog open={editDialog.open} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Product Name"
            fullWidth
            value={editForm.name}
            onChange={(e) =>
              setEditForm({ ...editForm, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            value={editForm.price}
            onChange={(e) =>
              setEditForm({ ...editForm, price: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editForm.description}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SellerProductList;