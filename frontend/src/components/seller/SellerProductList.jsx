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
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Store as StoreIcon,
} from "@mui/icons-material";
import { getUserInfo, logout } from "../../utils/auth";
import {
  getMyProducts,
  deleteProduct,
  updateProductAvailability,
  getVenderOrders,
  updateProduct,
} from "../../services/sellerApi";
import { useNavigate } from "react-router-dom";

function SellerProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0: 在售商品, 1: 已下架, 2: 已售出

  // 编辑对话框状态
  const [editDialog, setEditDialog] = useState({
    open: false,
    product: null,
  });
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    description: "",
  });

  // 删除确认对话框
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    productId: null,
  });

  // Snackbar 状态
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // 获取用户信息
  useEffect(() => {
    const user = getUserInfo();
    if (!user) {
      navigate("/login");
    } else {
      setUserInfo(user);
    }
  }, [navigate]);

  // 获取商品和订单数据
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 获取商品列表
      const productsResponse = await getMyProducts();
      if (productsResponse.data) {
        // 从后端获取的商品数据中，过滤出属于当前卖家的商品
        const userId = getUserInfo()?.id;
        const myProducts = productsResponse.data.filter(
          (product) => product.sellerId === userId
        );
        setProducts(myProducts);
      }

      // 获取销售记录
      const ordersResponse = await getVenderOrders();
      if (ordersResponse.data) {
        setOrders(ordersResponse.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showSnackbar("加载数据失败，请重试", "error");
    } finally {
      setLoading(false);
    }
  };

  // 切换标签页
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 跳转到新增商品页面
  const handleAddProduct = () => {
    navigate("/seller/add-product");
  };

  // 跳转到个人详情页面
  const handleProfile = () => {
    navigate("/seller/profile");
  };

  // 打开编辑对话框
  const handleEditClick = (product) => {
    setEditForm({
      name: product.name,
      price: product.price,
      description: product.description,
    });
    setEditDialog({ open: true, product });
  };

  // 关闭编辑对话框
  const handleEditClose = () => {
    setEditDialog({ open: false, product: null });
  };

  // 保存编辑
  const handleEditSave = async () => {
    try {
      await updateProduct(editDialog.product.id, editForm);
      showSnackbar("商品更新成功", "success");
      handleEditClose();
      fetchData(); // 重新加载数据
    } catch (error) {
      console.error("Failed to update product:", error);
      showSnackbar("更新失败，请重试", "error");
    }
  };

  // 打开删除确认对话框
  const handleDeleteClick = (productId) => {
    setDeleteDialog({ open: true, productId });
  };

  // 关闭删除对话框
  const handleDeleteClose = () => {
    setDeleteDialog({ open: false, productId: null });
  };

  // 确认删除
  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(deleteDialog.productId);
      showSnackbar("商品删除成功", "success");
      handleDeleteClose();
      fetchData(); // 重新加载数据
    } catch (error) {
      console.error("Failed to delete product:", error);
      showSnackbar("删除失败，请重试", "error");
    }
  };

  // 切换商品上下架状态
  const handleToggleAvailability = async (productId, currentStatus) => {
    try {
      await updateProductAvailability(productId, !currentStatus);
      showSnackbar(
        currentStatus ? "商品已下架" : "商品已上架",
        "success"
      );
      fetchData(); // 重新加载数据
    } catch (error) {
      console.error("Failed to toggle availability:", error);
      showSnackbar("操作失败，请重试", "error");
    }
  };

  // 登出
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 显示 Snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // 关闭 Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 根据标签页筛选商品
  const getFilteredProducts = () => {
    if (tabValue === 0) {
      // 在售商品
      return products.filter((p) => p.isOnSale);
    } else if (tabValue === 1) {
      // 已下架商品
      return products.filter((p) => !p.isOnSale);
    } else {
      // 已售出商品（从订单中获取）
      const soldProductIds = new Set(orders.map((order) => order.productId));
      return products.filter((p) => soldProductIds.has(p.id));
    }
  };

  const filteredProducts = getFilteredProducts();

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
      {/* 顶部导航栏 */}
      <AppBar position="sticky">
        <Toolbar>
          <StoreIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            卖家中心
          </Typography>

          {/* 用户信息 */}
          {userInfo && (
            <Chip
              icon={<PersonIcon />}
              label={userInfo.username || "卖家"}
              color="secondary"
              sx={{ mr: 2 }}
              onClick={handleProfile}
            />
          )}

          {/* 登出按钮 */}
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* 页面标题和添加按钮 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4">我的商品</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
            size="large"
          >
            发布新商品
          </Button>
        </Box>

        {/* 标签页 */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              label={`在售商品 (${
                products.filter((p) => p.isOnSale).length
              })`}
            />
            <Tab
              label={`已下架 (${
                products.filter((p) => !p.isOnSale).length
              })`}
            />
            <Tab label={`已售出 (${orders.length})`} />
          </Tabs>
        </Box>

        {/* 商品网格 */}
        {filteredProducts.length === 0 ? (
          <Alert severity="info">
            {tabValue === 0 && "暂无在售商品"}
            {tabValue === 1 && "暂无下架商品"}
            {tabValue === 2 && "暂无售出记录"}
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
                    position: "relative",
                  }}
                >
                  {/* 状态标签 */}
                  {!product.isOnSale && (
                    <Chip
                      label="已下架"
                      color="default"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* 商品图片 */}
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      product.imagePath
                        ? `http://localhost:3000${product.imagePath}`
                        : "https://via.placeholder.com/300x200?text=No+Image"
                    }
                    alt={product.name}
                    sx={{ objectFit: "cover" }}
                  />

                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* 商品名称 */}
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
                      }}
                    >
                      {product.name}
                    </Typography>

                    {/* 商品描述 */}
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

                    {/* 价格 */}
                    <Typography variant="h5" color="error" fontWeight="bold">
                      ${product.price.toLocaleString()}
                    </Typography>

                    {/* 发布日期 */}
                    <Typography variant="caption" color="text.secondary">
                      发布时间:{" "}
                      {new Date(product.createdAt).toLocaleDateString()}
                    </Typography>

                    {/* 已售出数量（如果是已售出标签页） */}
                    {tabValue === 2 && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={`已售: ${
                            orders.filter((o) => o.productId === product.id)
                              .length
                          } 件`}
                          color="success"
                          size="small"
                        />
                      </Box>
                    )}
                  </CardContent>

                  {/* 操作按钮 */}
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditClick(product)}
                      fullWidth
                    >
                      编辑
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color={product.isOnSale ? "warning" : "success"}
                      startIcon={
                        product.isOnSale ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )
                      }
                      onClick={() =>
                        handleToggleAvailability(product.id, product.isOnSale)
                      }
                      fullWidth
                    >
                      {product.isOnSale ? "下架" : "上架"}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(product.id)}
                      fullWidth
                    >
                      删除
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* 编辑商品对话框 */}
      <Dialog open={editDialog.open} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>编辑商品</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="商品名称"
            fullWidth
            value={editForm.name}
            onChange={(e) =>
              setEditForm({ ...editForm, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="价格"
            type="number"
            fullWidth
            value={editForm.price}
            onChange={(e) =>
              setEditForm({ ...editForm, price: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="商品描述"
            fullWidth
            multiline
            rows={4}
            value={editForm.description}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>取消</Button>
          <Button onClick={handleEditSave} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteClose}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定要删除这个商品吗？此操作无法撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>取消</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>

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

export default SellerProductList;
