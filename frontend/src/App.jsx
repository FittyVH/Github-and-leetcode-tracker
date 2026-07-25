import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import Homepage from "./components/Homepage";
import Login from "./components/Login";
import Errorpage from "./components/Errorpage";

import { API_BASE_URL } from "./config";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If GitHub just redirected back with a token in the URL, save it
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");
        if (urlToken) {
          localStorage.setItem("token", urlToken);
          // Clean the token out of the URL without a page reload
          window.history.replaceState({}, document.title, "/");
        }

        const token = localStorage.getItem("token");

        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/github/me`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else if (response.status === 401) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>Checking session...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return <Errorpage />;
  }

  return <>{user ? <Homepage user={user} /> : <Login />}</>;
}

// --- STYLED COMPONENTS FOR LOADING STATE ---

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f3f4f6;
  font-family: sans-serif;
`;

const Spinner = styled.div`
  border: 4px solid #e5e7eb;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 16px;
`;

const LoadingText = styled.p`
  color: #4b5563;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
`;

export default App;

