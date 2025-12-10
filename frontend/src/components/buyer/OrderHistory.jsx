import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ShoppingBag as ShoppingBagIcon,
  Person as PersonIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getOrderHistory } from "../../services/buyerApi"; 
import { getUserInfo } from "../../utils/auth";

function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Get user info
  useEffect(() => {
    const user = getUserInfo();
    if (!user) {
      const mockUser = {
        id: "user123",
        username: "John Doe",
        email: "john@example.com",
      };
      setUserInfo(mockUser);
    } else {
      setUserInfo(user);
    }
  }, []);

  // Fetch order history
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // 等后端好了改为：const response = await getOrderHistory();
      const response = await getOrderHistory();

      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      showSnackbar("Failed to load order history", "error");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "success";
      case "shipped":
        return "info";
      case "processing":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircleIcon fontSize="small" />;
      case "shipped":
        return <LocalShippingIcon fontSize="small" />;
      case "processing":
        return <ScheduleIcon fontSize="small" />;
      default:
        return <ShoppingBagIcon fontSize="small" />;
    }
  };

  // View order details
  const handleViewOrderDetails = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  // View product details
  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Show snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
    <Box sx={{ flexGrow: 1, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Top Navigation Bar */}
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => navigate("/products")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Order History
          </Typography>

          {/* User Info */}
          {userInfo && (
            <Chip
              icon={<PersonIcon />}
              label={userInfo.username}
              color="secondary"
            />
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {orders.length === 0 ? (
          // Empty State
          <Paper
            elevation={2}
            sx={{
              p: 6,
              textAlign: "center",
              minHeight: "400px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingBagIcon
              sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              No Orders Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You haven't placed any orders yet. Start shopping!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/products")}
              sx={{ mt: 2 }}
            >
              Browse Products
            </Button>
          </Paper>
        ) : (
          <>
            {/* Orders Header */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" gutterBottom>
                My Orders
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Orders: {orders.length}
              </Typography>
            </Box>

            {/* Orders List */}
            {orders.map((order) => (
              <Card key={order.id} sx={{ mb: 3 }}>
                <CardContent>
                  {/* Order Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Order #{order.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Placed on:{" "}
                        {new Date(order.purchaseDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={order.status || "Processing"}
                      color={getStatusColor(order.status)}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Order Items */}
                  {order.items &&
                    order.items.map((item, index) => (
                      <Box key={index}>
                        <Grid
                          container
                          spacing={2}
                          alignItems="center"
                          sx={{ mb: 2 }}
                        >
                          {/* Product Image */}
                          <Grid item>
                            <Box
                              component="img"
                              src={
                                item.productImage ||
                                "https://via.placeholder.com/80x80?text=Product"
                              }
                              alt={item.productName}
                              sx={{
                                width: 80,
                                height: 80,
                                objectFit: "cover",
                                borderRadius: 1,
                                cursor: "pointer",
                              }}
                              onClick={() => handleViewProduct(item.productId)}
                            />
                          </Grid>

                          {/* Product Info */}
                          <Grid item xs>
                            <Typography
                              variant="h6"
                              sx={{
                                cursor: "pointer",
                                "&:hover": { color: "primary.main" },
                              }}
                              onClick={() => handleViewProduct(item.productId)}
                            >
                              {item.productName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Seller: {item.sellerName || "Unknown"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity}
                            </Typography>
                          </Grid>

                          {/* Price */}
                          <Grid item>
                            <Typography
                              variant="h6"
                              color="error"
                              fontWeight="bold"
                            >
                              ${item.price?.toLocaleString() || "0"}
                            </Typography>
                            {item.quantity > 1 && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ${item.price} × {item.quantity}
                              </Typography>
                            )}
                          </Grid>
                        </Grid>
                        {index < order.items.length - 1 && (
                          <Divider sx={{ my: 2 }} />
                        )}
                      </Box>
                    ))}

                  <Divider sx={{ my: 2 }} />

                  {/* Order Footer */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Total: ${order.totalAmount?.toLocaleString() || "0"}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => handleViewOrderDetails(order.id)}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </Container>

      {/* Snackbar Notification */}
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

export default OrderHistory;
