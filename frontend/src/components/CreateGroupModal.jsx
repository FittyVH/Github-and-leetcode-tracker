import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { API_BASE_URL, authFetch } from '../config';

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await authFetch(`${API_BASE_URL}/api/group/create-group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName }),
      });

      const data = await response.json();

      if (response.ok) {
        setGroupName('');
        onGroupCreated(data.group);
        onClose();
      } else {
        setError(data.message || "Failed to create group.");
      }
    } catch (err) {
      console.error("Error creating group:", err);
      setError("Server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Title>Create a New Group</Title>
      <Subtitle>Team up with friends to track LeetCode and GitHub stats together</Subtitle>
      
      <form onSubmit={handleSubmit}>
        <Input 
          type="text" 
          placeholder="Enter group name (e.g. Daily LeetCoders)..." 
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          disabled={isSubmitting}
          required
          maxLength="30"
        />
        
        {error && <ErrorText>{error}</ErrorText>}

        <ActionGroup>
          <CancelButton type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </CancelButton>
          <SubmitButton type="submit" disabled={isSubmitting || !groupName.trim()}>
            {isSubmitting ? "Creating..." : "Create"}
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

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  background-color: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 12px;
  transition: border-color 0.15s;

  &::placeholder {
    color: #555555;
  }

  &:focus {
    outline: none;
    border-color: #ffa116;
  }
`;

const ErrorText = styled.p`
  color: #f87171;
  font-size: 13px;
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