import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import Homepage from "./components/Homepage";
import Login from "./components/Login";
import Errorpage from "./components/Errorpage";

import { API_BASE_URL } from "./config";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");
        const urlError = params.get("error");

        if (urlError) {
          console.error("Auth error from backend:", urlError);
          window.history.replaceState({}, document.title, "/");
          setError(`Login failed: ${urlError.replace(/_/g, ' ')}`);
          setLoading(false);
          return;
        }

        if (urlToken) {
          localStorage.setItem("token", urlToken);
          window.history.replaceState({}, document.title, "/");
        }

        const token = localStorage.getItem("token");

        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        let lastError = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            if (attempt > 1) {
              setLoading(`Waking up server... (attempt ${attempt}/3)`);
              await new Promise(r => setTimeout(r, attempt * 3000));
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
              return;
            } else if (response.status === 401) {
              localStorage.removeItem("token");
              setUser(null);
              return;
            } else {
              const body = await response.text().catch(() => '');
              console.error(`/me returned ${response.status}:`, body);
              lastError = `Server returned ${response.status}`;
              if (response.status < 500) break;
            }
          } catch (networkErr) {
            console.warn(`Attempt ${attempt} failed (network):`, networkErr.message);
            lastError = 'network';
          }
        }

        if (lastError === 'network') {
          setError('Could not reach the server. It may still be waking up — please refresh in a few seconds.');
        } else {
          setError(lastError || 'Unexpected server error. Please try again.');
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        setError('Unexpected error. Please refresh the page.');
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
        <LoadingText>{typeof loading === 'string' ? loading : 'Checking session...'}</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return <Errorpage message={error} />;
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
  background-color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
`;

const Spinner = styled.div`
  border: 3px solid #3a3a3a;
  border-top: 3px solid #ffa116;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: ${spin} 0.8s linear infinite;
  margin-bottom: 16px;
`;

const LoadingText = styled.p`
  color: #eff1f6bf;
  font-size: 15px;
  font-weight: 500;
  margin: 0;
`;

export default App;
