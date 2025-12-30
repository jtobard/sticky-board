import React, { useState, useRef, useEffect } from 'react';

const PostIt = ({ id, x, y, width = 160, height = 160, content, color, updatePostIt, zoom }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const offset = useRef({ x: 0, y: 0 });
    const resizeStart = useRef({ w: 0, h: 0, x: 0, y: 0 });

    // Padding for aesthetics
    const PADDING = 10;

    const getFontSize = (text, w, h) => {
        // Basic area calculation to scale font?
        // Or just length based?
        // Let's stick to length based but modified by size factor if needed.
        // For simplicity, length is robust.
        const len = text.length;
        if (len < 10) return '24px';
        if (len < 20) return '20px';
        if (len < 50) return '16px';
        if (len < 100) return '14px';
        return '12px';
    };

    const handleMouseDown = (e) => {
        if (isEditing || isResizing) return;
        e.stopPropagation();
        setIsDragging(true);
        offset.current = {
            startX: e.clientX,
            startY: e.clientY,
            origX: x,
            origY: y
        };
    };

    const handleResizeStart = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);
        resizeStart.current = {
            startX: e.clientX,
            startY: e.clientY,
            startW: width,
            startH: height
        };
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                const dx = e.clientX - offset.current.startX;
                const dy = e.clientY - offset.current.startY;
                updatePostIt(id, {
                    x: offset.current.origX + dx,
                    y: offset.current.origY + dy
                });
            }
            if (isResizing) {
                const dx = e.clientX - resizeStart.current.startX;
                const dy = e.clientY - resizeStart.current.startY;
                updatePostIt(id, {
                    width: Math.max(80, resizeStart.current.startW + dx),
                    height: Math.max(80, resizeStart.current.startH + dy)
                });
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                updatePostIt(id, {}, true); // Snap
            }
            if (isResizing) {
                setIsResizing(false);
                updatePostIt(id, {}, true);
            }
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, id, updatePostIt]);

    return (
        <div
            style={{
                transform: `translate(${x}px, ${y}px) ${isDragging ? 'rotate(-2deg) scale(1.05)' : ''}`,
                width: width,
                height: height,
                backgroundColor: color,
                position: 'absolute',
                boxShadow: isDragging 
                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 12px 25px -8px rgba(0, 0, 0, 0.2)'
                    : '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.08)',
                transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: isDragging || isResizing ? 1000 : 500,
                pointerEvents: 'auto'
            }}
            className={`post-it-card flex flex-col p-2 group`}
            onMouseDown={handleMouseDown}
            onDoubleClick={() => setIsEditing(true)}
        >
            <div className="flex-1 w-full h-full relative" style={{ padding: PADDING }}>
                {isEditing ? (
                    <textarea
                        autoFocus
                        className="w-full h-full bg-transparent resize-none outline-none border-none font-sans"
                        style={{ fontSize: getFontSize(content), color: 'black' }}
                        value={content}
                        onChange={(e) => updatePostIt(id, { content: e.target.value })}
                        onBlur={() => setIsEditing(false)}
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                ) : (
                    <div
                        className="w-full h-full overflow-hidden break-words whitespace-pre-wrap select-none cursor-move"
                        style={{ fontSize: getFontSize(content), color: 'black' }}
                    >
                        {content || <span className="opacity-30 italic">Empty...</span>}
                    </div>
                )}

                {/* Delete Button */}
                {!isDragging && !isResizing && (
                    <button
                        className="absolute top-[-10px] right-[-10px] w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs shadow-lg hover:scale-110 transition-all duration-200"
                        onClick={(e) => {
                            e.stopPropagation();
                            updatePostIt(id, null, false, true);
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Resize Handle */}
            <div
                className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-end justify-end p-1 opacity-0 group-hover:opacity-100"
                onMouseDown={handleResizeStart}
            >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
                    <path d="M10 8L10 10L8 10L10 8Z" fill="black" />
                    <path d="M10 4L10 6L4 10L6 10L10 4Z" fill="black" />
                    <path d="M10 0L10 2L0 10L2 10L10 0Z" fill="black" />
                </svg>
            </div>
        </div>
    );
};
export default PostIt;
