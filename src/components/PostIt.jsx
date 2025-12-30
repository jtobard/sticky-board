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
            id={`postit-${id}`}
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
            className={`post-it-card group relative`}
            onMouseDown={handleMouseDown}
            onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
            }}
        >
            <div id={`postit-content-${id}`} className="w-full h-full relative" style={{ padding: PADDING, boxSizing: 'border-box' }}>
                {isEditing ? (
                    <textarea
                        id={`postit-textarea-${id}`}
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
                        id={`postit-text-${id}`}
                        className="w-full h-full overflow-hidden break-words select-none cursor-move"
                        style={{ 
                            fontSize: getFontSize(content), 
                            color: 'black',
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 'unset',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}
                    >
                        {content || <span className="opacity-30 italic">Empty...</span>}
                    </div>
                )}
            </div>

            {/* Delete Button */}
            {!isDragging && !isResizing && (
                <button
                    id={`postit-delete-${id}`}
                    className="absolute w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-lg hover:scale-110 transition-all duration-200"
                    style={{ pointerEvents: 'auto', position: 'absolute', top: 0, right: 0, zIndex: 100 }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        updatePostIt(id, null, false, true);
                    }}
                >
                    ✕
                </button>
            )}

            {/* Resize Handle */}
            <div
                id={`postit-resize-${id}`}
                className="w-4 h-4 cursor-se-resize z-10"
                style={{ pointerEvents: 'auto', position: 'absolute', bottom: 0, right: 0 }}
                    onMouseDown={handleResizeStart}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 14L16 16L14 16L16 14Z" fill="currentColor" fillOpacity="0.5" />
                        <path d="M16 9L16 11L9 16L11 16L16 9Z" fill="currentColor" fillOpacity="0.5" />
                        <path d="M16 4L16 6L4 16L6 16L16 4Z" fill="currentColor" fillOpacity="0.5" />
                    </svg>
                </div>
        </div>
    );
};
export default PostIt;
