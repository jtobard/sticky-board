import React from 'react';
import { MousePointer, StickyNote } from 'phosphor-react';

interface ToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onColorChange: (color: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolChange, onColorChange }) => {
  return (
    <div className="fixed top-4 left-4 bg-white rounded-lg shadow-lg p-2 flex gap-2 z-50">
      <button
        onClick={() => onToolChange('select')}
        className={`p-2 rounded ${activeTool === 'select' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
        title="Select"
      >
        <MousePointer size={20} />
      </button>
      
      <button
        onClick={() => onToolChange('sticky')}
        className={`p-2 rounded ${activeTool === 'sticky' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
        title="Add Sticky"
      >
        <StickyNote size={20} />
      </button>

      <div className="w-px bg-gray-300" />

      <input
        type="color"
        onChange={(e) => onColorChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer"
        title="Sticky Color"
      />
    </div>
  );
};