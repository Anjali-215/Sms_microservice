import React from 'react';

function PageHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
      <div className="flex items-center">
        {Icon && (
          <div className="p-2 bg-blue-100 rounded-lg mr-4">
            <Icon className="w-8 h-8 text-blue-600" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <img src="/smslogo.png" alt="SMS Logo" className="h-12 w-12" />
    </div>
  );
}

export default PageHeader;
