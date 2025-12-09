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
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { request } from '../../services/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mock data for demonstration
  const mockProducts = [
    {
      id: '1',
      title: 'iPhone 13 Pro',
      category: 'Electronics',
      price: 899.99,
      condition: 'Like New',
      status: 'active',
      seller: 'john_doe',
      location: 'New York',
      createdAt: '2024-01-15',
      views: 1234,
      description: 'Like new condition, no scratches, original charger included.',
    },
    {
      id: '2',
      title: 'Sony PlayStation 5',
      category: 'Gaming',
      price: 499.99,
      condition: 'Good',
      status: 'active',
      seller: 'jane_smith',
      location: 'Los Angeles',
      createdAt: '2024-01-20',
      views: 2345,
      description: 'Disc edition with two controllers.',
    },
    {
      id: '3',
      title: 'MacBook Pro 14"',
      category: 'Computers',
      price: 1599.99,
      condition: 'Excellent',
      status: 'sold',
      seller: 'tech_guru',
      location: 'San Francisco',
      createdAt: '2024-01-10',
      views: 3456,
      description: 'M1 Pro chip, 16GB RAM, 512GB SSD.',
    },
    {
      id: '4',
      title: 'Canon EOS R6',
      category: 'Cameras',
      price: 1999.99,
      condition: 'Good',
      status: 'active',
      seller: 'photo_enthusiast',
      location: 'Chicago',
      createdAt: '2024-01-05',
      views: 4567,
      description: 'Professional mirrorless camera with two lenses.',
    },
    {
      id: '5',
      title: 'Nike Air Jordan 1',
      category: 'Fashion',
      price: 249.99,
      condition: 'New',
      status: 'inactive',
      seller: 'sneaker_head',
      location: 'Miami',
      createdAt: '2024-01-25',
      views: 5678,
      description: 'Brand new in box, size 10.',
    },
  ];

  // Categories for filter
  const categories = ['Electronics', 'Gaming', 'Computers', 'Cameras', 'Fashion', 'Furniture', 'Books', 'Sports'];

  // Fetch products (using mock data for now)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // In real application, use: const data = await request('/admin/products');
        // For now, simulate API call
        setTimeout(() => {
          setProducts(mockProducts);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // In real application: await request(`/admin/products/${selectedProduct.id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setSnackbar({ open: true, message: 'Product deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete product', severity: 'error' });
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      // In real application: await request(`/admin/products/${selectedProduct.id}`, { 
      //   method: 'PUT', 
      //   body: JSON.stringify(productData) 
      // });
      setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, ...productData } : p));
      setSnackbar({ open: true, message: 'Product updated successfully', severity: 'success' });
      setEditDialogOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update product', severity: 'error' });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterCategory('all');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'sold': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <ActiveIcon fontSize="small" />;
      case 'sold': return <ActiveIcon fontSize="small" color="warning" />;
      case 'inactive': return <InactiveIcon fontSize="small" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Products Management
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="sold">Sold</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                label="Category"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Condition</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Seller</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Views</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                  <TableRow hover key={product.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {product.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {product.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={product.category} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>
                        ${product.price.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>{product.condition}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(product.status)}
                        label={product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        color={getStatusColor(product.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{product.seller}</TableCell>
                    <TableCell>{product.location}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ViewIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        {product.views.toLocaleString()}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditProduct(product)}
                        color="primary"
                        title="Edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteProduct(product)}
                        color="error"
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product Title"
                    defaultValue={selectedProduct.title}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    defaultValue={selectedProduct.price}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select defaultValue={selectedProduct.status} label="Status">
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="sold">Sold</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    defaultValue={selectedProduct.description}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => handleSaveProduct(selectedProduct)}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedProduct?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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