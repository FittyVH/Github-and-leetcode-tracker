import React, { useEffect } from 'react';
import styled from 'styled-components';

export default function Modal({ isOpen, onClose, children }) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Close modal">&times;</CloseButton>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
}

// --- STYLED COMPONENTS ---

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #282828;
  border: 1px solid #3a3a3a;
  padding: 30px;
  border-radius: 8px;
  width: 440px;
  max-width: 90%;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 22px;
  line-height: 1;
  color: #8a8a8a;
  cursor: pointer;
  transition: color 0.15s;
  &:hover {
    color: #ffffff;
  }
`;