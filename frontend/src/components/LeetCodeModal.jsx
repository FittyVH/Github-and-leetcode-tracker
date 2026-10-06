import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { API_BASE_URL, authFetch } from '../config';

export default function LeetCodeModal({ isOpen, onClose, currentUsername, onUserUpdated }) {
  const [inputUrl, setInputUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (currentUsername) {
      setInputUrl(`https://leetcode.com/u/${currentUsername}`);
    } else {
      setInputUrl('');
    }
    setError('');
    setSuccessMsg('');
  }, [currentUsername, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await authFetch(`${API_BASE_URL}/api/auth/leetcode`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leetcodeUrl: inputUrl.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`Linked LeetCode profile: @${data.user.leetcodeUsername}!`);
        if (onUserUpdated) {
          onUserUpdated(data.user);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(data.message || "Failed to update LeetCode profile.");
      }
    } catch (err) {
      console.error("Error updating LeetCode profile:", err);
      setError("Server error updating profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Title>Link LeetCode Profile</Title>
      <Subtitle>
        Enter your LeetCode profile URL or username so your solved problem counts appear on group leaderboards.
      </Subtitle>

      <form onSubmit={handleSubmit}>
        <InputLabel>LeetCode Profile URL or Username</InputLabel>
        <Input
          type="text"
          placeholder="e.g. https://leetcode.com/u/john_doe or john_doe"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          disabled={isSubmitting}
          required
        />

        <HintText>
          Example: <code>https://leetcode.com/u/username/</code> or simply <code>username</code>
        </HintText>

        {error && <ErrorText>{error}</ErrorText>}
        {successMsg && <SuccessText>{successMsg}</SuccessText>}

        <ActionGroup>
          <CancelButton type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </CancelButton>
          <SubmitButton type="submit" disabled={isSubmitting || !inputUrl.trim()}>
            {isSubmitting ? "Saving..." : "Save Profile"}
          </SubmitButton>
        </ActionGroup>
      </form>
    </Modal>
  );
}

// --- STYLED COMPONENTS ---

const Title = styled.h3`
  margin: 0 0 6px 0;
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #8a8a8a;
  font-size: 13px;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #b3b3b3;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  background-color: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 14px;
  color: #ffffff;
  transition: border-color 0.15s;

  &::placeholder {
    color: #555555;
  }

  &:focus {
    outline: none;
    border-color: #ffa116;
  }
`;

const HintText = styled.p`
  font-size: 12px;
  color: #8a8a8a;
  margin: 6px 0 16px 0;
  code {
    background-color: #1f1f1f;
    border: 1px solid #3a3a3a;
    padding: 2px 6px;
    border-radius: 4px;
    color: #ffa116;
  }
`;

const ErrorText = styled.p`
  color: #f87171;
  font-size: 13px;
  margin: -4px 0 12px 0;
`;

const SuccessText = styled.p`
  color: #2cbb5d;
  font-size: 13px;
  font-weight: 600;
  margin: -4px 0 12px 0;
`;

const ActionGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
`;

const CancelButton = styled.button`
  background: transparent;
  border: 1px solid #3a3a3a;
  color: #b3b3b3;
  padding: 9px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover:not(:disabled) {
    background-color: #333333;
    color: #ffffff;
  }
`;

const SubmitButton = styled.button`
  background-color: #ffa116;
  color: #1a1a1a;
  border: none;
  padding: 9px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s;
  &:hover:not(:disabled) {
    background-color: #ffb732;
  }
  &:disabled {
    background-color: #66460f;
    color: #888888;
    cursor: not-allowed;
  }
`;
