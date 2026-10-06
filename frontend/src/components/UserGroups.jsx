import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { API_BASE_URL, authFetch } from '../config';
import { GitHubLogo } from './Login';

export default function UserGroups({ refreshTrigger, currentUser, onSelectGroup }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchUserGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authFetch(`${API_BASE_URL}/api/group/user-groups`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch groups (${response.status})`);
      }

      const data = await response.json();
      setGroups(data.groups || []);
    } catch (err) {
      console.error("Error fetching user groups:", err);
      setError("Unable to load joined groups. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGroups();
  }, [refreshTrigger]);

  const handleCopyId = (groupId, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(groupId);
    setCopiedId(groupId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLeaveGroup = async (groupId, groupName, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to leave "${groupName}"?`)) {
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/api/group/leave-group/${groupId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to leave group');
      }

      fetchUserGroups();
    } catch (err) {
      console.error('Error leaving group:', err);
      alert(err.message || 'Failed to leave group. Please try again.');
    }
  };

  return (
    <SectionContainer>
      <HeaderRow>
        <SectionTitleContainer>
          <SectionTitle>Joined Groups</SectionTitle>
          {!loading && !error && (
            <Badge>{groups.length} {groups.length === 1 ? 'Group' : 'Groups'}</Badge>
          )}
        </SectionTitleContainer>
        <RefreshButton onClick={fetchUserGroups} disabled={loading} title="Refresh list">
          🔄 Refresh
        </RefreshButton>
      </HeaderRow>

      {loading ? (
        <LoadingBox>
          <Spinner />
          <LoadingText>Loading your groups...</LoadingText>
        </LoadingBox>
      ) : error ? (
        <ErrorBox>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={fetchUserGroups}>Retry</RetryButton>
        </ErrorBox>
      ) : groups.length === 0 ? (
        <EmptyBox>
          <EmptyIcon>👥</EmptyIcon>
          <EmptyTitle>No Groups Joined Yet</EmptyTitle>
          <EmptySubtitle>
            Create a new group or join an existing group using a Group ID to start tracking stats with your team!
          </EmptySubtitle>
        </EmptyBox>
      ) : (
        <Grid>
          {groups.map((group) => {
            const isCreator =
              currentUser &&
              (typeof group.creator === 'object'
                ? group.creator?._id === currentUser._id || group.creator?._id === currentUser.id
                : group.creator === currentUser._id || group.creator === currentUser.id);

            return (
              <GroupCard key={group._id} onClick={() => onSelectGroup && onSelectGroup(group)}>
                <CardTop>
                  <CardHeader>
                    <GroupName>{group.name}</GroupName>
                    <BadgeGroup>
                      {isCreator ? (
                        <RoleBadge $creator>Creator</RoleBadge>
                      ) : (
                        <RoleBadge>Member</RoleBadge>
                      )}
                      <LeaveCardButton
                        onClick={(e) => handleLeaveGroup(group._id, group.name, e)}
                        title="Leave this group"
                      >
                        Leave
                      </LeaveCardButton>
                    </BadgeGroup>
                  </CardHeader>

                  <IdContainer onClick={(e) => handleCopyId(group._id, e)}>
                    <IdLabel>ID: <IdCode>{group._id}</IdCode></IdLabel>
                    <CopyButton>
                      {copiedId === group._id ? '✓ Copied' : '📋 Copy'}
                    </CopyButton>
                  </IdContainer>
                </CardTop>

                <CardFooter>
                  <MemberStack>
                    {group.members && group.members.slice(0, 4).map((member, idx) => (
                      <Avatar
                        key={member._id || idx}
                        src={member.avatarUrl || 'https://github.com/identicons/ghost.png'}
                        alt={member.username || 'Member'}
                        title={member.username || 'Member'}
                      />
                    ))}
                    {group.members && group.members.length > 4 && (
                      <OverflowAvatar>+{group.members.length - 4}</OverflowAvatar>
                    )}
                  </MemberStack>
                  <MemberCount>
                    👥 {group.members ? group.members.length : 0} {group.members?.length === 1 ? 'member' : 'members'}
                  </MemberCount>
                </CardFooter>
              </GroupCard>
            );
          })}
        </Grid>
      )}
    </SectionContainer>
  );
}

