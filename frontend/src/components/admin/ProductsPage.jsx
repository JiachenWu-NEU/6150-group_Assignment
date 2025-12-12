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
  Delete as DeleteIcon,
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

  // 删除相关 state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 拉取所有商品
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = '/product/all';
      const response = await request(url);

      const apiProducts = response.data || [];

      const formattedProducts = apiProducts.map((product) => ({
        id: product.id || '',
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

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    setDeleting(true);
    try {
      await request(`/product/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      setProducts((prev) =>
        prev.filter((p) => p.id !== selectedProduct.id)
      );

      setSnackbar({
        open: true,
        message: 'Product deleted successfully.',
        severity: 'success',
      });

      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to delete product';
      setSnackbar({
        open: true,
        message: msg,
        severity: 'error',
      });
    } finally {
      setDeleting(false);
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

      {/* Filters */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: { xs: 2, md: 3 } }}>
        <Grid
          container
          spacing={2}
          alignItems="center"
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

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            <FormControl fullWidth size={isSmallScreen ? 'small' : 'medium'}>
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

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
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

      {/* Table */}
      <Paper
        sx={{
          width: '100%',
          overflowX: 'auto',
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
              minWidth: 650,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    display: { xs: 'none', sm: 'table-cell' },
                  }}
                >
                  Seller ID
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
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
                    <TableCell>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(product)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => (!deleting ? setDeleteDialogOpen(false) : null)}
      >
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography sx={{ mb: 1 }}>
            Are you sure you want to delete product{' '}
            <strong>"{selectedProduct?.title}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {selectedProduct?.id}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : null}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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