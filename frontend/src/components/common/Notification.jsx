// frontend/src/components/common/Notification.jsx
import React from 'react';

const Notification = ({ message, type }) => {
  if (!message) return null;

  let classes = "p-3 rounded-md mb-4 text-white";

  if (type === 'error') {
    classes += " bg-red-500";
  } else if (type === 'success') {
    classes += " bg-green-500";
  } else if (type === 'info') {
    classes += " bg-blue-500";
  }

  return (
    <div className={classes} role="alert">
      <p>{message}</p>
    </div>
  );
};

export default Notification;