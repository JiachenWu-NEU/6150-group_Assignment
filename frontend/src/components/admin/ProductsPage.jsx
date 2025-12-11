import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Button,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { request } from '../../services/api';

const ProductsPage = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // 这些 dialog 现在相当于占位，不影响布局
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = '/product/all';
      const response = await request(url);

      const apiProducts = response.data || [];

      const formattedProducts = apiProducts.map((product) => ({
        id: product._id || '',
        title: product.name || '',
        price: product.price || 0,
        status: product.isOnSale ? 'active' : 'inactive',
        seller: product.sellerId || 'Unknown',
        createdAt: product.createdAt
          ? new Date(product.createdAt).toISOString().split('T')[0]
          : 'N/A',
        description: product.description || '',
        imagePath: product.imagePath || '',
      }));

      setProducts(formattedProducts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
      setLoading(false);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to load products',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setPage(0);
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') setPage(0);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchTerm ||
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || product.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <ActiveIcon fontSize="small" />;
      case 'inactive':
        return <InactiveIcon fontSize="small" />;
      default:
        return null;
    }
  };

  if (loading && page === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && products.length === 0) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchProducts}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 0 } }}>
      {/* 标题：小屏略小、居中 */}
      <Typography
        variant={isSmallScreen ? 'h5' : 'h4'}
        gutterBottom
        sx={{
          mb: { xs: 2, md: 3 },
          fontWeight: 600,
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        Products Management
      </Typography>

      {/* Filter 区：小屏一行一个 */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: { xs: 2, md: 3 } }}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          // 小屏垂直布局，大屏水平
          direction={isSmallScreen ? 'column' : 'row'}
        >
          <Grid item xs={12} md={6} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <TextField
              fullWidth
              size={isSmallScreen ? 'small' : 'medium'}
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKey}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment:
                  searchTerm !== '' ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSearchTerm('');
                          setPage(0);
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <FormControl
              fullWidth
              size={isSmallScreen ? 'small' : 'medium'}
            >
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">On Sale</MenuItem>
                <MenuItem value="inactive">Not On Sale</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              size={isSmallScreen ? 'small' : 'medium'}
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 表格：Paper 控制横向滚动范围，Table 设置 minWidth，超出时在内部滑动 */}
      <Paper
        sx={{
          width: '100%',
          overflowX: 'auto', // 👈 横向滚动只在 Paper 内部
        }}
      >
        <TableContainer
          sx={{
            maxHeight: isSmallScreen ? 360 : 440,
          }}
        >
          <Table
            stickyHeader
            size={isSmallScreen ? 'small' : 'medium'}
            sx={{
              minWidth: 650, // 👈 小屏时 > 屏幕宽度，产生横向滚动条
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                {/* Seller ID 在超小屏可以隐藏一点，留空间给主要列 */}
                <TableCell
                  sx={{
                    fontWeight: 600,
                    display: { xs: 'none', sm: 'table-cell' },
                  }}
                >
                  Seller ID
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Image</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      No products found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow hover key={product.id}>
                    <TableCell>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500 }}
                        >
                          {product.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            maxWidth: isSmallScreen ? 180 : 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {product.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>
                        $
                        {typeof product.price === 'number'
                          ? product.price.toFixed(2)
                          : '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(product.status)}
                        label={
                          product.status === 'active'
                            ? 'On Sale'
                            : 'Not On Sale'
                        }
                        color={getStatusColor(product.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {product.seller}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {product.imagePath ? (
                        <Box
                          component="img"
                          src={'http://localhost:3000' + product.imagePath}
                          alt={product.title}
                          sx={{
                            width: 50,
                            height: 50,
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          No image
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* 下面两个 Dialog 和 snackbar 逻辑你原来有，我保持不动，只是占位 */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Product (Disabled)</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Editing products is currently disabled as the backend API only
            supports read operations.
          </Alert>
          {selectedProduct && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Product: {selectedProduct.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Status: {selectedProduct.status}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Product (Disabled)</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Deleting products is currently disabled as the backend API only
            supports read operations.
          </Alert>
          <Typography>
            Product "{selectedProduct?.title}" cannot be deleted through this
            interface.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductsPage;