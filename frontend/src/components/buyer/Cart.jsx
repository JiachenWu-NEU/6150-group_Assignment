import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  IconButton,
  Divider,
  TextField,
  Card,
  CardContent,
  CardMedia,
  Snackbar,
  Alert,
  CircularProgress,
  Checkbox,
  AppBar,
  Toolbar,
  Chip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  mockGetCart,
  mockUpdateCartItem,
  mockRemoveFromCart,
  mockClearCart,
} from "../../services/buyerApi";
import { getUserInfo } from "../../utils/auth";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
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

  // Fetch cart items
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await mockGetCart();

      if (response.success && response.data.items) {
        setCartItems(response.data.items);
        // Auto-select all available items
        const availableItemIds = response.data.items
          .filter((item) => item.isAvailable)
          .map((item) => item.id);
        setSelectedItems(availableItemIds);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      showSnackbar("Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      // Optimistic update
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );

      await mockUpdateCartItem(cartItemId, newQuantity);
      showSnackbar("Cart updated", "success");
    } catch (error) {
      console.error("Failed to update cart:", error);
      showSnackbar("Failed to update cart", "error");
      fetchCart(); // Reload cart on error
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (cartItemId) => {
    try {
      await mockRemoveFromCart(cartItemId);
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== cartItemId)
      );
      setSelectedItems((prevSelected) =>
        prevSelected.filter((id) => id !== cartItemId)
      );
      showSnackbar("Item removed from cart", "success");
    } catch (error) {
      console.error("Failed to remove item:", error);
      showSnackbar("Failed to remove item", "error");
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        await mockClearCart();
        setCartItems([]);
        setSelectedItems([]);
        showSnackbar("Cart cleared", "success");
      } catch (error) {
        console.error("Failed to clear cart:", error);
        showSnackbar("Failed to clear cart", "error");
      }
    }
  };

  // Toggle item selection
  const handleToggleItem = (itemId) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(itemId)) {
        return prevSelected.filter((id) => id !== itemId);
      } else {
        return [...prevSelected, itemId];
      }
    });
  };

  // Toggle select all
  const handleToggleSelectAll = () => {
    const availableItemIds = cartItems
      .filter((item) => item.isAvailable)
      .map((item) => item.id);

    if (selectedItems.length === availableItemIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(availableItemIds);
    }
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // Proceed to checkout
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      showSnackbar("Please select at least one item", "warning");
      return;
    }

    const selectedCartItems = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );

    navigate("/checkout", {
      state: {
        cartItems: selectedCartItems,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
      },
    });
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
            Shopping Cart
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
        {cartItems.length === 0 ? (
          // Empty Cart
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
              Add some items to get started!
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
            {/* Left Side - Cart Items */}
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 3 }}>
                {/* Header with Select All */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked={
                        selectedItems.length ===
                          cartItems.filter((item) => item.isAvailable).length &&
                        cartItems.length > 0
                      }
                      onChange={handleToggleSelectAll}
                      indeterminate={
                        selectedItems.length > 0 &&
                        selectedItems.length <
                          cartItems.filter((item) => item.isAvailable).length
                      }
                    />
                    <Typography variant="h6">
                      Select All ({cartItems.length} items)
                    </Typography>
                  </Box>

                  {cartItems.length > 0 && (
                    <Button
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleClearCart}
                    >
                      Clear Cart
                    </Button>
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Cart Items List */}
                {cartItems.map((item) => (
                  <Card
                    key={item.id}
                    sx={{
                      mb: 2,
                      opacity: item.isAvailable ? 1 : 0.6,
                      border: selectedItems.includes(item.id)
                        ? "2px solid #1976d2"
                        : "1px solid #e0e0e0",
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        {/* Checkbox */}
                        <Grid item>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleToggleItem(item.id)}
                            disabled={!item.isAvailable}
                          />
                        </Grid>

                        {/* Product Image */}
                        <Grid item>
                          <CardMedia
                            component="img"
                            image={item.image}
                            alt={item.productName}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 1,
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              navigate(`/product/${item.productId}`)
                            }
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
                            onClick={() =>
                              navigate(`/product/${item.productId}`)
                            }
                          >
                            {item.productName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Seller: {item.sellerName}
                          </Typography>
                          {!item.isAvailable && (
                            <Chip
                              label="Out of Stock"
                              color="error"
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Grid>

                        {/* Price */}
                        <Grid item>
                          <Typography
                            variant="h6"
                            color="error"
                            fontWeight="bold"
                          >
                            ${item.price.toLocaleString()}
                          </Typography>
                        </Grid>

                        {/* Quantity Controls */}
                        <Grid item>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              border: "1px solid #e0e0e0",
                              borderRadius: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1 || !item.isAvailable}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <TextField
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value > 0) {
                                  handleUpdateQuantity(item.id, value);
                                }
                              }}
                              disabled={!item.isAvailable}
                              inputProps={{
                                style: { textAlign: "center", width: "40px" },
                                min: 1,
                                max: 10,
                              }}
                              variant="standard"
                              InputProps={{
                                disableUnderline: true,
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={
                                item.quantity >= 10 || !item.isAvailable
                              }
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>

                        {/* Subtotal */}
                        <Grid item>
                          <Typography variant="h6" fontWeight="bold">
                            ${(item.price * item.quantity).toLocaleString()}
                          </Typography>
                        </Grid>

                        {/* Delete Button */}
                        <Grid item>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveItem(item.id)}
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

            {/* Right Side - Order Summary */}
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, position: "sticky", top: 80 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Order Summary
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Selected Items Count */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Selected Items:
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {selectedItems.length}
                  </Typography>
                </Box>

                {/* Subtotal */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Subtotal:
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    ${calculateSubtotal().toLocaleString()}
                  </Typography>
                </Box>

                {/* Tax */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Tax (10%):
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    ${calculateTax().toFixed(2)}
                  </Typography>
                </Box>

                {/* Shipping */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Shipping:
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="500"
                    color="success.main"
                  >
                    FREE
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Total */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Total:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="error">
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>

                {/* Checkout Button */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  sx={{ mb: 2 }}
                >
                  Proceed to Checkout ({selectedItems.length})
                </Button>

                {/* Continue Shopping */}
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => navigate("/products")}
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
