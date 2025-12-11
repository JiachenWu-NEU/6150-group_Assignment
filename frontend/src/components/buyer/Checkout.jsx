import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getUserInfo } from "../../utils/auth";
import { createOrder, getCart } from "../../services/buyerApi";
import { STRIPE_PUBLISHABLE_KEY } from "../../config/stripe";

// 加载 Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// 卡片样式
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

// 支付表单组件
function CheckoutForm({ orderData, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!cardholderName.trim()) {
      onError("Please enter cardholder name");
      return;
    }

    setProcessing(true);

    try {
      // 创建支付方式
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
        billing_details: {
          name: cardholderName,
        },
      });

      if (error) {
        onError(error.message);
        setProcessing(false);
        return;
      }

      // 模拟支付成功（测试模式）
      // 真实项目中应该调用后端 API 来处理支付
      console.log("Payment Method:", paymentMethod);

      // 创建订单
      const response = await createOrder();

      if (response.success) {
        onSuccess(response.data);
      } else {
        onError(response.message || "Failed to create order");
      }
    } catch (err) {
      console.error("Payment error:", err);
      onError("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom fontWeight="500">
          Cardholder Name
        </Typography>
        <TextField
          fullWidth
          placeholder="John Doe"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          disabled={processing}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom fontWeight="500">
          Card Information
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            backgroundColor: "#f8f9fa",
          }}
        >
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </Paper>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Test Mode:</strong> Use card number 4242 4242 4242 4242, any
          future expiry date, and any 3-digit CVC.
        </Typography>
      </Alert>

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={!stripe || processing}
        sx={{ height: 50 }}
      >
        {processing ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          `Pay $${orderData.total.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

// 主 Checkout 组件
function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);

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

  // Load cart data
  useEffect(() => {
    loadCartData();
  }, []);

  const loadCartData = async () => {
    try {
      setLoading(true);

      // 如果从购物车页面跳转过来，使用传递的商品
      if (location.state?.items) {
        setCartItems(location.state.items);
      } else {
        // 否则从后端获取购物车
        const response = await getCart();
        if (response.success && response.data) {
          const transformedItems = response.data.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            image:
              item.imagePath ||
              "https://via.placeholder.com/80x80?text=Product",
          }));
          setCartItems(transformedItems);
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      showSnackbar("Failed to load cart data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  // Handle payment success
  const handlePaymentSuccess = (order) => {
    setOrderData(order);
    setOrderSuccess(true);
    showSnackbar("Order placed successfully!", "success");

    // 3秒后跳转到订单历史页面
    setTimeout(() => {
      navigate("/orders");
    }, 3000);
  };

  // Handle payment error
  const handlePaymentError = (errorMessage) => {
    showSnackbar(errorMessage, "error");
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

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Your cart is empty. Please add items before checkout.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/products")}
          sx={{ mt: 2 }}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  // Success view
  if (orderSuccess) {
    return (
      <Box
        sx={{
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 6, textAlign: "center", maxWidth: 500 }}>
          <CheckCircleIcon
            sx={{ fontSize: 80, color: "success.main", mb: 2 }}
          />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Order Placed Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Thank you for your purchase. Your order has been confirmed.
          </Typography>
          {orderData && (
            <Box sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Order ID
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {orderData.id}
              </Typography>
            </Box>
          )}
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/orders")}
          >
            View Order History
          </Button>
        </Paper>
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
            onClick={() => navigate("/cart")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Checkout
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Order Summary */}
          <Grid item xs={12} md={7}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />

              <List>
                {cartItems.map((item) => (
                  <ListItem key={item.productId} sx={{ px: 0 }}>
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.productName}
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 1,
                        mr: 2,
                      }}
                    />
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="500">
                          {item.productName}
                        </Typography>
                      }
                      secondary={`Quantity: ${item.quantity}`}
                    />
                    <Typography variant="h6" fontWeight="bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{ mb: 1, display: "flex", justifyContent: "space-between" }}
              >
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1" fontWeight="500">
                  ${subtotal.toFixed(2)}
                </Typography>
              </Box>

              <Box
                sx={{ mb: 1, display: "flex", justifyContent: "space-between" }}
              >
                <Typography variant="body1">Tax (10%)</Typography>
                <Typography variant="body1" fontWeight="500">
                  ${tax.toFixed(2)}
                </Typography>
              </Box>

              <Box
                sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}
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

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error">
                  ${total.toFixed(2)}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Payment Form */}
          <Grid item xs={12} md={5}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Payment Information
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Elements stripe={stripePromise}>
                <CheckoutForm
                  orderData={{ total, items: cartItems }}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>

              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Your payment information is secure and encrypted.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
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

export default Checkout;
