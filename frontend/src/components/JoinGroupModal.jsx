import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from './Modal';

export default function JoinGroupModal({ isOpen, onClose, onGroupJoined }) {
  const [groupId, setGroupId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedId = groupId.trim();
    if (!trimmedId) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3000/api/group/join-group/${trimmedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setGroupId('');
        if (onGroupJoined) {
          onGroupJoined(data.group);
        }
        onClose();
      } else {
        setError(data.message || "Failed to join group.");
      }
    } catch (err) {
      console.error("Error joining group:", err);
      setError("Server error. Please check the Group ID and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Title>Join an Existing Group</Title>
      <Subtitle>Enter the Group ID shared by your friend or teammate to join their group.</Subtitle>
      
      <form onSubmit={handleSubmit}>
        <Input 
          type="text" 
          placeholder="Paste Group ID here (e.g. 64b8f...)..." 
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          disabled={isSubmitting}
          required
        />
        
        {error && <ErrorText>{error}</ErrorText>}

        <ActionGroup>
          <CancelButton type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </CancelButton>
          <SubmitButton type="submit" disabled={isSubmitting || !groupId.trim()}>
            {isSubmitting ? "Joining..." : "Join Group"}
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
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 14px;
  margin-bottom: 12px;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }
`;

const ErrorText = styled.p`
  color: #dc2626;
  font-size: 13px;
  margin: -4px 0 12px 0;
`;

const ActionGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
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
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
  &:hover:not(:disabled) { background-color: #1d4ed8; }
  &:disabled { background-color: #93c5fd; cursor: not-allowed; }
`;
