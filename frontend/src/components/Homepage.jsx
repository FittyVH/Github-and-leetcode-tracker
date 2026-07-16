import React from 'react';
import styled from 'styled-components';

export default function Homepage({ user }) {
  return (
    <Container>
      <WelcomeCard>
        <h1>Welcome, {user.username}! 🎉</h1>
        <p>Your Git & Leet Tracker dashboard is ready.</p>
      </WelcomeCard>
    </Container>
  );
}


const Container = styled.div`
  padding: 40px;
  font-family: sans-serif;
  background-color: #f3f4f6;
  min-height: 100vh;
`;

const WelcomeCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;