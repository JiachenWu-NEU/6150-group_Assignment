import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  // Form data state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Optional: handle loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please fill in all fields!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Send POST request to your backend
      const response = await fetch("http://localhost:3000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 400) throw new Error("Missing email or password.");
        if (response.status === 401) throw new Error("Invalid email or password.");
        throw new Error("Login failed.");
      }

      const data = await response.json();
      console.log("✅ API Response:", data);

      // Example response:
      // { message: "Login successfully.", data: { type: "admin", token: "..." } }

      // Save token to localStorage (for later authentication)
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("userType", data.data.type);

      alert(data.message || "Login successful!");

      // Redirect based on user type
      console.log("User type:", data.data.type);
      if (data.data.type === "admin") {
        navigate("/admin");
      } else if (data.data.type === "vender") {
        navigate("/seller/products");
      } else {
        navigate("/products");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        background: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>User Login</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: loading ? "#999" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{ color: "#007bff", cursor: "pointer" }}
          >
            Register here
          </span>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
