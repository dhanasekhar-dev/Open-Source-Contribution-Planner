import React, { useRef, useEffect, useState, useCallback } from 'react';

// Galaxy constellation nodes representing real open-source worlds & technologies
const CORE_SECTORS = [
  { name: 'facebook/react', lang: 'TypeScript', stars: '230k', category: 'Frontend', desc: 'The library for web and native user interfaces', color: '#00f0ff' },
  { name: 'tensorflow/tensorflow', lang: 'Python', stars: '185k', category: 'AI/ML', desc: 'An Open Source Machine Learning Framework for Everyone', color: '#f59e0b' },
  { name: 'kubernetes/kubernetes', lang: 'Go', stars: '110k', category: 'Cloud/DevOps', desc: 'Production-Grade Container Scheduling and Management', color: '#8b5cf6' },
  { name: 'rust-lang/rust', lang: 'Rust', stars: '96k', category: 'Systems', desc: 'Empowering everyone to build reliable and efficient software', color: '#f43f5e' },
  { name: 'expressjs/express', lang: 'JavaScript', stars: '64k', category: 'Backend', desc: 'Fast, unopinionated, minimalist web framework for Node.js', color: '#10b981' },
  { name: 'vercel/next.js', lang: 'TypeScript', stars: '125k', category: 'Fullstack', desc: 'The React Framework for the Web', color: '#38bdf8' },
  { name: 'microsoft/vscode', lang: 'TypeScript', stars: '160k', category: 'Tools', desc: 'Visual Studio Code source code repository', color: '#6366f1' },
  { name: 'torvalds/linux', lang: 'C', stars: '180k', category: 'Kernel', desc: 'Linux kernel source tree', color: '#0ea5e9' },
  { name: 'tiangolo/fastapi', lang: 'Python', stars: '77k', category: 'Backend', desc: 'Modern, fast web framework for building APIs with Python', color: '#14b8a6' },
  { name: 'tailwindlabs/tailwindcss', lang: 'CSS', stars: '82k', category: 'Design', desc: 'A utility-first CSS framework for rapid UI development', color: '#06b6d4' },
  { name: 'vuejs/core', lang: 'TypeScript', stars: '46k', category: 'Frontend', desc: 'Progressive, performant framework for building web UIs', color: '#34d399' },
  { name: 'django/django', lang: 'Python', stars: '79k', category: 'Backend', desc: 'The Web framework for perfectionists with deadlines', color: '#059669' },
];

