import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

export default function UserGroups({ refreshTrigger, currentUser, onSelectGroup }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchUserGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch("http://localhost:3000/api/group/user-groups", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
                    {isCreator ? (
                      <RoleBadge $creator>Creator</RoleBadge>
                    ) : (
                      <RoleBadge>Member</RoleBadge>
                    )}
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
  margin-top: 32px;
  width: 100%;
  max-width: 900px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
`;

const SectionTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 22px;
  color: #111827;
  font-weight: 700;
`;

const Badge = styled.span`
  background-color: #e0e7ff;
  color: #3730a3;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
`;

const RefreshButton = styled.button`
  background: white;
  border: 1px solid #d1d5db;
  color: #4b5563;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #f9fafb;
    color: #111827;
    border-color: #9ca3af;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingBox = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Spinner = styled.div`
  border: 3px solid #e5e7eb;
  border-top: 3px solid #2563eb;
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
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
`;

const ErrorText = styled.p`
  color: #991b1b;
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
  background: white;
  padding: 48px 24px;
  border-radius: 12px;
  text-align: center;
  border: 2px dashed #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
`;

const EmptyIcon = styled.div`
  font-size: 44px;
  margin-bottom: 12px;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #111827;
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
  gap: 20px;
`;

const GroupCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
  }
`;

const CardTop = styled.div`
  margin-bottom: 16px;
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
  font-size: 18px;
  color: #1f2937;
  font-weight: 700;
  word-break: break-word;
`;

const RoleBadge = styled.span`
  background-color: ${props => props.$creator ? '#dbeafe' : '#f3f4f6'};
  color: ${props => props.$creator ? '#1e40af' : '#4b5563'};
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
`;

const IdContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8fafc;
  border: 1px solid #f1f5f9;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  transition: background-color 0.15s;

  &:hover {
    background-color: #f1f5f9;
  }
`;

const IdLabel = styled.span`
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
`;

const IdCode = styled.code`
  font-family: monospace;
  color: #334155;
  font-weight: 600;
`;

const CopyButton = styled.span`
  color: #2563eb;
  font-weight: 600;
  font-size: 11px;
  white-space: nowrap;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
`;

const MemberStack = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid white;
  margin-left: -8px;
  object-fit: cover;
  background-color: #e5e7eb;

  &:first-child {
    margin-left: 0;
  }
`;

const OverflowAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid white;
  margin-left: -8px;
  background-color: #6b7280;
  color: white;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MemberCount = styled.span`
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
`;
