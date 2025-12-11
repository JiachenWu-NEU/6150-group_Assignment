import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

import { APP_NAME } from "../../config/appConfig";

export default function Navbar() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {APP_NAME}
        </Typography>
        <div>
          <Button color="inherit" component={Link} to="/login">Login</Button>
          <Button
            color="secondary"
            variant="contained"
            component={Link}
            to="/register"
            sx={{ ml: 2 }}
          >
            Sign Up
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  );
}
