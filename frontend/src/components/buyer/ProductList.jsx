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
  TextField,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  InputAdornment,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Chat as ChatIcon,
  ShoppingBag as ShoppingBagIcon,
} from "@mui/icons-material";
import { getUserInfo, logout } from "../../utils/auth";
import { getProducts, addToCart } from "../../services/buyerApi";
import { useNavigate } from "react-router-dom";
import Chatbot from "./Chatbot";

function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [cartCount, setCartCount] = useState(0);
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
  }, [navigate]);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();

      if (response.success && response.data) {
        const transformedProducts = response.data.map((product) => ({
          id: product.id || product._id,
          sellerId: product.sellerId,
          name: product.name,
          price: product.price,
          image:
            product.imagePath ||
            product.image ||
            "https://via.placeholder.com/300x300?text=No+Image",
          description: product.description,
          isOnSale: product.isOnSale,
          createdAt: product.createdAt || new Date().toISOString(),
        }));

        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
      } else {
        showSnackbar("No products found", "info");
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      showSnackbar("Failed to load products. Please try again later.", "error");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Add to cart
  const handleAddToCart = async (productId) => {
    try {
      const response = await addToCart(productId, 1);

      if (response.success) {
        setCartCount(cartCount + 1);
        showSnackbar(
          response.message || "Added to cart successfully!",
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

  // View product details
  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Show snackbar message
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleProfile = () => {
    navigate("/profile");
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
    <Box sx={{ flexGrow: 1 }}>
      {/* Top Navigation Bar */}
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SecondHand Marketplace
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

          <IconButton
            color="inherit"
            onClick={() => navigate("/orders")}
            sx={{ mr: 1 }}
          >
            <ShoppingBagIcon />
          </IconButton>

          {/* AI Chatbot Button - 添加这个 */}
          <IconButton
            color="inherit"
            onClick={() => setChatbotOpen(true)}
            sx={{ mr: 1 }}
          >
            <ChatIcon />
          </IconButton>

          {/* Shopping Cart Icon */}
          <IconButton
            color="inherit"
            onClick={() => navigate("/cart")}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {/* Logout */}
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search products by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Product List Title */}
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          All Products
          <Chip
            label={`${filteredProducts.length} items`}
            color="primary"
            size="small"
            sx={{ ml: 2 }}
          />
        </Typography>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <Alert severity="info">
            {searchTerm
              ? "No products found matching your search"
              : "No products available"}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  {/* Product Image */}
                  <CardMedia
                    component="img"
                    height="200"
                    image={"http://localhost:3000" + product.image}
                    alt={product.name}
                    sx={{ objectFit: "cover", cursor: "pointer" }}
                    onClick={() => handleViewDetails(product.id)}
                  />

                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Product Name */}
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
                        cursor: "pointer",
                      }}
                      onClick={() => handleViewDetails(product.id)}
                    >
                      {product.name}
                    </Typography>

                    {/* Product Description */}
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

                    {/* Price */}
                    <Typography variant="h5" color="error" fontWeight="bold">
                      ${product.price?.toLocaleString() || product.price}
                    </Typography>

                    {/* Posted Date */}
                    {product.createdAt && (
                      <Typography variant="caption" color="text.secondary">
                        Posted:{" "}
                        {new Date(product.createdAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>

                  {/* Action Buttons */}
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      onClick={() => handleViewDetails(product.id)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => handleAddToCart(product.id)}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
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

      {/* AI Chatbot - 添加这个 */}
      <Chatbot open={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </Box>
  );
}

export default ProductList;
