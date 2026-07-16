import React from 'react';
import styled from 'styled-components';

export default function Login() {
    
    const handleGitHubLogin = () => {
        // navigate to the assigned url
        window.location.href = "http://localhost:3000/api/auth/github";
    };

    return (
        <Container>
            <Card>
                <Title>Git & Leet Tracker</Title>
                <Subtitle>Track your group's commit counts and solved problems in real time.</Subtitle>
                
                <LoginButton onClick={handleGitHubLogin}>
                    Continue with GitHub
                </LoginButton>
            </Card>
        </Container>
    );
}

// --- STYLED COMPONENTS DEFINITIONS ---

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f3f4f6;
  font-family: sans-serif;
`;

const Card = styled.div`
  background-color: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const Title = styled.h2`
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #1f2937;
`;

const Subtitle = styled.p`
  margin: 0 0 30px 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
`;

const LoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  background-color: #24292e;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #1a1e22;
  }
`;