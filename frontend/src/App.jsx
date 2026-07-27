import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import Homepage from "./components/Homepage";
import Login from "./components/Login";
import Errorpage from "./components/Errorpage";

import { API_BASE_URL } from "./config";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // null = no error, string = error message

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If GitHub just redirected back with a token in the URL, save it
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");
        const urlError = params.get("error");

        if (urlError) {
          // Backend sent back an explicit error (e.g. token exchange failed)
          console.error("Auth error from backend:", urlError);
          window.history.replaceState({}, document.title, "/");
          setError(`Login failed: ${urlError.replace(/_/g, ' ')}`);
          setLoading(false);
          return;
        }

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

        // Retry up to 3 times with increasing delays to handle Render cold-starts
        // (free tier backends sleep after inactivity and take ~10s to wake up)
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
              // Non-401 server error — log the details
              const body = await response.text().catch(() => '');
              console.error(`/me returned ${response.status}:`, body);
              lastError = `Server returned ${response.status}`;
              // Don't retry on 4xx (except 401 handled above)
              if (response.status < 500) break;
            }
          } catch (networkErr) {
            // Network error = backend likely sleeping (Render cold-start)
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

