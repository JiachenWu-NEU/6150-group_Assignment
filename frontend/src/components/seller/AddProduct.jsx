import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  FormControlLabel,
  Switch,
  Card,
  CardMedia,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../services/sellerApi";

function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    isOnSale: true,
    image: null,
  });

  const [errors, setErrors] = useState({});

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleBack = () => {
    navigate("/seller/products");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSwitchChange = (e) => {
    setFormData({ ...formData, isOnSale: e.target.checked });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        showSnackbar("Please choose valid photo(JPG、PNG、GIF)", "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showSnackbar("Photo size should not be larger than 5MB", "error");
        return;
      }

      setFormData({ ...formData, image: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      if (errors.image) {
        setErrors({ ...errors, image: "" });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please input product name";
    }

    if (!formData.price) {
      newErrors.price = "please input product price";
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = "please input valid price";
    }

    if (!formData.description.trim()) {
      newErrors.description = "please input product description";
    }

    if (!formData.image) {
      newErrors.image = "please choose a photo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showSnackbar("please fill all the blanks in the form", "error");
      return;
    }

    try {
      setLoading(true);

      // 创建 FormData
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("price", parseFloat(formData.price));
      submitData.append("description", formData.description);
      submitData.append("isOnSale", formData.isOnSale);
      submitData.append("image", formData.image);

      await createProduct(submitData);

      showSnackbar("Product published successfully", "success");

      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        navigate("/seller/products");
      }, 1500);
    } catch (error) {
      console.error("Failed to create product:", error);
      showSnackbar(error.message || "Published failed, please try again", "error");
    } finally {
      setLoading(false);
    }
  };

  // 显示 Snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // 关闭 Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* 顶部导航栏 */}
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            发布新商品
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Product Information
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* 商品名称 */}
            <TextField
              fullWidth
              label="Product name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              required
              sx={{ mb: 3 }}
            />

            {/* 价格 */}
            <TextField
              fullWidth
              label="Price (USD)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              error={!!errors.price}
              helperText={errors.price}
              required
              inputProps={{
                min: 0,
                step: 0.01,
              }}
              sx={{ mb: 3 }}
            />

            {/* 商品描述 */}
            <TextField
              fullWidth
              label="Product description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              error={!!errors.description}
              helperText={errors.description}
              required
              multiline
              rows={4}
              sx={{ mb: 3 }}
            />

            {/* 图片上传 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Product Photo *
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Choose a photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>

              {errors.image && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.image}
                </Alert>
              )}

              {/* 图片预览 */}
              {imagePreview && (
                <Card sx={{ maxWidth: 400, mx: "auto" }}>
                  <CardMedia
                    component="img"
                    image={imagePreview}
                    alt="preview"
                    sx={{ maxHeight: 300, objectFit: "contain" }}
                  />
                </Card>
              )}
            </Box>

            {/* 是否上架 */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isOnSale}
                  onChange={handleSwitchChange}
                  color="primary"
                />
              }
              label="Enable on sale"
              sx={{ mb: 3 }}
            />

            {/* 提交按钮 */}
            <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleBack}
                disabled={loading}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? "Publishing..." : "Publish Product"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Snackbar 通知 */}
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

export default AddProduct;
