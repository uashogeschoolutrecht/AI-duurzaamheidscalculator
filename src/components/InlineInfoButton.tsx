import React from 'react';

interface InfoButtonProps {
  text: string;
}

const InlineInfoButton: React.FC<InfoButtonProps> = ({ text }) => {
  return (
    <div className="relative group inline-block ml-2 cursor-pointer text-blue-600 font-bold">
      i
      <div className="absolute z-10 hidden group-hover:block w-80 p-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-lg top-6 right-0">
        {text.split('\n').map((line, i) => (
          <p key={i} className="mb-1">{line}</p>
        ))}
      </div>
    </div>
  );
};

export default InlineInfoButton;