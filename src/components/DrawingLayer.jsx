import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

const DrawingLayer = forwardRef(({ width, height, tool, color, zoom, active }, ref) => {
    // width and height in squares
    const GRID_SIZE = 160;
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const pixelWidth = width * GRID_SIZE;
    const pixelHeight = height * GRID_SIZE;

    useImperativeHandle(ref, () => ({
        getDataURL: () => {
            return canvasRef.current ? canvasRef.current.toDataURL() : null;
        },
        loadImage: (dataUrl) => {
            const canvas = canvasRef.current;
            if (!canvas || !dataUrl) return;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = dataUrl;
        },
        clear: () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, []);

    const getCoords = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        // rect is scaled by zoom.
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        return { x, y };
    }

    const startDrawing = (e) => {
        if (!active && tool === 'select') return;
        if (tool === 'select') return;

        e.preventDefault();
        e.stopPropagation();

        const { x, y } = getCoords(e);
        lastPos.current = { x, y };
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        e.stopPropagation();

        const ctx = canvasRef.current.getContext('2d');
        const { x, y } = getCoords(e);

        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(x, y);

        if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 20;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineWidth = 4;
            ctx.strokeStyle = color;
        }

        ctx.stroke();
        lastPos.current = { x, y };
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    return (
        <canvas
            ref={canvasRef}
            width={pixelWidth}
            height={pixelHeight}
            className={`absolute top-0 left-0 ${tool === 'select' ? 'pointer-events-none' : 'cursor-crosshair'}`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{
                position: 'absolute',
                zIndex: 1
            }}
        />
    );
});

export default DrawingLayer;
