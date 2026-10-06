import React from 'react';
import styled from 'styled-components';

const Errorpage = ({ message }) => {
  return (
    <Container>
      <Card>
        <Icon>⚠️</Icon>
        <Title>Something went wrong</Title>
        <Message>{message || 'An unexpected error occurred.'}</Message>
        <Hint>If the server just woke up, wait a few seconds and try again.</Hint>
        <RefreshButton onClick={() => window.location.reload()}>
          Refresh Page
        </RefreshButton>
      </Card>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
`;

const Card = styled.div`
  background: #282828;
  border: 1px solid #3a3a3a;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
  max-width: 420px;
  width: 100%;
`;

const Icon = styled.div`
  font-size: 36px;
  margin-bottom: 12px;
`;

const Title = styled.h2`
  margin: 0 0 10px;
  font-size: 20px;
  color: #ffffff;
`;

const Message = styled.p`
  margin: 0 0 10px;
  font-size: 14px;
  color: #f87171;
  font-weight: 500;
  word-break: break-word;
`;

const Hint = styled.p`
  margin: 0 0 24px;
  font-size: 13px;
  color: #8a8a8a;
`;

const RefreshButton = styled.button`
  padding: 10px 24px;
  background: #ffa116;
  color: #1a1a1a;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #ffb732;
  }
`;

export default Errorpage;