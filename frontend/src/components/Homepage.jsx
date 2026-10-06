import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CreateGroupModal from './CreateGroupModal';
import JoinGroupModal from './JoinGroupModal';
import LeetCodeModal from './LeetCodeModal';
import UserGroups from './UserGroups';
import GroupDetails from './GroupDetails';
import { LeetCodeLogo, GitHubLogo } from './Login';

// LeetCode icon for inline use
const LCIcon = () => (
  <svg width="16" height="16" viewBox="0 0 95 111" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M68.0063 83.3006C70.1875 81.1194 70.1875 77.6256 68.0063 75.4444L54.9931 62.4313C52.8119 60.25 49.3181 60.25 47.1369 62.4313C44.9556 64.6125 44.9556 68.1063 47.1369 70.2875L54.8644 78.015L40.2638 92.6156C38.0825 94.7969 38.0825 98.2906 40.2638 100.472C42.445 102.653 45.9388 102.653 48.12 100.472L68.0063 83.3006Z" fill="#FFA116"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M54.8644 28.985L40.2638 14.3844C38.0825 12.2031 38.0825 8.70938 40.2638 6.52813C42.445 4.34688 45.9388 4.34688 48.12 6.52813L68.0063 26.415C70.1875 28.5963 70.1875 32.09 68.0063 34.2713L54.9931 47.2844C52.8119 49.4656 49.3181 49.4656 47.1369 47.2844C44.9556 45.1031 44.9556 41.6094 47.1369 39.4281L54.8644 28.985Z" fill="#B3B3B3"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M23.7925 111C17.7644 111 12.8706 106.106 12.8706 100.078V10.9219C12.8706 4.89375 17.7644 0 23.7925 0H75.035C81.0631 0 85.9569 4.89375 85.9569 10.9219V30.0781C85.9569 33.3094 83.3456 35.9219 80.1144 35.9219C76.8831 35.9219 74.2706 33.3094 74.2706 30.0781V11.6875H24.5575V99.3125H74.2706V80.0781C74.2706 76.8469 76.8831 74.2344 80.1144 74.2344C83.3456 74.2344 85.9569 76.8469 85.9569 80.0781V100.078C85.9569 106.106 81.0631 111 75.035 111H23.7925Z" fill="#B3B3B3"/>
  </svg>
);

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
                <TitleArea>
                  <HeaderTitle>Welcome back, {currentUser?.username || 'Guest'}</HeaderTitle>
                  <Subtitle>Your Git &amp; Leet Tracker dashboard</Subtitle>
                </TitleArea>
              </HeaderTopRow>

              <ProfileStatusBox>
                <ProfileBadge $type="github">
                  <GitHubLogo size={14} color="#b3b3b3" />
                  <BadgeLabel>GitHub:</BadgeLabel>
                  <strong>@{currentUser?.username}</strong>
                </ProfileBadge>

                {currentUser?.leetcodeUsername ? (
                  <ProfileBadge $type="leetcode">
                    <LCIcon />
                    <BadgeLabel>LeetCode:</BadgeLabel>
                    <strong>@{currentUser.leetcodeUsername}</strong>
                    <EditButton onClick={() => setIsLeetCodeModalOpen(true)}>Edit</EditButton>
                  </ProfileBadge>
                ) : (
                  <UnlinkedBadge onClick={() => setIsLeetCodeModalOpen(true)}>
                    <LCIcon />
                    <BadgeLabel>LeetCode:</BadgeLabel>
                    <em style={{ color: '#6b7280' }}>Not linked yet</em>
                    <AddButton>+ Link</AddButton>
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
                  <LCIcon />
                  {currentUser?.leetcodeUsername ? 'Edit LeetCode' : 'Link LeetCode'}
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
  padding: 32px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #1a1a1a;
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
  background: #282828;
  padding: 28px 32px;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #3a3a3a;
`;

const HeaderTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const TitleArea = styled.div``;

const HeaderTitle = styled.h1`
  margin: 0 0 4px 0;
  font-size: 22px;
  color: #ffffff;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #eff1f6bf;
`;

const ProfileStatusBox = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 22px;
`;

const ProfileBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: ${props => props.$type === 'leetcode' ? '#2a2200' : '#1f1f1f'};
  border: 1px solid ${props => props.$type === 'leetcode' ? '#ffa11633' : '#3a3a3a'};
  padding: 7px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: ${props => props.$type === 'leetcode' ? '#ffa116' : '#b3b3b3'};

  strong {
    color: #ffffff;
  }
`;

const BadgeLabel = styled.span`
  color: #6b7280;
`;

const UnlinkedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #1f1f1f;
  border: 1px dashed #ffa11655;
  padding: 7px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;

  &:hover {
    background-color: #2a2200;
    border-color: #ffa116;
  }
`;

const EditButton = styled.span`
  margin-left: 4px;
  color: #ffa116;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  cursor: pointer;
  background: #ffa11620;
  padding: 2px 6px;
  border-radius: 4px;
  &:hover { background: #ffa11635; }
`;

const AddButton = styled.span`
  margin-left: 2px;
  color: #ffa116;
  font-weight: 700;
  font-size: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  background-color: #ffa116;
  color: #1a1a1a;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #ffb732;
  }

  &:active {
    background-color: #e0900d;
  }
`;

const SecondaryButton = styled.button`
  background-color: transparent;
  color: #ffa116;
  border: 1px solid #ffa116;
  padding: 9px 18px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #ffa11615;
  }

  &:active {
    background-color: #ffa11625;
  }
`;

const LeetCodeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: transparent;
  color: #b3b3b3;
  border: 1px solid #3a3a3a;
  padding: 9px 18px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #2a2200;
    border-color: #ffa116;
    color: #ffa116;
  }

  &:active {
    background-color: #332800;
  }
`;