import React, { useState, useEffect } from "react";
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
  Divider,
  Avatar,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  ShoppingBag as ShoppingBagIcon,
  AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getUserInfo } from "../../utils/auth";
import {
  getSellerProfile,
  updateSellerProfile,
  getVenderOrders,
  getMyProducts,
} from "../../services/sellerApi";

function SellerProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 用户信息
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    address: "",
    type: "",
  });

  // 编辑表单
  const [editForm, setEditForm] = useState({
    username: "",
    address: "",
  });

  // 统计数据
  const [stats, setStats] = useState({
    totalProducts: 0,
    onSaleProducts: 0,
    totalSales: 0,
  });

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

  // 加载数据
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 获取用户信息（如果后端没有profile接口，从localStorage获取）
      const userInfo = getUserInfo();
      if (userInfo) {
        setProfile({
          username: userInfo.username || "",
          email: userInfo.email || "",
          address: userInfo.address || "",
          type: userInfo.type || "vender",
        });
        setEditForm({
          username: userInfo.username || "",
          address: userInfo.address || "",
        });
      }

      // 获取商品统计
      try {
        const productsResponse = await getMyProducts();
        if (productsResponse.data) {
          const userId = getUserInfo()?.id;
          const myProducts = productsResponse.data.filter(
            (product) => product.sellerId === userId
          );
          const onSale = myProducts.filter((p) => p.isOnSale).length;

          setStats((prev) => ({
            ...prev,
            totalProducts: myProducts.length,
            onSaleProducts: onSale,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }

      // 获取销售统计
      try {
        const ordersResponse = await getVenderOrders();
        if (ordersResponse.data) {
          setStats((prev) => ({
            ...prev,
            totalSales: ordersResponse.data.length,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      showSnackbar("加载个人信息失败", "error");
    } finally {
      setLoading(false);
    }
  };

  // 开始编辑
  const handleEditClick = () => {
    setEditing(true);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditForm({
      username: profile.username,
      address: profile.address,
    });
    setEditing(false);
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  // 保存修改
  const handleSave = async () => {
    try {
      setSaving(true);

      await updateSellerProfile(editForm);

      // 更新本地状态
      setProfile({ ...profile, ...editForm });
      setEditing(false);
      showSnackbar("个人信息更新成功", "success");

      // 更新 localStorage 中的用户信息
      const userInfo = getUserInfo();
      if (userInfo) {
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ ...userInfo, ...editForm })
        );
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      showSnackbar(error.message || "更新失败，请重试", "error");
    } finally {
      setSaving(false);
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
            个人信息
          </Typography>
          {!editing && (
            <Button color="inherit" startIcon={<EditIcon />} onClick={handleEditClick}>
              编辑
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {/* 统计卡片 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <ShoppingBagIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">商品总数</Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {stats.totalProducts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <ShoppingBagIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">在售商品</Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {stats.onSaleProducts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <AttachMoneyIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">总销量</Typography>
                </Box>
                <Typography variant="h4" color="error">
                  {stats.totalSales}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 个人信息 */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mr: 3,
                bgcolor: "primary.main",
                fontSize: "2rem",
              }}
            >
              {profile.username ? profile.username.charAt(0).toUpperCase() : "S"}
            </Avatar>
            <Box>
              <Typography variant="h5">{profile.username || "卖家"}</Typography>
              <Typography variant="body2" color="text.secondary">
                卖家账户
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box>
            {editing ? (
              // 编辑模式
              <Box>
                <TextField
                  fullWidth
                  label="用户名"
                  name="username"
                  value={editForm.username}
                  onChange={handleInputChange}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: "action.active" }} />,
                  }}
                />

                <TextField
                  fullWidth
                  label="地址"
                  name="address"
                  value={editForm.address}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <HomeIcon sx={{ mr: 1, color: "action.active" }} />,
                  }}
                />

                {/* 操作按钮 */}
                <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    取消
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "保存中..." : "保存"}
                  </Button>
                </Box>
              </Box>
            ) : (
              // 查看模式
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, color: "action.active" }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      用户名
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ ml: 4 }}>
                    {profile.username || "未设置"}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, color: "action.active" }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      邮箱
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ ml: 4 }}>
                    {profile.email || "未设置"}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <HomeIcon sx={{ mr: 1, color: "action.active" }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      地址
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ ml: 4 }}>
                    {profile.address || "未设置"}
                  </Typography>
                </Box>
              </Box>
            )}
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

export default SellerProfile;
