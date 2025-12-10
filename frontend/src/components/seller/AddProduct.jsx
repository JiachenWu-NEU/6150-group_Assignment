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

  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    isOnSale: true,
    image: null,
  });

  // 表单验证错误
  const [errors, setErrors] = useState({});

  // Snackbar 状态
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // 返回商品列表
  const handleBack = () => {
    navigate("/seller/products");
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // 清除该字段的错误
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // 处理开关变化
  const handleSwitchChange = (e) => {
    setFormData({ ...formData, isOnSale: e.target.checked });
  };

  // 处理图片选择
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 验证文件类型
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        showSnackbar("请选择有效的图片文件（JPG、PNG、GIF）", "error");
        return;
      }

      // 验证文件大小（最大5MB）
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar("图片大小不能超过5MB", "error");
        return;
      }

      setFormData({ ...formData, image: file });

      // 生成预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // 清除图片错误
      if (errors.image) {
        setErrors({ ...errors, image: "" });
      }
    }
  };

  // 验证表单
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "请输入商品名称";
    }

    if (!formData.price) {
      newErrors.price = "请输入价格";
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = "价格必须大于0";
    }

    if (!formData.description.trim()) {
      newErrors.description = "请输入商品描述";
    }

    if (!formData.image) {
      newErrors.image = "请上传商品图片";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showSnackbar("请填写所有必填项", "error");
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

      showSnackbar("商品发布成功！", "success");

      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        navigate("/seller/products");
      }, 1500);
    } catch (error) {
      console.error("Failed to create product:", error);
      showSnackbar(error.message || "发布失败，请重试", "error");
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
            商品信息
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* 商品名称 */}
            <TextField
              fullWidth
              label="商品名称"
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
              label="价格 (USD)"
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
              label="商品描述"
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
                商品图片 *
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                选择图片
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
                    alt="预览"
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
              label="立即上架"
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
                {loading ? "发布中..." : "发布商品"}
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
