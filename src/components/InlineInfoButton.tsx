// SPDX-License-Identifier: EUPL-1.2
// Copyright (C) 2025 Saddik Khaddamellah
// Met dank aan Erik Slingerland voor begeleiding.
import React from 'react';

// Props-type voor de InlineInfoButton: verwacht een tekst
interface InfoButtonProps {
  text: string;
}

// InlineInfoButton toont een kleine "i" naast een label of tekst.
// Bij hover verschijnt een kleine tooltip met uitleg.
const InlineInfoButton: React.FC<InfoButtonProps> = ({ text }) => {
  return (
    <div className="relative group inline-block ml-2 cursor-pointer text-blue-600 font-bold">
      {/* De inline info "i" */}
      i
      {/* Tooltip met uitleg, verschijnt bij hover */}
      <div className="absolute z-10 hidden group-hover:block w-80 p-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-lg top-6 right-0">
        {text.split('\n').map((line, i) => (
          <p key={i} className="mb-1">{line}</p>
        ))}
      </div>
    </div>
  );
};

export default InlineInfoButton;