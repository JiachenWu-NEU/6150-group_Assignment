import { API_BASE_URL } from "./api";
import { getAuthToken } from "../utils/auth";

export const getProfile = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return await response.json();
};

export const updateProfile = async (profileData) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/user/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update profile");
  }

  return await response.json();
};