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

import { getProfile, updateProfile } from "../../services/profileApi"

function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // profile data
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    address: "",
    type: "",
  });

  // edit form
  const [editForm, setEditForm] = useState({
    username: "",
    address: "",
  });

  // snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleBack = () => {
    if (profile.type === "buyer") {
      navigate("/products");
    } else {
      navigate("/seller/products");
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // make sure user is logged in (token in localStorage)
      const localUser = getUserInfo();
      if (!localUser) {
        navigate("/login");
        return;
      }

      try {
        const profileResponse = await getProfile();
        if (profileResponse.data) {
          const { username, email, address, type } = profileResponse.data || {};
          setProfile({
            username: username || "",
            email: email || "",
            address: address || "",
            type: type || localUser.type,
          });
          setEditForm({
            username: username || "",
            address: address || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile from API:", err);
        setEditForm({
            username: localUser.username || "",
            address: localUser.address || "",
        });
        showSnackbar("Failed to load profile from server.", "error");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      showSnackbar("Failed to load profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditForm({
      username: profile.username,
      address: profile.address,
    });
    setEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await updateProfile(editForm);

      // update local state
      setProfile({ ...profile, ...editForm });
      setEditing(false);
      showSnackbar("Profile updated successfully.", "success");

      // sync localStorage
      const userInfo = getUserInfo();
      if (userInfo) {
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ ...userInfo, ...editForm })
        );
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      showSnackbar(error.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

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
      {/* Top AppBar */}
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
            Vender Profile
          </Typography>
          {!editing && (
            <Button
              color="inherit"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
            >
              Edit
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {/* Profile info */}
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
              {profile.username
                ? profile.username.charAt(0).toUpperCase()
                : "S"}
            </Avatar>
            <Box>
              <Typography variant="h5">
                {profile.username || "Vender"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.type} account
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box>
            {editing ? (
              // edit mode
              <Box>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={editForm.username}
                  onChange={handleInputChange}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <PersonIcon sx={{ mr: 1, color: "action.active" }} />
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={editForm.address}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <HomeIcon sx={{ mr: 1, color: "action.active" }} />
                    ),
                  }}
                />

                <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={
                      saving ? <CircularProgress size={20} /> : <SaveIcon />
                    }
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </Box>
              </Box>
            ) : (
              // view mode
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, color: "action.active" }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Username
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ ml: 4 }}>
                    {profile.username || "Not set"}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, color: "action.active" }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ ml: 4 }}>
                    {profile.email || "Not set"}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <HomeIcon sx={{ mr: 1, color: "action.active" }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Address
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ ml: 4 }}>
                    {profile.address || "Not set"}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Snackbar */}
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

export default Profile;
