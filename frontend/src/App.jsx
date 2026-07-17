import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import Homepage from "./components/Homepage";
import Login from "./components/Login";
import Errorpage from "./components/Errorpage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/auth/github/me", {
          credentials: "include", // Required to send session cookies to the backend
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else if (response.status === 401) {
          // Unauthorized means the user is not logged in yet.
          setUser(null);
        } else {
          // Any other status indicates a server or database error.
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

