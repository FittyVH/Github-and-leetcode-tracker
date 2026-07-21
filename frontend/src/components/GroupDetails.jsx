import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

export default function GroupDetails({ groupId, onBack, currentUser }) {
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  const fetchGroupLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:3000/api/group/${groupId}/leaderboard`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to load group details (${response.status})`);
      }

      const data = await response.json();
      setGroupData(data);
    } catch (err) {
      console.error('Error fetching group leaderboard:', err);
      setError('Unable to load group member progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupLeaderboard();
    }
  }, [groupId]);

  const handleCopyId = () => {
    if (groupData?.groupId || groupId) {
      navigator.clipboard.writeText(groupData?.groupId || groupId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Calculate maximum scores for progress bar scaling
  const maxCommits = groupData?.leaderboard
    ? Math.max(...groupData.leaderboard.map((m) => m.commitScore || 0), 1)
    : 1;

  const maxLeetcode = groupData?.leaderboard
    ? Math.max(...groupData.leaderboard.map((m) => m.leetcodeScore || 0), 1)
    : 1;

  const totalTeamCommits = groupData?.leaderboard
    ? groupData.leaderboard.reduce((acc, m) => acc + (m.commitScore || 0), 0)
    : 0;

  const totalTeamLeetcode = groupData?.leaderboard
    ? groupData.leaderboard.reduce((acc, m) => acc + (m.leetcodeScore || 0), 0)
    : 0;

  return (
    <Container>
      <TopBar>
        <BackButton onClick={onBack}>
          ← Back to Groups
        </BackButton>
        <RefreshButton onClick={fetchGroupLeaderboard} disabled={loading}>
          🔄 Refresh Stats
        </RefreshButton>
      </TopBar>

      {loading ? (
        <LoadingState>
          <Spinner />
          <LoadingText>Fetching members' GitHub & LeetCode activity...</LoadingText>
        </LoadingState>
      ) : error ? (
        <ErrorBox>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={fetchGroupLeaderboard}>Retry</RetryButton>
        </ErrorBox>
      ) : groupData ? (
        <>
          <HeaderCard>
            <HeaderLeft>
              <GroupTitle>{groupData.groupName}</GroupTitle>
              <IdBadge onClick={handleCopyId}>
                Group ID: <IdCode>{groupData.groupId || groupId}</IdCode>
                <CopyTag>{copiedId ? '✓ Copied' : '📋 Copy'}</CopyTag>
              </IdBadge>
            </HeaderLeft>
          </HeaderCard>

          <StatsGrid>
            <StatCard>
              <StatIcon>👥</StatIcon>
              <StatInfo>
                <StatValue>{groupData.leaderboard?.length || 0}</StatValue>
                <StatLabel>Members</StatLabel>
              </StatInfo>
            </StatCard>

            <StatCard $github>
              <StatIcon>🐙</StatIcon>
              <StatInfo>
                <StatValue>{totalTeamCommits}</StatValue>
                <StatLabel>Recent GitHub Commits</StatLabel>
              </StatInfo>
            </StatCard>

            <StatCard $leetcode>
              <StatIcon>🧩</StatIcon>
              <StatInfo>
                <StatValue>{totalTeamLeetcode}</StatValue>
                <StatLabel>LeetCode Solved</StatLabel>
              </StatInfo>
            </StatCard>
          </StatsGrid>

          <SectionHeading>Member Progress & Leaderboard</SectionHeading>

          <MemberList>
            {groupData.leaderboard.map((member, index) => {
              const isCurrentUser =
                currentUser && (member.id === currentUser._id || member.id === currentUser.id);

              const githubPercent = Math.round(((member.commitScore || 0) / maxCommits) * 100);
              const leetcodePercent = Math.round(((member.leetcodeScore || 0) / maxLeetcode) * 100);

              let rankBadge = `${index + 1}`;
              let rankStyle = 'normal';
              if (index === 0) {
                rankBadge = '🥇';
                rankStyle = 'gold';
              } else if (index === 1) {
                rankBadge = '🥈';
                rankStyle = 'silver';
              } else if (index === 2) {
                rankBadge = '🥉';
                rankStyle = 'bronze';
              }

              return (
                <MemberCard key={member.id} $isSelf={isCurrentUser}>
                  <MemberHeader>
                    <MemberLeft>
                      <RankBadge $type={rankStyle}>{rankBadge}</RankBadge>
                      <Avatar
                        src={member.avatarUrl || 'https://github.com/identicons/ghost.png'}
                        alt={member.username}
                      />
                      <UserInfo>
                        <UserNameRow>
                          <UserName>{member.username}</UserName>
                          {isCurrentUser && <YouTag>You</YouTag>}
                        </UserNameRow>
                        <ProfileLinks>
                          <ProfileLink
                            href={`https://github.com/${member.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            GitHub ↗
                          </ProfileLink>
                          <ProfileLink
                            href={`https://leetcode.com/u/${member.leetcodeUsername || member.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            $leetcode
                          >
                            LeetCode ↗
                          </ProfileLink>
                        </ProfileLinks>
                      </UserInfo>
                    </MemberLeft>

                    <TotalScorePill>
                      Score: <ScoreVal>{member.totalScore}</ScoreVal>
                    </TotalScorePill>
                  </MemberHeader>

                  <ProgressGrid>
                    <MetricBox>
                      <MetricHeader>
                        <MetricTitle>
                          <Icon>🐙</Icon> GitHub Recent Commits
                        </MetricTitle>
                        <MetricValue $color="#2563eb">{member.commitScore || 0} commits</MetricValue>
                      </MetricHeader>
                      <ProgressBarTrack>
                        <ProgressBarFill $width={githubPercent} $color="#2563eb" />
                      </ProgressBarTrack>
                    </MetricBox>

                    <MetricBox>
                      <MetricHeader>
                        <MetricTitle>
                          <Icon>🧩</Icon> LeetCode Problems Solved
                        </MetricTitle>
                        <MetricValue $color="#d97706">{member.leetcodeScore || 0} solved</MetricValue>
                      </MetricHeader>
                      <ProgressBarTrack>
                        <ProgressBarFill $width={leetcodePercent} $color="#f59e0b" />
                      </ProgressBarTrack>
                    </MetricBox>
                  </ProgressGrid>
                </MemberCard>
              );
            })}
          </MemberList>
        </>
      ) : null}
    </Container>
  );
}

// --- STYLED COMPONENTS ---

const Container = styled.div`
  width: 100%;
  max-width: 900px;
  margin-top: 10px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
    transform: translateX(-2px);
  }
`;

const RefreshButton = styled.button`
  background: white;
  border: 1px solid #d1d5db;
  color: #4b5563;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #f9fafb;
    color: #111827;
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

const LoadingState = styled.div`
  background: white;
  padding: 60px 20px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Spinner = styled.div`
  border: 4px solid #e5e7eb;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 0.8s linear infinite;
  margin-bottom: 16px;
`;

const LoadingText = styled.p`
  color: #4b5563;
  font-size: 15px;
  font-weight: 500;
  margin: 0;
`;

const ErrorBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 32px;
  border-radius: 16px;
  text-align: center;
`;

const ErrorText = styled.p`
  color: #991b1b;
  font-size: 15px;
  margin: 0 0 16px 0;
`;

const RetryButton = styled.button`
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background-color: #b91c1c; }
`;

const HeaderCard = styled.div`
  background: white;
  padding: 28px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const GroupTitle = styled.h1`
  margin: 0;
  font-size: 26px;
  color: #111827;
  font-weight: 800;
`;

const IdBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #f3f4f6;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
  width: fit-content;
  transition: background-color 0.15s;

  &:hover {
    background-color: #e5e7eb;
  }
`;

const IdCode = styled.code`
  font-family: monospace;
  font-weight: 600;
  color: #111827;
`;

const CopyTag = styled.span`
  color: #2563eb;
  font-weight: 600;
  font-size: 12px;
  margin-left: 4px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div`
  font-size: 32px;
  background-color: #f3f4f6;
  width: 54px;
  height: 54px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.span`
  font-size: 24px;
  font-weight: 800;
  color: #111827;
`;

const StatLabel = styled.span`
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
`;

const SectionHeading = styled.h2`
  font-size: 20px;
  color: #111827;
  font-weight: 700;
  margin: 0 0 16px 0;
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MemberCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid ${props => props.$isSelf ? '#bfdbfe' : '#e5e7eb'};
  box-shadow: ${props => props.$isSelf ? '0 4px 12px rgba(37, 99, 235, 0.08)' : '0 2px 4px rgba(0, 0, 0, 0.03)'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.08);
  }
`;

const MemberHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const MemberLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const RankBadge = styled.div`
  font-size: ${props => props.$type !== 'normal' ? '22px' : '14px'};
  font-weight: 700;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$type === 'normal' ? '#f3f4f6' : 'transparent'};
  color: #4b5563;
  border-radius: 50%;
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f3f4f6;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserName = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
`;

const YouTag = styled.span`
  background-color: #2563eb;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
`;

const ProfileLinks = styled.div`
  display: flex;
  gap: 12px;
`;

const ProfileLink = styled.a`
  font-size: 12px;
  color: ${props => props.$leetcode ? '#d97706' : '#2563eb'};
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const TotalScorePill = styled.div`
  background-color: #f3f4f6;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 13px;
  color: #4b5563;
  font-weight: 600;
`;

const ScoreVal = styled.span`
  color: #111827;
  font-weight: 800;
  font-size: 15px;
`;

const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MetricBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MetricTitle = styled.span`
  font-size: 13px;
  color: #4b5563;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Icon = styled.span`
  font-size: 14px;
`;

const MetricValue = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.$color || '#111827'};
`;

const ProgressBarTrack = styled.div`
  background-color: #f3f4f6;
  height: 10px;
  border-radius: 9999px;
  overflow: hidden;
  width: 100%;
`;

const ProgressBarFill = styled.div`
  background-color: ${props => props.$color || '#2563eb'};
  height: 100%;
  width: ${props => Math.min(Math.max(props.$width, 4), 100)}%;
  border-radius: 9999px;
  transition: width 0.6s ease-out;
`;