const UniverseCanvas = ({
  interactive = true,
  onNodeHover = null,
  onNodeSelect = null,
  className = '',
  height = '100%',
  nodeCount = 42,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const nodesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false, clientX: 0, clientY: 0 });
  const rotationRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  // Initialize 3D constellation nodes
  const initNodes = useCallback((width, height) => {
    const nodes = [];
    const radius = Math.min(width, height) * 0.42;

    // 1. Core major open-source worlds
    CORE_SECTORS.forEach((sector, i) => {
      // Golden spiral distribution on a sphere
      const phi = Math.acos(-1 + (2 * i) / CORE_SECTORS.length);
      const theta = Math.sqrt(CORE_SECTORS.length * Math.PI) * phi;
      
      const r = radius * (0.75 + Math.random() * 0.35);
      nodes.push({
        ...sector,
        isMajor: true,
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        baseRadius: 6,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    });

    // 2. Minor supporting cluster nodes & contribution opportunity dust
    const minorCount = Math.max(12, nodeCount - CORE_SECTORS.length);
    for (let i = 0; i < minorCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = radius * (0.3 + Math.random() * 0.85);

      const langs = ['TypeScript', 'Python', 'Go', 'Rust', 'JavaScript'];
      const lang = langs[i % langs.length];
      const colors = ['#00f0ff', '#8b5cf6', '#38bdf8', '#f43f5e', '#10b981'];

      nodes.push({
        name: `Node // 0x${(i + 10).toString(16).toUpperCase()}`,
        lang,
        isMajor: false,
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        baseRadius: 2.5 + Math.random() * 2,
        color: colors[i % colors.length],
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    nodesRef.current = nodes;
  }, [nodeCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    initNodes(width, height);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / height - 0.5) * 2;
      mouseRef.current = {
        x: normX,
        y: normY,
        active: true,
        clientX: e.clientX - rect.left,
        clientY: e.clientY - rect.top,
      };
      rotationRef.current.targetY = normX * 0.45;
      rotationRef.current.targetX = -normY * 0.35;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      rotationRef.current.targetX = 0;
      rotationRef.current.targetY = 0;
      setHoveredNode(null);
      if (onNodeHover) onNodeHover(null);
    };

    const handleClick = () => {
      if (hoveredNode && onNodeSelect) {
        onNodeSelect(hoveredNode);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);

    let time = 0;
    const focalLength = 480;
    const cameraZ = 650;

    const render = () => {
      time += 0.007;

      // Smooth camera interpolation
      rotationRef.current.x += (rotationRef.current.targetX - rotationRef.current.x) * 0.05;
      rotationRef.current.y += (rotationRef.current.targetY - rotationRef.current.y) * 0.05;

      const rotX = rotationRef.current.x + Math.sin(time * 0.4) * 0.06;
      const rotY = rotationRef.current.y + time * 0.25;

      ctx.clearRect(0, 0, width, height);

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const cx = width / 2;
      const cy = height / 2;

      // 1. Project all nodes into 2D camera coordinates
      const projected = nodesRef.current.map((node) => {
        // Rotate around Y axis
        const x1 = node.x * cosY + node.z * sinY;
        const z1 = -node.x * sinY + node.z * cosY;

        // Rotate around X axis
        const y2 = node.y * cosX - z1 * sinX;
        const z2 = node.y * sinX + z1 * cosX;

        // Perspective projection
        const scale = focalLength / (focalLength + cameraZ + z2);
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;

        return {
          ...node,
          px,
          py,
          scale,
          zDepth: z2,
        };
      });

      // Sort by depth (back to front) for accurate rendering
      projected.sort((a, b) => b.zDepth - a.zDepth);

      // 2. Draw holographic interconnected neural lines
      const maxConnectDist = Math.min(width, height) * 0.28;
      ctx.lineWidth = 1;

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];

          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const alpha = (1 - dist / maxConnectDist) * Math.min(p1.scale, p2.scale) * 0.45;
            
            // Highlight connections for hovered node
            const isHoverConnected = hoveredNode && (hoveredNode.name === p1.name || hoveredNode.name === p2.name);
            
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);

            if (isHoverConnected) {
              ctx.strokeStyle = `rgba(0, 240, 255, ${Math.min(1, alpha * 2.5 + 0.3)})`;
              ctx.lineWidth = 1.8;
            } else {
              ctx.strokeStyle = `rgba(139, 92, 246, ${alpha * 0.6})`;
              ctx.lineWidth = 0.8;
            }
            ctx.stroke();

            // Animated light particle along connecting line
            if (p1.isMajor && p2.isMajor && (i + j) % 3 === 0) {
              const progress = ((time * 0.8 + i * 0.2) % 1);
              const lx = p1.px + (p2.px - p1.px) * progress;
              const ly = p1.py + (p2.py - p1.py) * progress;
              ctx.beginPath();
              ctx.arc(lx, ly, 1.5 * p1.scale, 0, Math.PI * 2);
              ctx.fillStyle = '#00f0ff';
              ctx.fill();
            }
          }
        }
      }

      // 3. Draw nodes & test hover proximity
      let closestNode = null;
      let minMouseDist = 26;

      projected.forEach((node) => {
        const pulse = Math.sin(time * 3 + node.pulseOffset) * 0.25 + 1;
        const radius = node.baseRadius * node.scale * pulse;

        // Hover test
        if (mouseRef.current.active) {
          const dmx = node.px - mouseRef.current.clientX;
          const dmy = node.py - mouseRef.current.clientY;
          const mDist = Math.sqrt(dmx * dmx + dmy * dmy);
          if (mDist < minMouseDist) {
            minMouseDist = mDist;
            closestNode = node;
          }
        }

        const isHovered = hoveredNode && hoveredNode.name === node.name;

        // Halo glow
        if (node.isMajor || isHovered) {
          ctx.beginPath();
          ctx.arc(node.px, node.py, (isHovered ? radius * 3.5 : radius * 2.2), 0, Math.PI * 2);
          const glowGrad = ctx.createRadialGradient(node.px, node.py, 0, node.px, node.py, radius * 3.5);
          glowGrad.addColorStop(0, node.color + '66');
          glowGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGrad;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(node.px, node.py, isHovered ? radius * 1.5 : radius, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#ffffff' : node.color;
        ctx.fill();

        // Futuristic reticle around major / hovered nodes
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.px, node.py, radius * 3, 0, Math.PI * 2);
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw node title label for major nodes in foreground
        if (node.isMajor && node.zDepth < 80) {
          ctx.font = `600 ${Math.max(9, Math.round(10 * node.scale))}px 'Orbitron', monospace`;
          ctx.fillStyle = isHovered ? '#00f0ff' : 'rgba(226, 232, 240, 0.85)';
          ctx.fillText(node.name.split('/')[1] || node.name, node.px + radius + 4, node.py + 3);
        }
      });

      if (closestNode !== hoveredNode) {
        setHoveredNode(closestNode);
        if (onNodeHover) onNodeHover(closestNode);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('click', handleClick);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initNodes, interactive, onNodeHover, onNodeSelect, hoveredNode]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{ height }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair"
      />

      {/* Holographic Tooltip HUD for Hovered Constellation Node */}
      {hoveredNode && hoveredNode.isMajor && (
        <div
          className="absolute z-30 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{
            left: `${hoveredNode.px}px`,
            top: `${hoveredNode.py - 12}px`,
          }}
        >
          <div className="cyber-card p-3 rounded-xl border border-cyan-500/60 shadow-xl shadow-cyan-500/20 text-xs w-64 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1.5 mb-1.5">
              <span className="font-cyber text-[11px] font-bold text-cyan-300 truncate">
                {hoveredNode.name}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-mono text-[9px] font-bold">
                ⭐ {hoveredNode.stars}
              </span>
            </div>
            <p className="text-[10px] text-slate-300 leading-snug line-clamp-2">
              {hoveredNode.desc}
            </p>
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800 text-[9px] text-slate-400 font-mono">
              <span className="text-violet-400 font-semibold">{hoveredNode.lang}</span>
              <span className="text-slate-500 uppercase">{hoveredNode.category}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniverseCanvas;
