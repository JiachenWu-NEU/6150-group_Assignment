import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box sx={{ py: 3, backgroundColor: "#1976d2", color: "white", textAlign: "center" }}>
      <Typography variant="body2">
        © {new Date().getFullYear()} CampusTrade | INFO 6150 Final Project
      </Typography>
    </Box>
  );
}
