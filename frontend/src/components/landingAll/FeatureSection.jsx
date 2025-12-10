import { Box, Grid, Typography, Card, CardContent } from "@mui/material";
import { ShoppingCart, Security, Chat } from "@mui/icons-material";

const features = [
  {
    icon: <ShoppingCart sx={{ fontSize: 40, color: "primary.main" }} />,
    title: "Easy Trading",
    text: "Post items to sell or find what you need in seconds.",
  },
  {
    icon: <Security sx={{ fontSize: 40, color: "primary.main" }} />,
    title: "Safe Transactions",
    text: "All users are verified for a secure campus marketplace.",
  },
  {
    icon: <Chat sx={{ fontSize: 40, color: "primary.main" }} />,
    title: "Smart Chatbot",
    text: "Integrated AI assistant to help you find deals fast.",
  },
];

export default function FeatureSection() {//  landing page
  return (
    <Box sx={{ py: 8, px: 3, backgroundColor: "#fafafa" }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
        Why Choose Second-hand Trade
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {features.map((f, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card sx={{ textAlign: "center", p: 2, height: "100%" }}>
              <CardContent>
                {f.icon}
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  {f.title}
                </Typography>
                <Typography color="text.secondary">{f.text}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
