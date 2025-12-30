import React, { useRef, useEffect } from 'react';

const Board = ({
    children,
    width = 20,
    height = 20,
    scale = 1,
    position = { x: 0, y: 0 },
    onPan,
    onDoubleClick
}) => {
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const GRID_SIZE = 160;

    const handleMouseDown = (e) => {
        if (e.target === e.currentTarget || e.target.classList.contains('board-grid')) {
            isDragging.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging.current) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;

            onPan({ x: position.x + dx, y: position.y + dy });
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleDoubleClick = (e) => {
        // Always create post-it on double click anywhere on the board
        onDoubleClick?.(e.clientX, e.clientY);
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-hidden relative cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            style={{
                backgroundColor: 'var(--bg-color)',
                touchAction: 'none',
                zIndex: 1
            }}
        >
            {/* Render Content */}
            <div
                className="board-grid absolute origin-top-left shadow-lg transition-transform will-change-transform"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    width: `${width * GRID_SIZE}px`,
                    height: `${height * GRID_SIZE}px`,
                    backgroundColor: 'white',
                    borderRight: '2px solid rgba(0,0,0,0.1)',
                    borderBottom: '2px solid rgba(0,0,0,0.1)',
                    backgroundImage: `
                    linear-gradient(var(--grid-color) 1px, transparent 1px),
                    linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)
                `,
                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                    zIndex: -1
                }}
            >
                {children}
                {/* Draw layer will be injected here as child or parallel */}
            </div>

            {/* Helper overlay moved to App or kept here? Kept here for simplicity but controlled by props */}
            <div className="absolute bottom-4 right-4 glass-panel px-3 py-1 text-sm font-mono pointer-events-none">
                {Math.round(scale * 100)}%
            </div>
        </div>
    );
};

export default Board;
