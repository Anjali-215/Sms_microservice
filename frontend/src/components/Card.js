import React from 'react';

function Card({ title, children, className = '', headerAction }) {
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {headerAction}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default Card;
