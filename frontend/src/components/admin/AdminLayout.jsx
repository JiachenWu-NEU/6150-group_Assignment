import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ProductsIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { APP_NAME } from "../../config/appConfig";

const drawerWidth = 240;

// AppBar 默认高度：xs 是 56，其它是 64，这里直接写死 64 就够用了
const APP_BAR_HEIGHT = 64;

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  const menuItems = [
    { text: 'Products', icon: <ProductsIcon />, path: '/admin/products' },
    { text: 'Users', icon: <UsersIcon />, path: '/admin/users' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    sessionStorage.clear();
    navigate('/login');
    setLogoutDialogOpen(false);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  // ✅ Drawer 内部：用 flex 布局 + 中间区域滚动 + 底部 logout 固定
  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 顶部 Logo 区 */}
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.main' }}>
        <StoreIcon sx={{ fontSize: 48, color: 'white', mb: 1 }} />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          {APP_NAME}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Admin Panel
        </Typography>
      </Box>

      <Divider />

      {/* 中间菜单区域：独立滚动 */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => {
                // 在手机上点击菜单后收起 Drawer
                if (isMobile) setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* 底部 Logout：永远贴在 Drawer 最底端 */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <ListItem
          button
          onClick={handleLogoutClick}
          sx={{
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'error.light',
              '& .MuiListItemIcon-root': {
                color: 'error.main',
              },
              '& .MuiListItemText-primary': {
                color: 'error.main',
              },
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* 顶部 AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
      
          // 👇 关键：小屏保持原来的主色，大屏用白色+细边框
          backgroundColor: {
            xs: 'primary.main',
            sm: 'background.paper',
          },
          color: {
            xs: 'inherit',
            sm: 'text.primary',
          },
          boxShadow: {
            xs: 4,
            sm: 0,
          },
          borderBottom: {
            sm: '1px solid',
            xs: 'none',
          },
          borderColor: {
            sm: 'divider',
          },
              }}
            >
        <Toolbar sx={{ minHeight: APP_BAR_HEIGHT, px: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'space-between',
              maxWidth: 1200,
              mx: 'auto', // 让大屏内容居中一点，看起来更像“主内容区”的顶栏
            }}
          >
            {/* 左侧：菜单按钮（只在小屏显示）+ 标题（只在大屏显示） */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1, display: { sm: 'none' } }} // 只在小屏显示
              >
                <MenuIcon />
              </IconButton>
      
              {/* 大屏标题，小屏不用，避免和 Drawer 标题重复 */}
              <Typography
                variant="h6"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  fontWeight: 600,
                }}
              >
              </Typography>
            </Box>
      
            {/* 右侧：管理员信息 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'secondary.main',
                  fontSize: '1rem',
                  // 大屏白色顶栏下，加个细边让头像更清楚
                  border: { sm: '2px solid rgba(0,0,0,0.06)', xs: 'none' },
                }}
              >
                A
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Admin
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(0,0,0,0.6)' }}
                >
                  admin@example.com
                </Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 侧栏 Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* 手机端：temporary Drawer，要让它从 AppBar 下面开始 */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                mt: `${APP_BAR_HEIGHT}px`,                     // ✅ 从 AppBar 下方开始
                height: `calc(100% - ${APP_BAR_HEIGHT}px)`,   // ✅ 高度减去 AppBar
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          // 大屏：permanent Drawer，也必须让它避开 AppBar
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                mt: `${APP_BAR_HEIGHT}px`,                     // ✅ 重点：同样往下移
                height: `calc(100% - ${APP_BAR_HEIGHT}px)`,   // ✅ 高度减去 AppBar
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* 主内容区域：单独滚动，不影响 Drawer 高度 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: `${APP_BAR_HEIGHT}px`,
          p: { xs: 2, md: 3 },
          backgroundColor: '#fafafa',
          overflow: 'auto', // ✅ 只让主内容滚动
        }}
      >
        <Outlet />
      </Box>

      {/* Logout 确认弹窗 */}
      <Dialog open={logoutDialogOpen} onClose={handleLogoutCancel}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to logout from the admin panel?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            color="error"
            variant="contained"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminLayout;