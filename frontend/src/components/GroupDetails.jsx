import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { API_BASE_URL, authFetch } from '../config';
import { GitHubLogo } from './Login';

// LeetCode Logo Icon SVG
const LeetCodeLogoIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 95 111" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M68.0063 83.3006C70.1875 81.1194 70.1875 77.6256 68.0063 75.4444L54.9931 62.4313C52.8119 60.25 49.3181 60.25 47.1369 62.4313C44.9556 64.6125 44.9556 68.1063 47.1369 70.2875L54.8644 78.015L40.2638 92.6156C38.0825 94.7969 38.0825 98.2906 40.2638 100.472C42.445 102.653 45.9388 102.653 48.12 100.472L68.0063 83.3006Z" fill="#FFA116"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M54.8644 28.985L40.2638 14.3844C38.0825 12.2031 38.0825 8.70938 40.2638 6.52813C42.445 4.34688 45.9388 4.34688 48.12 6.52813L68.0063 26.415C70.1875 28.5963 70.1875 32.09 68.0063 34.2713L54.9931 47.2844C52.8119 49.4656 49.3181 49.4656 47.1369 47.2844C44.9556 45.1031 44.9556 41.6094 47.1369 39.4281L54.8644 28.985Z" fill="#B3B3B3"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M23.7925 111C17.7644 111 12.8706 106.106 12.8706 100.078V10.9219C12.8706 4.89375 17.7644 0 23.7925 0H75.035C81.0631 0 85.9569 4.89375 85.9569 10.9219V30.0781C85.9569 33.3094 83.3456 35.9219 80.1144 35.9219C76.8831 35.9219 74.2706 33.3094 74.2706 30.0781V11.6875H24.5575V99.3125H74.2706V80.0781C74.2706 76.8469 76.8831 74.2344 80.1144 74.2344C83.3456 74.2344 85.9569 76.8469 85.9569 80.0781V100.078C85.9569 106.106 81.0631 111 75.035 111H23.7925Z" fill="#B3B3B3"/>
  </svg>
);

function QuestionsDropdown({ questions }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <QuestionsSection>
      <QuestionsHeading onClick={() => setIsOpen(!isOpen)} role="button" tabIndex={0}>
        <HeadingLeftGroup>
          <LeetCodeLogoIcon size={14} />
          <span>Questions Solved Today</span>
          <QuestionCountBadge>{questions.length}</QuestionCountBadge>
        </HeadingLeftGroup>
        <DropdownIcon $isOpen={isOpen}>▼</DropdownIcon>
      </QuestionsHeading>

      {isOpen && (
        <QuestionsDropdownContent>
          {questions.length > 0 ? (
            <QuestionPillGrid>
              {questions.map((q, qIdx) => (
                <QuestionPill
                  key={qIdx}
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Solved on LeetCode: ${q.title}`}
                >
                  <LeetCodeLogoIcon size={12} />
                  <span>{q.title}</span>
                  <span style={{ fontSize: '10px' }}>↗</span>
                </QuestionPill>
              ))}
            </QuestionPillGrid>
          ) : (
            <NoQuestionsText>No LeetCode questions solved in the last 24 hours.</NoQuestionsText>
          )}
        </QuestionsDropdownContent>
      )}
    </QuestionsSection>
  );
}

export default function GroupDetails({ groupId, onBack, currentUser }) {
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' (24h) or 'overall'
  const [leaving, setLeaving] = useState(false);

  const fetchGroupLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authFetch(`${API_BASE_URL}/api/group/${groupId}/leaderboard`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
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

  const handleLeaveGroup = async () => {
    if (!window.confirm(`Are you sure you want to leave "${groupData?.groupName || 'this group'}"?`)) {
      return;
    }

    setLeaving(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/api/group/leave-group/${groupId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to leave group');
      }

      if (onBack) onBack();
    } catch (err) {
      console.error('Error leaving group:', err);
      alert(err.message || 'Failed to leave group. Please try again.');
    } finally {
      setLeaving(false);
    }
  };

  const isDaily = viewMode === 'daily';
  const activeLeaderboard = isDaily
    ? groupData?.leaderboardDaily || groupData?.leaderboard || []
    : groupData?.leaderboardOverall || groupData?.leaderboard || [];

  // Scaling calculations
  const maxCommits = Math.max(
    ...activeLeaderboard.map((m) => (isDaily ? m.github24hCommits || 0 : m.githubTotalCommits || 0)),
    1
  );

  const maxLeetcode = Math.max(
    ...activeLeaderboard.map((m) => (isDaily ? m.leetcode24hSolved || 0 : m.leetcodeTotalSolved || 0)),
    1
  );

  const team24hCommits = activeLeaderboard.reduce((acc, m) => acc + (m.github24hCommits || 0), 0);
  const team24hLeetcode = activeLeaderboard.reduce((acc, m) => acc + (m.leetcode24hSolved || 0), 0);
  const teamTotalCommits = activeLeaderboard.reduce((acc, m) => acc + (m.githubTotalCommits || 0), 0);
  const teamTotalLeetcode = activeLeaderboard.reduce((acc, m) => acc + (m.leetcodeTotalSolved || 0), 0);

  return (
    <Container>
      <TopBar>
        <BackButton onClick={onBack}>
          ← Back to Groups
        </BackButton>
        <TopActions>
          <RefreshButton onClick={fetchGroupLeaderboard} disabled={loading || leaving}>
            🔄 Refresh Stats
          </RefreshButton>
          {groupData && (
            <LeaveButton onClick={handleLeaveGroup} disabled={leaving}>
              {leaving ? 'Leaving...' : 'Leave Group'}
            </LeaveButton>
          )}
        </TopActions>
      </TopBar>

      {loading ? (
        <LoadingState>
          <Spinner />
          <LoadingText>Fetching GitHub &amp; LeetCode progress...</LoadingText>
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
                <IdLabel>Group ID:</IdLabel>
                <IdCode>{groupData.groupId || groupId}</IdCode>
                <CopyTag>{copiedId ? '✓ Copied' : '📋 Copy'}</CopyTag>
              </IdBadge>
            </HeaderLeft>
          </HeaderCard>

          {/* Mode Switcher Tabs */}
          <TabContainer>
            <TabButton
              $active={isDaily}
              onClick={() => setViewMode('daily')}
            >
              24-Hour Daily Leaderboard
            </TabButton>
            <TabButton
              $active={!isDaily}
              onClick={() => setViewMode('overall')}
            >
              Overall Leaderboard
            </TabButton>
          </TabContainer>

          <StatsGrid>
            <StatCard>
              <StatIcon>👥</StatIcon>
              <StatInfo>
                <StatValue>{groupData.membersCount || activeLeaderboard.length}</StatValue>
                <StatLabel>Total Members</StatLabel>
              </StatInfo>
            </StatCard>

            <StatCard>
              <StatIconSvg>
                <GitHubLogo size={24} color="#b3b3b3" />
              </StatIconSvg>
              <StatInfo>
                <StatValue>{isDaily ? team24hCommits : teamTotalCommits}</StatValue>
                <StatLabel>{isDaily ? '24h GitHub Commits' : 'Total GitHub Commits'}</StatLabel>
              </StatInfo>
            </StatCard>

            <StatCard>
              <StatIconSvg>
                <LeetCodeLogoIcon size={24} />
              </StatIconSvg>
              <StatInfo>
                <StatValue $yellow>{isDaily ? team24hLeetcode : teamTotalLeetcode}</StatValue>
                <StatLabel>{isDaily ? '24h LeetCode Solved' : 'Total LeetCode Solved'}</StatLabel>
              </StatInfo>
            </StatCard>
          </StatsGrid>

          <SectionHeadingRow>
            <SectionHeading>
              {isDaily ? "Today's Member Progress (Last 24 Hours)" : "All-Time Leaderboard"}
            </SectionHeading>
            <SubNotice>
              {isDaily ? "Updated live based on the last 24h activity" : "Cumulative activity score"}
            </SubNotice>
          </SectionHeadingRow>

          <MemberList>
            {activeLeaderboard.map((member, index) => {
              const isCurrentUser =
                currentUser && (member.id === currentUser._id || member.id === currentUser.id);

              const commits = isDaily ? (member.github24hCommits || 0) : (member.githubTotalCommits || 0);
              const leetcodeCount = isDaily ? (member.leetcode24hSolved || 0) : (member.leetcodeTotalSolved || 0);

              const githubPercent = Math.round((commits / maxCommits) * 100);
              const leetcodePercent = Math.round((leetcodeCount / maxLeetcode) * 100);

              let rankBadge = `${index + 1}`;
              let rankType = 'normal';
              if (index === 0) rankType = 'gold';
              else if (index === 1) rankType = 'silver';
              else if (index === 2) rankType = 'bronze';

              const questions24h = member.leetcode24hQuestions || [];

              return (
                <MemberCard key={member.id} $isSelf={isCurrentUser}>
                  <MemberHeader>
                    <MemberLeft>
                      <RankBadge $type={rankType}>{rankBadge}</RankBadge>
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
                            <GitHubLogo size={12} color="#8a8a8a" />
                            GitHub ↗
                          </ProfileLink>
                          <ProfileLink
                            href={`https://leetcode.com/u/${member.leetcodeUsername || member.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            $leetcode
                          >
                            <LeetCodeLogoIcon size={12} />
                            LeetCode ↗
                          </ProfileLink>
                        </ProfileLinks>
                      </UserInfo>
                    </MemberLeft>

                    <TotalScorePill>
                      {isDaily ? '24h Score: ' : 'Total Score: '}
                      <ScoreVal>{isDaily ? (member.dailyScore || 0) : (member.totalScore || 0)}</ScoreVal>
                    </TotalScorePill>
                  </MemberHeader>

                  <ProgressGrid>
                    <MetricBox>
                      <MetricHeader>
                        <MetricTitle>
                          <GitHubLogo size={14} color="#b3b3b3" />
                          <span>{isDaily ? '24h GitHub Commits' : 'Total GitHub Commits'}</span>
                        </MetricTitle>
                        <MetricValue $color="#b3b3b3">{commits} {commits === 1 ? 'commit' : 'commits'}</MetricValue>
                      </MetricHeader>
                      <ProgressBarTrack>
                        <ProgressBarFill $width={githubPercent} $color="#60a5fa" />
                      </ProgressBarTrack>
                    </MetricBox>

                    <MetricBox>
                      <MetricHeader>
                        <MetricTitle>
                          <LeetCodeLogoIcon size={14} />
                          <span>{isDaily ? '24h LeetCode Solved' : 'Total LeetCode Solved'}</span>
                        </MetricTitle>
                        <MetricValue $color="#ffa116">
                          {leetcodeCount} solved {isDaily && <MutedText>({member.leetcodeTotalSolved || 0} total)</MutedText>}
                        </MetricValue>
                      </MetricHeader>
                      <ProgressBarTrack>
                        <ProgressBarFill $width={leetcodePercent} $color="#ffa116" />
                      </ProgressBarTrack>
                    </MetricBox>
                  </ProgressGrid>

                  {/* 24-Hour Solved LeetCode Questions List Dropdown */}
                  {isDaily && (
                    <QuestionsDropdown questions={questions24h} />
                  )}
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TopActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LeaveButton = styled.button`
  background-color: transparent;
  color: #f87171;
  border: 1px solid #5c2020;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #2a1515;
    border-color: #dc2626;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BackButton = styled.button`
  background: transparent;
  border: 1px solid #3a3a3a;
  color: #eff1f6bf;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #282828;
    color: #ffffff;
    border-color: #555555;
  }
`;

const RefreshButton = styled.button`
  background: transparent;
  border: 1px solid #3a3a3a;
  color: #eff1f6bf;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #282828;
    color: #ffffff;
    border-color: #555555;
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

const LoadingState = styled.div`
  background: #282828;
  border: 1px solid #3a3a3a;
  padding: 60px 20px;
  border-radius: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Spinner = styled.div`
  border: 3px solid #3a3a3a;
  border-top: 3px solid #ffa116;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: ${spin} 0.8s linear infinite;
  margin-bottom: 16px;
`;

const LoadingText = styled.p`
  color: #eff1f6bf;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
`;

const ErrorBox = styled.div`
  background: #2a1515;
  border: 1px solid #5c2020;
  padding: 32px;
  border-radius: 8px;
  text-align: center;
`;

const ErrorText = styled.p`
  color: #f87171;
  font-size: 14px;
  margin: 0 0 16px 0;
`;

const RetryButton = styled.button`
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background-color: #b91c1c; }
`;

const HeaderCard = styled.div`
  background: #282828;
  padding: 22px 28px;
  border-radius: 8px;
  border: 1px solid #3a3a3a;
  margin-bottom: 18px;
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
  font-size: 22px;
  color: #ffffff;
  font-weight: 700;
`;

const IdBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #1a1a1a;
  border: 1px solid #3a3a3a;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  width: fit-content;
  transition: border-color 0.15s;

  &:hover {
    border-color: #ffa116;
  }
`;

const IdLabel = styled.span`
  color: #8a8a8a;
`;

const IdCode = styled.code`
  font-family: monospace;
  font-weight: 600;
  color: #ffffff;
`;

const CopyTag = styled.span`
  color: #ffa116;
  font-weight: 600;
  font-size: 11px;
  margin-left: 4px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  background-color: #1f1f1f;
  border: 1px solid #3a3a3a;
  padding: 4px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 9px 16px;
  border-radius: 6px;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  background-color: ${props => props.$active ? '#282828' : 'transparent'};
  color: ${props => props.$active ? '#ffa116' : '#8a8a8a'};
  border: ${props => props.$active ? '1px solid #3a3a3a' : '1px solid transparent'};

  &:hover {
    color: ${props => props.$active ? '#ffa116' : '#ffffff'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: #282828;
  border-radius: 8px;
  padding: 16px 20px;
  border: 1px solid #3a3a3a;
  display: flex;
  align-items: center;
  gap: 14px;
`;

const StatIcon = styled.div`
  font-size: 24px;
  background-color: #1a1a1a;
  border: 1px solid #3a3a3a;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatIconSvg = styled.div`
  background-color: #1a1a1a;
  border: 1px solid #3a3a3a;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.span`
  font-size: 22px;
  font-weight: 800;
  color: ${props => props.$yellow ? '#ffa116' : '#ffffff'};
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: #8a8a8a;
  font-weight: 500;
`;

const SectionHeadingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 14px;
`;

const SectionHeading = styled.h2`
  font-size: 16px;
  color: #ffffff;
  font-weight: 700;
  margin: 0;
`;

const SubNotice = styled.span`
  font-size: 12px;
  color: #8a8a8a;
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const MemberCard = styled.div`
  background: #282828;
  border-radius: 8px;
  padding: 18px 20px;
  border: 1px solid ${props => props.$isSelf ? '#ffa11666' : '#3a3a3a'};
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${props => props.$isSelf ? '#ffa116' : '#555555'};
  }
`;

const MemberHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
`;

const MemberLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RankBadge = styled.div`
  font-size: 12px;
  font-weight: 800;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${props =>
    props.$type === 'gold' ? '#ffa116' :
    props.$type === 'silver' ? '#b3b3b3' :
    props.$type === 'bronze' ? '#cd7f32' : '#3a3a3a'
  };
  color: ${props =>
    props.$type === 'gold' || props.$type === 'silver' || props.$type === 'bronze' ? '#1a1a1a' : '#eff1f6bf'
  };
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #3a3a3a;
  background-color: #1a1a1a;
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
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
`;

const YouTag = styled.span`
  background-color: #ffa116;
  color: #1a1a1a;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
`;

const ProfileLinks = styled.div`
  display: flex;
  gap: 10px;
`;

const ProfileLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.$leetcode ? '#ffa116' : '#8a8a8a'};
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: ${props => props.$leetcode ? '#ffb732' : '#ffffff'};
  }
`;

const TotalScorePill = styled.div`
  background-color: #1a1a1a;
  border: 1px solid #3a3a3a;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #8a8a8a;
  font-weight: 600;
`;

const ScoreVal = styled.span`
  color: #ffa116;
  font-weight: 800;
  font-size: 14px;
`;

const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 8px;

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
  font-size: 12px;
  color: #8a8a8a;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MetricValue = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${props => props.$color || '#ffffff'};
`;

const MutedText = styled.span`
  font-size: 11px;
  color: #666666;
  font-weight: 500;
  margin-left: 4px;
`;

const ProgressBarTrack = styled.div`
  background-color: #1a1a1a;
  border: 1px solid #3a3a3a;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
`;

const ProgressBarFill = styled.div`
  background-color: ${props => props.$color || '#ffa116'};
  height: 100%;
  width: ${props => Math.min(Math.max(props.$width, 4), 100)}%;
  border-radius: 4px;
  transition: width 0.4s ease-out;
`;

const QuestionsSection = styled.div`
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #3a3a3a;
`;

const QuestionsHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background-color: #1f1f1f;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #ffa116;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;

  &:hover {
    background-color: #2a2200;
    border-color: #ffa11655;
  }
`;

const HeadingLeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DropdownIcon = styled.span`
  font-size: 10px;
  color: #ffa116;
  transition: transform 0.2s ease;
  transform: ${props => (props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const QuestionsDropdownContent = styled.div`
  margin-top: 8px;
  padding: 10px;
  background-color: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
`;

const QuestionCountBadge = styled.span`
  background-color: #ffa11625;
  color: #ffa116;
  font-size: 11px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 9999px;
  border: 1px solid #ffa11640;
`;

const QuestionPillGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const QuestionPill = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #282828;
  border: 1px solid #3a3a3a;
  color: #ffa116;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.15s ease;

  &:hover {
    background-color: #2a2200;
    border-color: #ffa116;
    color: #ffb732;
  }
`;

const NoQuestionsText = styled.p`
  font-size: 12px;
  color: #666666;
  font-style: italic;
  margin: 0;
`;
