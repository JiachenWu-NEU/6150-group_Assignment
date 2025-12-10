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
  Rating,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Share as ShareIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, addToCart } from "../../services/buyerApi";
import { getUserInfo } from "../../utils/auth";

function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
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
    setUserInfo(user);
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
      console.log("Adding to cart:", product.id, "quantity:", quantity);
      showSnackbar(`Added ${quantity} item(s) to cart!`, "success");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      showSnackbar("Failed to add to cart", "error");
    }
  };

  // Buy now
  const handleBuyNow = () => {
    navigate("/checkout", { state: { productId: product.id, quantity } });
  };

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
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumb Navigation */}
        <Box sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate("/products")} sx={{ mb: 1 }}>
            <ArrowBackIcon />
          </IconButton>
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
            {/* Left Side - Images */}
            <Grid item xs={12} md={6}>
              {/* Main Image */}
              <Box
                sx={{
                  width: "100%",
                  height: 400,
                  mb: 2,
                  borderRadius: 2,
                  overflow: "hidden",
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={
                    product.images?.[selectedImage] ||
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

              {/* Thumbnail Images */}
              {product.images && product.images.length > 0 && (
                <Grid container spacing={1}>
                  {product.images.map((image, index) => (
                    <Grid item xs={3} key={index}>
                      <Box
                        onClick={() => setSelectedImage(index)}
                        sx={{
                          width: "100%",
                          height: 80,
                          borderRadius: 1,
                          overflow: "hidden",
                          cursor: "pointer",
                          border:
                            selectedImage === index
                              ? "2px solid #1976d2"
                              : "2px solid transparent",
                          "&:hover": {
                            opacity: 0.8,
                          },
                        }}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>

            {/* Right Side - Product Info */}
            <Grid item xs={12} md={6}>
              {/* Product Name */}
              <Typography variant="h4" gutterBottom fontWeight="bold">
                {product.name}
              </Typography>

              {/* Rating and Reviews */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Rating value={4.5} precision={0.5} readOnly size="small" />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  (24 reviews)
                </Typography>
              </Box>

              {/* Price */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h3" color="error" fontWeight="bold">
                  ${product.price?.toLocaleString() || product.price}
                </Typography>
                {product.originalPrice && (
                  <>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ textDecoration: "line-through" }}
                    >
                      ${product.originalPrice.toLocaleString()}
                    </Typography>
                    <Chip
                      label={`Save ${Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )}%`}
                      color="success"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </>
                )}
              </Box>

              {/* Condition and Category */}
              <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                {product.condition && (
                  <Chip
                    label={`Condition: ${product.condition}`}
                    color="primary"
                  />
                )}
                {product.category && (
                  <Chip label={product.category} variant="outlined" />
                )}
              </Box>

              {/* Location */}
              {product.location && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 0.5 }}
                  >
                    {product.location}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ mb: 3 }} />

              {/* Description */}
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                {product.description}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              {/* Specifications */}
              {product.specifications &&
                Object.keys(product.specifications).length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Specifications
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      {Object.entries(product.specifications).map(
                        ([key, value]) => (
                          <Box
                            key={key}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              py: 1,
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            <Typography variant="body2" fontWeight="500">
                              {key}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {value}
                            </Typography>
                          </Box>
                        )
                      )}
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                  </>
                )}

              {/* Quantity Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
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
                  sx={{ width: 100 }}
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
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </Box>

              {/* Share Button */}
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleShare}
                fullWidth
              >
                Share
              </Button>

              <Divider sx={{ my: 3 }} />

              {/* Seller Info */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Seller Information
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar sx={{ mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="500">
                        {product.sellerName || "Anonymous Seller"}
                      </Typography>
                      {product.sellerRating && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Rating
                            value={product.sellerRating}
                            precision={0.1}
                            readOnly
                            size="small"
                          />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ ml: 0.5 }}
                          >
                            ({product.sellerRating})
                          </Typography>
                        </Box>
                      )}
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
    </Box>
  );
}

export default ProductDetail;
