import React, { useState } from 'react';

interface StickyNoteProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onSelect?: (id: string) => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({ id, x, y, width, height, onSelect }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que el evento llegue al Canvas
    setIsEditing(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que el evento llegue al Canvas
    if (isEditing) return;
    onSelect?.(id);
    setIsDragging(true);
    setDragStart({ x: e.clientX - x, y: e.clientY - y });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir eventos de propagación
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY, width, height });
  };

  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width: isResizing ? undefined : width,
        height: isResizing ? undefined : height,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      {/* Contenido de la nota */}
      <div className="p-2 bg-yellow-300 rounded shadow-md">
        {/* Aquí va el contenido de la nota */}
      </div>

      {/* Handle de resize */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        style={{
          background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.2) 50%)',
        }}
        onMouseDown={handleResizeStart}
      />
    </div>
  );
};

export default StickyNote;