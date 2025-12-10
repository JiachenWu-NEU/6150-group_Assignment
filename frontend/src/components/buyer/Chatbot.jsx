import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Avatar,
  CircularProgress,
  Zoom,
  Divider,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { sendMessageToAI } from "../../services/chatbotApi";

function Chatbot({ open, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your shopping assistant. How can I help you find the perfect secondhand item today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message to OpenAI
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      // Prepare conversation history (last 10 messages to save tokens)
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Send to OpenAI
      const response = await sendMessageToAI(inputMessage, conversationHistory);

      if (response.success) {
        const aiMessage = {
          role: "assistant",
          content: response.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Show error in chat
        const errorMessage = {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
        setError(response.error || "Connection failed");
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Close error alert
  const handleCloseError = () => {
    setError(null);
  };

  if (!open) return null;

  return (
    <Zoom in={open}>
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 380,
          height: 600,
          display: "flex",
          flexDirection: "column",
          zIndex: 1300,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "white",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BotIcon />
            <Typography variant="h6" fontWeight="bold">
              AI Shopping Assistant
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={handleCloseError} sx={{ m: 1 }}>
            {error}
          </Alert>
        )}

        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            bgcolor: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "flex-start",
                flexDirection: message.role === "user" ? "row-reverse" : "row",
              }}
            >
              {/* Avatar */}
              <Avatar
                sx={{
                  bgcolor:
                    message.role === "user"
                      ? "primary.main"
                      : message.isError
                      ? "error.main"
                      : "secondary.main",
                  width: 32,
                  height: 32,
                }}
              >
                {message.role === "user" ? (
                  <PersonIcon fontSize="small" />
                ) : (
                  <BotIcon fontSize="small" />
                )}
              </Avatar>

              {/* Message Bubble */}
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  maxWidth: "75%",
                  bgcolor:
                    message.role === "user"
                      ? "primary.light"
                      : message.isError
                      ? "error.light"
                      : "white",
                  color:
                    message.role === "user" || message.isError
                      ? "white"
                      : "text.primary",
                  borderRadius: 2,
                  wordBreak: "break-word",
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {message.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    opacity: 0.7,
                    fontSize: "0.65rem",
                  }}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Paper>
            </Box>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Avatar
                sx={{
                  bgcolor: "secondary.main",
                  width: 32,
                  height: 32,
                }}
              >
                <BotIcon fontSize="small" />
              </Avatar>
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  bgcolor: "white",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Thinking...
                </Typography>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Input Area */}
        <Box
          sx={{
            p: 2,
            bgcolor: "white",
            display: "flex",
            gap: 1,
            alignItems: "flex-end",
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Ask me anything about products..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              "&.Mui-disabled": {
                bgcolor: "action.disabledBackground",
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>

        {/* Footer Info */}
        <Box
          sx={{
            p: 1,
            bgcolor: "#f5f5f5",
            borderTop: "1px solid #e0e0e0",
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Powered by OpenAI GPT-3.5
          </Typography>
        </Box>
      </Paper>
    </Zoom>
  );
}

export default Chatbot;