// --- STYLED COMPONENTS ---

const SectionContainer = styled.div`
  margin-top: 28px;
  width: 100%;
  max-width: 900px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #ffffff;
  font-weight: 700;
`;

const Badge = styled.span`
  background-color: #ffa11620;
  color: #ffa116;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 9999px;
  border: 1px solid #ffa11640;
`;

const RefreshButton = styled.button`
  background: transparent;
  border: 1px solid #3a3a3a;
  color: #b3b3b3;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #282828;
    color: #ffffff;
    border-color: #555;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingBox = styled.div`
  background: #282828;
  padding: 40px;
  border-radius: 8px;
  border: 1px solid #3a3a3a;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Spinner = styled.div`
  border: 3px solid #3a3a3a;
  border-top: 3px solid #ffa116;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: ${spin} 0.8s linear infinite;
  margin-bottom: 12px;
`;

const LoadingText = styled.p`
  color: #6b7280;
  font-size: 14px;
  margin: 0;
`;

const ErrorBox = styled.div`
  background: #2a1515;
  border: 1px solid #5c2020;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
`;

const ErrorText = styled.p`
  color: #f87171;
  font-size: 14px;
  margin: 0 0 12px 0;
`;

const RetryButton = styled.button`
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background-color: #b91c1c; }
`;

const EmptyBox = styled.div`
  background: #282828;
  padding: 48px 24px;
  border-radius: 8px;
  text-align: center;
  border: 1px dashed #3a3a3a;
`;

const EmptyIcon = styled.div`
  font-size: 44px;
  margin-bottom: 12px;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #ffffff;
  font-weight: 600;
`;

const EmptySubtitle = styled.p`
  margin: 0 auto;
  max-width: 420px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 16px;
`;

const GroupCard = styled.div`
  background: #282828;
  border-radius: 8px;
  padding: 18px 20px;
  border: 1px solid #3a3a3a;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #ffa116;
    background-color: #2e2600;
  }
`;

const CardTop = styled.div`
  margin-bottom: 14px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
`;

const GroupName = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #ffffff;
  font-weight: 700;
  word-break: break-word;
`;

const RoleBadge = styled.span`
  background-color: ${props => props.$creator ? '#ffa11625' : '#3a3a3a'};
  color: ${props => props.$creator ? '#ffa116' : '#b3b3b3'};
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid ${props => props.$creator ? '#ffa11640' : '#4a4a4a'};
`;

const BadgeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

const LeaveCardButton = styled.button`
  background-color: transparent;
  color: #f87171;
  border: 1px solid #5c2020;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #2a1515;
    border-color: #dc2626;
    color: #fca5a5;
  }
`;

const IdContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1f1f1f;
  border: 1px solid #3a3a3a;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  transition: border-color 0.15s;

  &:hover {
    border-color: #ffa116;
  }
`;

const IdLabel = styled.span`
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
`;

const IdCode = styled.code`
  font-family: monospace;
  color: #b3b3b3;
  font-weight: 600;
`;

const CopyButton = styled.span`
  color: #ffa116;
  font-weight: 600;
  font-size: 11px;
  white-space: nowrap;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #3a3a3a;
`;

const MemberStack = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.img`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid #282828;
  margin-left: -6px;
  object-fit: cover;
  background-color: #3a3a3a;

  &:first-child {
    margin-left: 0;
  }
`;

const OverflowAvatar = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid #282828;
  margin-left: -6px;
  background-color: #3a3a3a;
  color: #b3b3b3;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MemberCount = styled.span`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
`;
