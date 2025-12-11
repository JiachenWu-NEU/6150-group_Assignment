import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  Divider,
  AppBar,
  Toolbar,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getCart,
  updateCartItem,
  removeFromCart,
} from "../../services/buyerApi";
import { getUserInfo } from "../../utils/auth";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
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
      navigate("/login");
    } else {
      setUserInfo(user);
    }
  }, [navigate]);

  // Fetch cart
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();

      if (response.success && response.data) {
        const transformedItems = response.data.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          image:
            (item.imagePath
              ? "http://localhost:3000" + item.imagePath
              : null) ||
            "https://via.placeholder.com/100x100?text=Product",
          isAvailable: true, // 如果后端有字段可以改成真实状态
        }));

        setCartItems(transformedItems);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      showSnackbar("Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update quantity
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      // optimistic UI
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      const response = await updateCartItem(productId, newQuantity);

      if (response.success) {
        showSnackbar("Cart updated", "success");
      } else {
        showSnackbar(response.message || "Failed to update cart", "error");
        fetchCart();
      }
    } catch (error) {
      console.error("Failed to update cart:", error);
      showSnackbar("Failed to update cart", "error");
      fetchCart();
    }
  };

  // Remove item
  const handleRemoveItem = async (productId) => {
    try {
      const response = await removeFromCart(productId);

      if (response.success) {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.productId !== productId)
        );
        showSnackbar("Item removed from cart", "success");
      } else {
        showSnackbar(response.message || "Failed to remove item", "error");
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      showSnackbar("Failed to remove item", "error");
    }
  };

  // Clear cart (still using loop, or以后接一个clear-cart接口)
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        for (const item of cartItems) {
          await removeFromCart(item.productId);
        }
        setCartItems([]);
        showSnackbar("Cart cleared", "success");
      } catch (error) {
        console.error("Failed to clear cart:", error);
        showSnackbar("Failed to clear cart", "error");
      }
    }
  };

  // Proceed to checkout: entire cart
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showSnackbar("Your cart is empty", "warning");
      return;
    }

    // 把所有商品传给 checkout 页面（页面里再调用“根据 token 生成订单 + 清空购物车”的接口）
    navigate("/checkout", { state: { items: cartItems } });
  };

  // Calculate totals for the whole cart
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Show snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleProfile = () => {
    navigate("/profile");
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
            Shopping Cart
          </Typography>

          {userInfo && (
            <IconButton color="inherit" onClick={handleProfile} sx={{ mr: 1 }}>
              <PersonIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {cartItems.length === 0 ? (
          // Empty Cart State
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
            <ShoppingCartIcon
              sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Add some products to get started!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/products")}
              sx={{ mt: 2 }}
            >
              Continue Shopping
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {/* Cart Items */}
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 3 }}>
                {/* Header + Clear Cart */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="body1" fontWeight="500">
                    Cart Items ({cartItems.length})
                  </Typography>
                  <Button
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleClearCart}
                  >
                    Clear Cart
                  </Button>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Cart Items List */}
                {cartItems.map((item) => (
                  <Card
                    key={item.productId}
                    sx={{
                      mb: 2,
                      opacity: item.isAvailable ? 1 : 0.6,
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        {/* Product Image */}
                        <Grid item>
                          <CardMedia
                            component="img"
                            image={item.image}
                            alt={item.productName}
                            sx={{
                              width: 100,
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 1,
                            }}
                          />
                        </Grid>

                        {/* Product Info */}
                        <Grid item xs>
                          <Typography variant="h6" gutterBottom>
                            {item.productName}
                          </Typography>
                          <Typography
                            variant="h6"
                            color="error"
                            fontWeight="bold"
                          >
                            ${item.price.toLocaleString()}
                          </Typography>
                          {!item.isAvailable && (
                            <Chip
                              label="Out of Stock"
                              color="error"
                              size="small"
                            />
                          )}
                        </Grid>

                        {/* Quantity Controls */}
                        <Grid item>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography
                              variant="body1"
                              sx={{
                                minWidth: 40,
                                textAlign: "center",
                                fontWeight: "bold",
                              }}
                            >
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Grid>

                        {/* Remove Button */}
                        <Grid item>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveItem(item.productId)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Paper>
            </Grid>

            {/* Order Summary */}
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, position: "sticky", top: 80 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Order Summary
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1">
                      Subtotal ({cartItems.length} items)
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      ${subtotal.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1">Tax (10%)</Typography>
                    <Typography variant="body1" fontWeight="500">
                      ${tax.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1">Shipping</Typography>
                    <Typography
                      variant="body1"
                      fontWeight="500"
                      color="success.main"
                    >
                      FREE
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="error">
                    ${total.toFixed(2)}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => navigate("/products")}
                  sx={{ mt: 2 }}
                >
                  Continue Shopping
                </Button>
              </Paper>
            </Grid>
          </Grid>
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

export default Cart;
