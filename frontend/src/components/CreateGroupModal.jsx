import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { API_BASE_URL } from '../config';

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
      const response = await fetch(`${API_BASE_URL}/api/group/create-group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send our session cookies securely
        body: JSON.stringify({ name: groupName }),
      });

      const data = await response.json();

      if (response.ok) {
        setGroupName('');
        onGroupCreated(data.group); // Let Homepage know a group was created (e.g., to update list)
        onClose(); // Close the modal
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
      <Subtitle>Team up with friends to track LeetCode and GitHub stats together!</Subtitle>
      
      <form onSubmit={handleSubmit}>
        <Input 
          type="text" 
          placeholder="Enter group name (e.g., LeetCode Legends)..." 
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