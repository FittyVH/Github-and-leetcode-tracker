import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CreateGroupModal from './CreateGroupModal';
import JoinGroupModal from './JoinGroupModal';
import LeetCodeModal from './LeetCodeModal';
import UserGroups from './UserGroups';
import GroupDetails from './GroupDetails';

export default function Homepage({ user }) {
  const [currentUser, setCurrentUser] = useState(user);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLeetCodeModalOpen, setIsLeetCodeModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

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

  const handleUserUpdated = (updatedUser) => {
    console.log("User profile updated:", updatedUser);
    setCurrentUser(updatedUser);
    // Refresh group views to show new stats if currently viewing a group
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Container>
      <MainContent>
        {selectedGroup ? (
          <GroupDetails
            groupId={selectedGroup._id}
            currentUser={currentUser}
            onBack={() => setSelectedGroup(null)}
          />
        ) : (
          <>
            <WelcomeCard>
              <HeaderTopRow>
                <div>
                  <HeaderTitle>Welcome, {currentUser?.username || 'Guest'}! 🎉</HeaderTitle>
                  <Subtitle>Your Git & Leet Tracker dashboard is ready.</Subtitle>
                </div>
              </HeaderTopRow>

              <ProfileStatusBox>
                <ProfileBadge $type="github">
                  <span>🐙 GitHub:</span>
                  <strong>@{currentUser?.username}</strong>
                </ProfileBadge>

                {currentUser?.leetcodeUsername ? (
                  <ProfileBadge $type="leetcode">
                    <span>🧩 LeetCode:</span>
                    <strong>@{currentUser.leetcodeUsername}</strong>
                    <EditButton onClick={() => setIsLeetCodeModalOpen(true)}>Edit</EditButton>
                  </ProfileBadge>
                ) : (
                  <UnlinkedBadge onClick={() => setIsLeetCodeModalOpen(true)}>
                    <span>🧩 LeetCode Profile:</span>
                    <em>Not linked yet</em>
                    <AddButton>+ Add URL</AddButton>
                  </UnlinkedBadge>
                )}
              </ProfileStatusBox>

              <ButtonGroup>
                <PrimaryButton onClick={() => setIsCreateModalOpen(true)}>
                  + Create Group
                </PrimaryButton>
                <SecondaryButton onClick={() => setIsJoinModalOpen(true)}>
                  🔗 Join Group
                </SecondaryButton>
                <LeetCodeButton onClick={() => setIsLeetCodeModalOpen(true)}>
                  🧩 {currentUser?.leetcodeUsername ? 'Edit LeetCode URL' : 'Link LeetCode URL'}
                </LeetCodeButton>
              </ButtonGroup>
            </WelcomeCard>

            {/* Separate component displaying all joined groups */}
            <UserGroups
              refreshTrigger={refreshTrigger}
              currentUser={currentUser}
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

      <LeetCodeModal
        isOpen={isLeetCodeModalOpen}
        onClose={() => setIsLeetCodeModalOpen(false)}
        currentUsername={currentUser?.leetcodeUsername}
        onUserUpdated={handleUserUpdated}
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

const HeaderTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const HeaderTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #111827;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #4b5563;
`;

const ProfileStatusBox = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const ProfileBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${props => props.$type === 'leetcode' ? '#fffbeb' : '#f3f4f6'};
  border: 1px solid ${props => props.$type === 'leetcode' ? '#fde68a' : '#e5e7eb'};
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  color: ${props => props.$type === 'leetcode' ? '#92400e' : '#374151'};
`;

const UnlinkedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #fefce8;
  border: 1px dashed #fde047;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  color: #854d0e;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background-color: #fef9c3;
  }
`;

const EditButton = styled.span`
  margin-left: 6px;
  color: #d97706;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  cursor: pointer;
  background: #fef3c7;
  padding: 2px 6px;
  border-radius: 4px;
  &:hover { background: #fde68a; }
`;

const AddButton = styled.span`
  margin-left: 4px;
  color: #b45309;
  font-weight: 700;
  font-size: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 12px 22px;
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
  padding: 10px 20px;
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

const LeetCodeButton = styled.button`
  background-color: #fffbeb;
  color: #d97706;
  border: 2px solid #f59e0b;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #fef3c7;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;