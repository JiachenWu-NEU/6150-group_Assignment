const OPENAI_API_KEY = 'your-openai-api-key-here';

export const sendMessageToAI = async (message, conversationHistory = []) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful shopping assistant for a secondhand marketplace. Help users find products, answer questions about items, provide shopping advice, and recommend products based on their needs. Be friendly, concise, and helpful. Keep responses under 150 words.",
          },
          ...conversationHistory,
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || `API error: ${response.status}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      message: data.choices[0].message.content,
    };
  } catch (error) {
    console.error("Failed to send message to AI:", error);
    return {
      success: false,
      message: "Sorry, I encountered an error. Please try again.",
      error: error.message,
    };
  }
};
