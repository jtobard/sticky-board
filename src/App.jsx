import React, { useState, useCallback, useRef } from 'react';
import Board from './components/Board';
import PostIt from './components/PostIt';
import DrawingLayer from './components/DrawingLayer';

function App() {
  const [boardConfig, setBoardConfig] = useState({
    width: 20,
    height: 20
  });

  // Board State
  const [zoom] = useState(1); // Fixed zoom at 1x
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Tool State
  const [activeTool, setActiveTool] = useState('select'); // select, pen, eraser
  const [penColor, setPenColor] = useState('#000000'); // black, red, blue

  const [postIts, setPostIts] = useState([]);

  const drawingLayerRef = useRef(null);

  // Menu visibility
  const [showConfig, setShowConfig] = useState(false);

  // Modern Pastel Colors
  const COLORS = [
    '#fef3c7', // Warm yellow
    '#fed7aa', // Peach
    '#fecaca', // Coral pink
    '#fbbf24', // Golden yellow
    '#c7d2fe', // Soft indigo
    '#bae6fd', // Sky blue
    '#bbf7d0', // Mint green
    '#fbcfe8', // Rose pink
  ];

  const addPostIt = () => {
    const newId = crypto.randomUUID();
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    // Add at center of screen (viewport)
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    
    // Since zoom is 1, just subtract pan to get board coordinates
    const boardX = screenCenterX - pan.x - 80; // Center the post-it (80 is half width)
    const boardY = screenCenterY - pan.y - 80; // Center the post-it (80 is half height)

    setPostIts(prev => [
      ...prev,
      {
        id: newId,
        x: boardX,
        y: boardY,
        content: '',
        color: color
      }
    ]);
  };

  const addPostItAt = (clientX, clientY) => {
    const newId = crypto.randomUUID();
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    // Since zoom is 1, just subtract pan to get board coordinates
    const boardX = clientX - pan.x - 80; // 80 is half the default width
    const boardY = clientY - pan.y - 80; // 80 is half the default height

    setPostIts(prev => [
      ...prev,
      {
        id: newId,
        x: boardX,
        y: boardY,
        content: '',
        color: color
      }
    ]);
  };

  const updatePostIt = useCallback((id, changes, snap = false, remove = false) => {
    setPostIts(prev => {
      if (remove) return prev.filter(p => p.id !== id);

      return prev.map(p => {
        if (p.id !== id) return p;

        let updates = { ...changes };
        if (snap && updates.x !== undefined) {
          const SNAP = 40;
          updates.x = Math.round(updates.x / SNAP) * SNAP;
          updates.y = Math.round(updates.y / SNAP) * SNAP;

          // Bounds check
          updates.x = Math.max(0, Math.min(updates.x, boardConfig.width * 160 - 160));
          updates.y = Math.max(0, Math.min(updates.y, boardConfig.height * 160 - 160));
        }
        return { ...p, ...updates };
      });
    });
  }, [boardConfig]);

  const clearBoard = () => {
    if (confirm('Are you sure you want to clear the board? This will delete all notes and drawings.')) {
      setPostIts([]);
      if (drawingLayerRef.current) drawingLayerRef.current.clear();
    }
  };

  const saveProject = () => {
    const data = {
      version: 1,
      date: new Date().toISOString(),
      config: boardConfig,
      postIts: postIts,
      drawing: drawingLayerRef.current ? drawingLayerRef.current.getDataURL() : null
    };

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `postit-playground-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.config) setBoardConfig(data.config);
        if (data.postIts) setPostIts(data.postIts);
        if (data.drawing && drawingLayerRef.current) {
          drawingLayerRef.current.loadImage(data.drawing);
        }
      } catch (err) {
        alert('Failed to load file');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const toggleConfig = () => setShowConfig(!showConfig);

  return (
    <div className="app-container relative w-full h-full overflow-hidden">
      {/* Tools UI */}
      <div className="absolute top-6 left-6 z-50 flex flex-col gap-3 pointer-events-none w-min">
        <div className="glass-panel p-2 flex gap-1.5 pointer-events-auto items-center w-max">
          {/* Menu / Config */}
          <button onClick={toggleConfig} className="icon-btn" title="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className="w-px bg-gray-300 h-6"></div>

          <button
            onClick={addPostIt}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold shadow-md hover:shadow-lg flex items-center gap-1.5 text-sm transition-all duration-200 hover:scale-105 whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New
          </button>

          <div className="w-px bg-gray-300 h-6"></div>

          {/* Tools */}
          <button
            className={`icon-btn ${activeTool === 'select' ? 'active' : ''}`}
            onClick={() => setActiveTool('select')}
            title="Select / Move"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
            </svg>
          </button>
          <button
            className={`icon-btn ${activeTool === 'pen' ? 'active' : ''}`}
            onClick={() => setActiveTool('pen')}
            title="Draw"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              <path d="M2 2l7.586 7.586"/>
              <circle cx="11" cy="11" r="2"/>
            </svg>
          </button>
          <button
            className={`icon-btn ${activeTool === 'eraser' ? 'active' : ''}`}
            onClick={() => setActiveTool('eraser')}
            title="Erase"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 20H7L3 16c-1-1-1-2.5 0-3.5L12 3c1-1 2.5-1 3.5 0l5.5 5.5c1 1 1 2.5 0 3.5L13 20"/>
              <path d="M7 20l5-5"/>
            </svg>
          </button>
        </div>

        {/* Color Picker (Only if Pen) */}
        {activeTool === 'pen' && (
          <div className="glass-panel p-2 flex gap-1.5 pointer-events-auto animate-in fade-in slide-in-from-left-4 duration-200 w-max">
            {['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'].map(c => (
              <button
                key={c}
                onClick={() => setPenColor(c)}
                className={`w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 ${penColor === c ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : 'hover:ring-2 hover:ring-offset-2 hover:ring-gray-300'}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        )}
      </div>

      {/* Config Menu Modal */}
      {showConfig && (
        <div className="absolute top-20 left-6 z-50 glass-panel p-4 flex flex-col gap-4 w-64 animate-in zoom-in-95 duration-100 pointer-events-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-800">Settings</h3>
            <button onClick={toggleConfig} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Board Width</label>
              <input
                type="number"
                value={boardConfig.width}
                onChange={(e) => setBoardConfig(prev => ({ ...prev, width: Number(e.target.value) }))}
                className="border-2 border-gray-200 rounded-lg px-2.5 py-1.5 w-full text-sm focus:outline-none focus:border-blue-500 transition-colors"
                min="5" max="100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Board Height</label>
              <input
                type="number"
                value={boardConfig.height}
                onChange={(e) => setBoardConfig(prev => ({ ...prev, height: Number(e.target.value) }))}
                className="border-2 border-gray-200 rounded-lg px-2.5 py-1.5 w-full text-sm focus:outline-none focus:border-blue-500 transition-colors"
                min="5" max="100"
              />
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

          <div className="flex flex-col gap-2">
            <button onClick={saveProject} className="w-full py-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-lg text-xs font-semibold text-left px-3 flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Save Project
            </button>
            <label className="w-full py-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-lg text-xs font-semibold text-left px-3 cursor-pointer flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Load Project
              <input type="file" accept=".json" onChange={loadProject} className="hidden" />
            </label>
            <button onClick={clearBoard} className="w-full py-2 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 rounded-lg text-xs font-semibold text-left px-3 flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Clear Board
            </button>
          </div>
        </div>
      )}

      <Board
        width={boardConfig.width}
        height={boardConfig.height}
        scale={zoom}
        position={pan}
        onPan={setPan}
        onDoubleClick={addPostItAt}
      >
        <DrawingLayer
          ref={drawingLayerRef}
          width={boardConfig.width}
          height={boardConfig.height}
          tool={activeTool}
          color={penColor}
          zoom={zoom}
          active={activeTool !== 'select'}
        />
        
        {/* Post-its dentro del Board para compartir contexto */}
        {postIts.map(p => (
          <PostIt
            key={p.id}
            {...p}
            updatePostIt={updatePostIt}
            zoom={zoom}
          />
        ))}
      </Board>
    </div>
  );
}

export default App;
