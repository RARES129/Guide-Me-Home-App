import * as React from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "./RegisterForm";
import axios from "axios";
import { DEFAULT_BACKEND_API_URL } from "../../ProjectDefaults";

function RegisterHandler() {
  const navigate = useNavigate();

  const handleRegister = async (credentials) => {
    console.log(credentials);
    try {
      const response = await axios.post(
        `${DEFAULT_BACKEND_API_URL}/api/v1/user`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        // Adjust status code checks as needed
        alert("Registration successful!");
        navigate("/login");
      } else {
        alert("Failed to register. Please try again.");
      }
    } catch (error) {
      console.error("Error registering:", error);
      if (error.response) {
        // Error response from server
        alert(
          `Failed to register: ${
            error.response.data.message || "Please try again."
          }`
        );
      } else {
        // Network or other errors
        alert("An error occurred. Please try again later.");
      }
    }
  };

  return <RegisterForm onRegister={handleRegister} />;
}

export default RegisterHandler;
