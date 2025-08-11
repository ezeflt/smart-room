import React from 'react';
import './Modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  message: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, message }) => {
  if (!open) return null;
  return (
    <div className="modal-container">
      <div className="modal-box">
        <div className="modal-message">{message}</div>
        <button className="modal-button" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default Modal; 