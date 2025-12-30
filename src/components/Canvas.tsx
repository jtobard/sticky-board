import React, { useState } from 'react';

export const Canvas: React.FC<CanvasProps> = ({ tool, stickyColor }) => {
  const [stickies, setStickies] = useState<Sticky[]>([]);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (tool === 'sticky') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - offset.x;
      const y = e.clientY - rect.top - offset.y;

      const newSticky: Sticky = {
        id: Date.now().toString(),
        x,
        y,
        width: 200,
        height: 200,
        content: '',
        color: stickyColor,
      };

      setStickies([...stickies, newSticky]);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (tool === 'select' && e.target === e.currentTarget) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div
      className="w-full h-screen overflow-hidden bg-gray-100 relative"
      style={{ cursor: isPanning ? 'grabbing' : tool === 'select' ? 'grab' : 'crosshair' }}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: `${offset.x}px ${offset.y}px`,
        }}
        onDoubleClick={handleCanvasClick}
      >
        {stickies.map((sticky) => (
          // ...existing code...
        ))}
      </div>
    </div>
  );
};