import React, { useState } from 'react';
import styled from 'styled-components';
import CreateGroupModal from './CreateGroupModal';
import JoinGroupModal from './JoinGroupModal';
import UserGroups from './UserGroups';
import GroupDetails from './GroupDetails';

export default function Homepage({ user }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleGroupCreated = (newGroup) => {
    console.log("New group created:", newGroup);
    setRefreshTrigger((prev) => prev + 1);
    if (newGroup && newGroup._id) {
      setSelectedGroup(newGroup);
    }
  };

  const handleGroupJoined = (joinedGroup) => {
    console.log("Joined group:", joinedGroup);
    setRefreshTrigger((prev) => prev + 1);
    if (joinedGroup && joinedGroup._id) {
      setSelectedGroup(joinedGroup);
    }
  };

  return (
    <Container>
      <MainContent>
        {selectedGroup ? (
          <GroupDetails
            groupId={selectedGroup._id}
            currentUser={user}
            onBack={() => setSelectedGroup(null)}
          />
        ) : (
          <>
            <WelcomeCard>
              <HeaderTitle>Welcome, {user?.username || 'Guest'}! 🎉</HeaderTitle>
              <Subtitle>Your Git & Leet Tracker dashboard is ready.</Subtitle>

              <ButtonGroup>
                <PrimaryButton onClick={() => setIsCreateModalOpen(true)}>
                  + Create Group
                </PrimaryButton>
                <SecondaryButton onClick={() => setIsJoinModalOpen(true)}>
                  🔗 Join Group
                </SecondaryButton>
              </ButtonGroup>
            </WelcomeCard>

            {/* Separate component displaying all joined groups */}
            <UserGroups
              refreshTrigger={refreshTrigger}
              currentUser={user}
              onSelectGroup={(group) => setSelectedGroup(group)}
            />
          </>
        )}
      </MainContent>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />

      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onGroupJoined={handleGroupJoined}
      />
    </Container>
  );
}

// --- STYLED COMPONENTS ---

const Container = styled.div`
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f3f4f6;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
`;

const MainContent = styled.div`
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const WelcomeCard = styled.div`
  background: white;
  padding: 36px 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e5e7eb;
`;

const HeaderTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #111827;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0 0 24px 0;
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
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
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
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
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