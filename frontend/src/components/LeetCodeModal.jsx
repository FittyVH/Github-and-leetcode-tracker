import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from './Modal';

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
      const response = await fetch("http://localhost:3000/api/auth/leetcode", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
  margin: 0 0 8px 0;
  color: #111827;
  font-size: 20px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #4b5563;
  font-size: 14px;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 14px;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
  }
`;

const HintText = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 6px 0 16px 0;
  code {
    background-color: #f3f4f6;
    padding: 2px 5px;
    border-radius: 4px;
    color: #111827;
  }
`;

const ErrorText = styled.p`
  color: #dc2626;
  font-size: 13px;
  margin: -4px 0 12px 0;
`;

const SuccessText = styled.p`
  color: #059669;
  font-size: 13px;
  font-weight: 600;
  margin: -4px 0 12px 0;
`;

const ActionGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
`;

const CancelButton = styled.button`
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
  &:hover:not(:disabled) { background-color: #f9fafb; }
`;

const SubmitButton = styled.button`
  background-color: #d97706;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;
  &:hover:not(:disabled) { background-color: #b45309; }
  &:disabled { background-color: #fcd34d; cursor: not-allowed; }
`;
