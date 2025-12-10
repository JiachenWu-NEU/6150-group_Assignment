import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Paper,
  Divider,
  TextField,
  Avatar,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Share as ShareIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, addToCart } from "../../services/buyerApi";
import { getUserInfo } from "../../utils/auth";
import Chatbot from "./Chatbot";

function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [userInfo, setUserInfo] = useState(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);

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

  // Fetch product details
  useEffect(() => {
    fetchProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await getProductById(id);

      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        showSnackbar("Product not found", "error");
        setTimeout(() => navigate("/products"), 1500);
      }
    } catch (error) {
      console.error("Failed to fetch product details:", error);
      showSnackbar("Failed to load product details", "error");
    } finally {
      setLoading(false);
    }
  };

  // Add to cart
  const handleAddToCart = async () => {
    try {
      const response = await addToCart(product.id, quantity);

      if (response.success) {
        showSnackbar(
          `Added ${quantity} item(s) to cart successfully!`,
          "success"
        );
      } else {
        showSnackbar(response.message || "Failed to add to cart", "error");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      showSnackbar("Failed to add to cart. Please try again.", "error");
    }
  };

  // Buy now

  // Share product
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showSnackbar("Link copied to clipboard!", "success");
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

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Product not found</Alert>
        <Button
          onClick={() => navigate("/products")}
          sx={{ mt: 2 }}
          variant="contained"
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
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
            Product Details
          </Typography>

          {/* User Info */}
          {userInfo && (
            <Chip
              icon={<PersonIcon />}
              label={userInfo.username}
              color="secondary"
              sx={{ mr: 2 }}
            />
          )}

          {/* AI Chatbot Button */}
          <IconButton
            color="inherit"
            onClick={() => setChatbotOpen(true)}
            sx={{ mr: 1 }}
          >
            <ChatIcon />
          </IconButton>

          {/* Shopping Cart Icon */}
          <IconButton color="inherit" onClick={() => navigate("/cart")}>
            <ShoppingCartIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumb Navigation */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
            >
              Home
            </Link>
            <Link
              underline="hover"
              color="inherit"
              href="/products"
              onClick={(e) => {
                e.preventDefault();
                navigate("/products");
              }}
            >
              Products
            </Link>
            <Typography color="text.primary">{product.name}</Typography>
          </Breadcrumbs>
        </Box>

        <Paper elevation={2} sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Left Side - Main Image */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  width: "100%",
                  height: 500,
                  borderRadius: 2,
                  overflow: "hidden",
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #e0e0e0",
                }}
              >
                <img
                  src={
                    "http://localhost:3000" + product.imagePath ||
                    "https://via.placeholder.com/600x600?text=No+Image"
                  }
                  alt={product.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
            </Grid>

            {/* Right Side - Product Info */}
            <Grid item xs={12} md={6}>
              {/* Product Name */}
              <Typography variant="h4" gutterBottom fontWeight="bold">
                {product.name}
              </Typography>

              {/* Status Chip */}
              <Box sx={{ mb: 3 }}>
                <Chip
                  label={product.isOnSale ? "Available" : "Sold Out"}
                  color={product.isOnSale ? "success" : "error"}
                  size="medium"
                />
              </Box>

              {/* Price */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h3" color="error" fontWeight="bold">
                  ${product.price?.toLocaleString() || product.price}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Description */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Description
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {product.description || "No description available"}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Quantity Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom fontWeight="500">
                  Quantity
                </Typography>
                <TextField
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 0) setQuantity(value);
                  }}
                  InputProps={{
                    inputProps: { min: 1, max: 10 },
                  }}
                  size="small"
                  sx={{ width: 120 }}
                  disabled={!product.isOnSale}
                />
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={!product.isOnSale}
                  sx={{ height: 56 }}
                >
                  Add to Cart
                </Button>
              </Box>

              {!product.isOnSale && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  This product is currently sold out.
                </Alert>
              )}

              {/* Share Button */}
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleShare}
                fullWidth
                sx={{ height: 48 }}
              >
                Share Product
              </Button>

              <Divider sx={{ my: 3 }} />

              {/* Seller Info */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Seller Information
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="500">
                        Seller ID: {product.sellerId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Contact seller for more information
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
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

      {/* AI Chatbot */}
      <Chatbot open={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </Box>
  );
}

export default ProductDetail;
