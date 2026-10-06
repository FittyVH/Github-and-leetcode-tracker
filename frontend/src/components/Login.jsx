import React from 'react';
import styled from 'styled-components';
import { API_BASE_URL } from '../config';

// LeetCode SVG logo
const LeetCodeLogo = () => (
  <svg width="32" height="32" viewBox="0 0 95 111" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M68.0063 83.3006C70.1875 81.1194 70.1875 77.6256 68.0063 75.4444L54.9931 62.4313C52.8119 60.25 49.3181 60.25 47.1369 62.4313C44.9556 64.6125 44.9556 68.1063 47.1369 70.2875L54.8644 78.015L40.2638 92.6156C38.0825 94.7969 38.0825 98.2906 40.2638 100.472C42.445 102.653 45.9388 102.653 48.12 100.472L68.0063 83.3006Z" fill="#FFA116"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M54.8644 28.985L40.2638 14.3844C38.0825 12.2031 38.0825 8.70938 40.2638 6.52813C42.445 4.34688 45.9388 4.34688 48.12 6.52813L68.0063 26.415C70.1875 28.5963 70.1875 32.09 68.0063 34.2713L54.9931 47.2844C52.8119 49.4656 49.3181 49.4656 47.1369 47.2844C44.9556 45.1031 44.9556 41.6094 47.1369 39.4281L54.8644 28.985Z" fill="#B3B3B3"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M23.7925 111C17.7644 111 12.8706 106.106 12.8706 100.078V10.9219C12.8706 4.89375 17.7644 0 23.7925 0H75.035C81.0631 0 85.9569 4.89375 85.9569 10.9219V30.0781C85.9569 33.3094 83.3456 35.9219 80.1144 35.9219C76.8831 35.9219 74.2706 33.3094 74.2706 30.0781V11.6875H24.5575V99.3125H74.2706V80.0781C74.2706 76.8469 76.8831 74.2344 80.1144 74.2344C83.3456 74.2344 85.9569 76.8469 85.9569 80.0781V100.078C85.9569 106.106 81.0631 111 75.035 111H23.7925Z" fill="#B3B3B3"/>
  </svg>
);

// GitHub SVG logo
const GitHubLogo = ({ size = 20, color = '#1a1a1a' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

export { LeetCodeLogo, GitHubLogo };

export default function Login() {
    const handleGitHubLogin = () => {
        window.location.href = `${API_BASE_URL}/api/auth/github`;
    };

    return (
        <Container>
            <Card>
                <LogoRow>
                    <LeetCodeLogo />
                    <AppName>Git &amp; Leet Tracker</AppName>
                </LogoRow>

                <Tagline>Track your group's commits and solved problems in real time.</Tagline>

                <Divider />

                <LoginButton onClick={handleGitHubLogin}>
                    <GitHubLogo size={20} color="#1a1a1a" />
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
  background-color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
`;

const Card = styled.div`
  background-color: #282828;
  padding: 44px 40px;
  border-radius: 8px;
  border: 1px solid #3a3a3a;
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const AppName = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
`;

const Tagline = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #eff1f6bf;
  line-height: 1.5;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #3a3a3a;
  margin-bottom: 28px;
`;

const LoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  background-color: #ffa116;
  color: #1a1a1a;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #ffb732;
  }
`;