import { Box, Typography } from "@mui/material";
import { APP_NAME } from "../../config/appConfig";

export default function Footer() {
  return (
    <Box sx={{ py: 3, backgroundColor: "#1976d2", color: "white", textAlign: "center" }}>
      <Typography variant="body2">
        © {new Date().getFullYear()} {APP_NAME} | INFO 6150 Final Project
      </Typography>
    </Box>
  );
}
