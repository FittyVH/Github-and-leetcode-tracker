import React, { useState } from 'react';
import styled from 'styled-components';
import CreateGroupModal from './CreateGroupModal'; // Import your new modal component

export default function Homepage({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGroupCreated = (newGroup) => {
    console.log("New group data returned from backend:", newGroup);
    // This is where you can later update a list of groups in your dashboard state
  };

  return (
    <Container>
      <WelcomeCard>
        <HeaderTitle>Welcome, {user?.username || 'Guest'}! 🎉</HeaderTitle>
        <Subtitle>Your Git & Leet Tracker dashboard is ready.</Subtitle>
        
        <ButtonGroup>
          {/* 1. Open the modal when clicked */}
          <PrimaryButton onClick={() => setIsModalOpen(true)}>
            Create Group
          </PrimaryButton>
          <SecondaryButton>Join Group</SecondaryButton>
        </ButtonGroup>
      </WelcomeCard>

      {/* 2. Mount the modal component cleanly below your layout card */}
      <CreateGroupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onGroupCreated={handleGroupCreated}
      />
    </Container>
  );
}

// --- STYLED COMPONENTS (Kept exactly as you provided) ---

const Container = styled.div`
  padding: 40px;
  font-family: sans-serif;
  background-color: #f3f4f6;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const WelcomeCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-width: 600px;
  width: 100%;
`;

const HeaderTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #111827;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0 0 28px 0;
  font-size: 16px;
  color: #4b5563;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #1d4ed8;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px -1px rgba(37, 99, 235, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled.button`
  background-color: white;
  color: #2563eb;
  border: 2px solid #2563eb;
  padding: 10px 22px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #eff6ff;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;