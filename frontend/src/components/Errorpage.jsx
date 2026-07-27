import React from 'react'
import styled from 'styled-components'

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
  )
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f3f4f6;
  font-family: sans-serif;
`

const Card = styled.div`
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 420px;
  width: 100%;
`

const Icon = styled.div`
  font-size: 40px;
  margin-bottom: 12px;
`

const Title = styled.h2`
  margin: 0 0 10px;
  font-size: 20px;
  color: #1f2937;
`

const Message = styled.p`
  margin: 0 0 8px;
  font-size: 14px;
  color: #dc2626;
  font-weight: 500;
  word-break: break-word;
`

const Hint = styled.p`
  margin: 0 0 24px;
  font-size: 13px;
  color: #6b7280;
`

const RefreshButton = styled.button`
  padding: 10px 24px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #1d4ed8; }
`

export default Errorpage