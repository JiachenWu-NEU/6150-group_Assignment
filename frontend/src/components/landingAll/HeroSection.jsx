import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1976d2, #42a5f5)",
        color: "white",
        textAlign: "center",
        px: 2,
      }}
    >
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Buy & Sell Easily on Website
      </Typography>
      <Typography variant="h6" sx={{ mb: 4, maxWidth: 600 }}>
        A trusted second-hand trading platform for buyers and traders.
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        component={Link}
        to="/register"
        sx={{ fontSize: "1.1rem", px: 4, py: 1.5 }}
      >
        Get Started
      </Button>
    </Box>
  );
}
