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
  Avatar,
  Alert,
  Snackbar,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Email as EmailIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { request } from '../../services/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({}); // Track which users are being updated

  // Fetch users from backend API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = '/user/all';
      const response = await request(url);
      
      console.log('=== FETCH USERS DEBUG ===');
      console.log('Full API Response:', response);
      console.log('Response data:', response.data);
      
      const apiUsers = response.data || [];
      
      if (apiUsers.length > 0) {
        console.log('First user (raw from API):', apiUsers[0]);
        console.log('All keys in first user:', Object.keys(apiUsers[0]));
      }
      
      // Map API fields - try multiple possible ID field names
      const formattedUsers = apiUsers.map((user, index) => {
        // Try to find ID from various possible field names
        const userId = user._id || user.id || user.userId || user.user_id || user.ID;
        
        console.log(`User ${index} mapping:`, {
          raw_user: user,
          extracted_id: userId,
          username: user.username
        });
        
        if (!userId) {
          console.error(`❌ User ${index} has NO valid ID!`, user);
        }
        
        return {
          id: userId || '',
          username: user.username || '',
          email: user.email || '',
          type: user.type || 'user',
          status: user.isAvailable ? 'active' : 'inactive',
          address: user.address || 'N/A',
          avatar: user.username ? user.username.substring(0, 2).toUpperCase() : 'U',
        };
      });
      
      console.log('Formatted users (first 3):', formattedUsers.slice(0, 3));
      console.log('Users without IDs:', formattedUsers.filter(u => !u.id));
      
      setUsers(formattedUsers);
      setTotalUsers(formattedUsers.length);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
      setLoading(false);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to load users',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Client-side filtering
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || user.type === filterType;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate pagination for filtered results
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleToggleUserStatus = async (user) => {
    if (!user.id) {
      setSnackbar({
        open: true,
        message: 'Cannot update user status - User ID is missing',
        severity: 'error'
      });
      return;
    }

    // Set loading state for this specific user
    setUpdatingStatus(prev => ({ ...prev, [user.id]: true }));

    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      console.log('=== UPDATE USER STATUS ===');
      console.log('User:', user.username);
      console.log('User ID:', user.id);
      console.log('Current status:', user.status);
      console.log('Attempting to change to:', newStatus);
      
      if (newStatus === 'inactive') {
        // Disable user using PATCH /user/:id/disable
        const disableUrl = `/user/${user.id}/disable`;
        console.log('Disabling user with URL:', disableUrl);
        
        const response = await request(disableUrl, {
          method: 'PATCH'
        });
        
        console.log('Disable successful:', response);
        
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === user.id 
              ? { ...u, status: 'inactive' }
              : u
          )
        );
        
        setSnackbar({
          open: true,
          message: `User "${user.username}" has been disabled (cannot login)`,
          severity: 'success'
        });
        
      } else {
        // Enable user - this endpoint might not exist
        // Try using PUT /user/:id with isAvailable: true
        const enableUrl = `/user/${user.id}/disable`;
        console.log('Attempting to enable user with URL:', enableUrl);
        
        try {
          const response = await request(enableUrl, {
            method: 'PATCH'
          });
          
          console.log('Enable successful:', response);
          
          // Update local state
          setUsers(prevUsers => 
            prevUsers.map(u => 
              u.id === user.id 
                ? { ...u, status: 'active' }
                : u
            )
          );
          
          setSnackbar({
            open: true,
            message: `User "${user.username}" has been enabled (can login)`,
            severity: 'success'
          });
        } catch (enableErr) {
          console.error('Enable endpoint not available:', enableErr);
          setSnackbar({
            open: true,
            message: 'Cannot enable user - backend only supports disabling users. Contact backend developer to add enable endpoint.',
            severity: 'warning'
          });
        }
      }
      
    } catch (err) {
      console.error('=== UPDATE STATUS ERROR ===');
      console.error('Full error:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Failed to update user status';
      
      if (err.response?.status === 404) {
        errorMessage = `Endpoint not found (404). Please verify the backend route configuration.`;
      } else if (err.response?.status === 403) {
        errorMessage = 'Permission denied (403). Admin access required.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Unauthorized (401). Please log in as admin.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 'Bad request (400).';
      } else if (err.response) {
        errorMessage = err.response.data?.message || `Server error (${err.response.status})`;
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      // Clear loading state
      setUpdatingStatus(prev => {
        const newState = { ...prev };
        delete newState[user.id];
        return newState;
      });
    }
  };

  const handleDeleteUser = (user) => {
    console.log('handleDeleteUser called with:', user);
    
    if (!user.id || user.id === '') {
      setSnackbar({
        open: true,
        message: `Cannot delete user "${user.username}" - User ID is missing. Check console for details.`,
        severity: 'error'
      });
      return;
    }
    
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser || !selectedUser.id) {
      console.error('Cannot delete - selectedUser:', selectedUser);
      setSnackbar({
        open: true,
        message: 'Invalid user ID. Cannot delete user.',
        severity: 'error'
      });
      return;
    }
    
    setDeleting(true);
    
    try {
      console.log('=== DELETE USER DEBUG ===');
      console.log('Selected user:', selectedUser);
      console.log('User ID:', selectedUser.id);
      console.log('User ID type:', typeof selectedUser.id);
      
      const deleteUrl = `/user/${selectedUser.id}`;
      console.log('DELETE URL:', deleteUrl);
      
      const response = await request(deleteUrl, {
        method: 'DELETE',
      });
      
      console.log('Delete successful:', response);
      
      // Remove from local state
      setUsers(prevUsers => prevUsers.filter(u => u.id !== selectedUser.id));
      setTotalUsers(prev => prev - 1);
      
      setSnackbar({ 
        open: true, 
        message: `User "${selectedUser.username}" deleted successfully`, 
        severity: 'success' 
      });
      
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      
    } catch (err) {
      console.error('=== DELETE ERROR ===');
      console.error('Error:', err);
      console.error('Response:', err.response);
      console.error('Status:', err.response?.status);
      console.error('Data:', err.response?.data);
      
      let errorMessage = 'Failed to delete user';
      
      if (err.response?.status === 404) {
        errorMessage = `User not found (404). Attempted URL: /user/${selectedUser.id}. Check if the user ID is correct.`;
      } else if (err.response?.status === 403) {
        errorMessage = 'Permission denied (403). You need admin privileges.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Unauthorized (401). Please log in as admin.';
      } else if (err.response) {
        errorMessage = err.response.data?.message || `Server error (${err.response.status})`;
      } else if (err.request) {
        errorMessage = 'No response from server.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    } finally {
      setDeleting(false);
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
    setFilterType('all');
    setFilterStatus('all');
    setPage(0);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(0);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'admin': return 'error';
      case 'seller': return 'warning';
      case 'buyer': return 'info';
      case 'user': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error';
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? <ActiveIcon fontSize="small" /> : <InactiveIcon fontSize="small" />;
  };

  if (loading && page === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && users.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={fetchUsers}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // Count users without IDs
  const usersWithoutIds = users.filter(u => !u.id || u.id === '').length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Users Management
      </Typography>

      {/* API Information */}
      <Alert severity={usersWithoutIds > 0 ? 'warning' : 'info'} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Admin Controls:</strong> You can disable users (prevent login) and delete users from the system.
          <br/>
          <em>Note: Backend API (PATCH /user/:id/disable) currently only supports disabling users. Enabling might require backend update.</em>
          {usersWithoutIds > 0 && (
            <><br/><strong style={{color: 'red'}}>⚠️ Warning: {usersWithoutIds} user(s) have missing IDs and cannot be modified. Check console for details.</strong></>
          )}
        </Typography>
      </Alert>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => { setSearchTerm(''); setPage(0); }}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>User Type</InputLabel>
              <Select
                value={filterType}
                label="User Type"
                onChange={(e) => { setFilterType(e.target.value); setPage(0); }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="seller">Seller</MenuItem>
                <MenuItem value="buyer">Buyer</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Available</MenuItem>
                <MenuItem value="inactive">Unavailable</MenuItem>
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
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">No users found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user, index) => (
                  <TableRow hover key={user.id || `user-${index}`}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            mr: 2,
                            bgcolor: user.type === 'admin' ? 'error.main' : 
                                    user.type === 'seller' ? 'warning.main' : 
                                    user.type === 'buyer' ? 'info.main' : 'primary.main'
                          }}
                        >
                          {user.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.username}
                          </Typography>
                          <Typography variant="caption" color={user.id ? 'text.secondary' : 'error'}>
                            ID: {user.id ? user.id.substring(0, 8) + '...' : '⚠️ NO ID'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{user.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.type.charAt(0).toUpperCase() + user.type.slice(1)} 
                        color={getTypeColor(user.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          icon={getStatusIcon(user.status)}
                          label={user.status === 'active' ? 'Available' : 'Unavailable'}
                          color={getStatusColor(user.status)}
                          size="small"
                          variant="outlined"
                        />
                        <Tooltip title={user.status === 'active' ? 'Disable user (prevent login)' : 'Enable user (allow login)'}>
                          <span>
                            <Switch
                              size="small"
                              checked={user.status === 'active'}
                              onChange={() => handleToggleUserStatus(user)}
                              disabled={!user.id || updatingStatus[user.id]}
                              color="success"
                            />
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(user)}
                        color="error"
                        title={user.id ? "Delete User" : "Cannot delete - No user ID"}
                        disabled={deleting || !user.id || user.id === ''}
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
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Warning:</strong> This action cannot be undone!
          </Alert>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to delete user <strong>"{selectedUser?.username}"</strong>?
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Username:</strong> {selectedUser?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Email:</strong> {selectedUser?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Type:</strong> {selectedUser?.type}
            </Typography>
            <Typography variant="body2" color={selectedUser?.id ? 'text.secondary' : 'error'} sx={{ fontWeight: selectedUser?.id ? 'normal' : 'bold' }}>
              <strong>User ID:</strong> {selectedUser?.id || '⚠️ MISSING - Cannot delete'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            disabled={deleting || !selectedUser?.id}
            startIcon={deleting ? <CircularProgress size={16} /> : null}
          >
            {deleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;