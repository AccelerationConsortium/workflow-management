/**
 * 3D Coordinate Input Component with Mini Viewer
 * Advanced coordinate input for robotic arm control with visual feedback
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Menu,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  ThreeDRotation as RotationIcon,
  CenterFocusStrong as CenterIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Home as HomeIcon,
  TouchApp as TouchIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

interface Position3D {
  x: number;
  y: number;
  z: number;
  rx?: number;
  ry?: number;
  rz?: number;
}

interface CoordinateInput3DProps {
  value: Position3D;
  onChange: (position: Position3D) => void;
  workspaceSize?: {
    x: [number, number];
    y: [number, number];
    z: [number, number];
  };
  showOrientation?: boolean;
  showPresets?: boolean;
  robotType?: 'UR3e' | 'Dobot' | 'Kinova' | 'Generic';
  disabled?: boolean;
  label?: string;
}

const DEFAULT_WORKSPACE = {
  x: [-500, 500] as [number, number],
  y: [-500, 500] as [number, number],
  z: [0, 400] as [number, number]
};

const ROBOT_PRESETS = {
  UR3e: {
    home: { x: 0, y: -300, z: 300, rx: 0, ry: 0, rz: 0 },
    safe: { x: 0, y: -200, z: 200, rx: 0, ry: 0, rz: 0 },
    pickup: { x: 200, y: 0, z: 50, rx: 0, ry: 0, rz: 0 }
  },
  Dobot: {
    home: { x: 200, y: 0, z: 100, rx: 0, ry: 0, rz: 0 },
    safe: { x: 150, y: 0, z: 150, rx: 0, ry: 0, rz: 0 },
    pickup: { x: 250, y: 100, z: 30, rx: 0, ry: 0, rz: 0 }
  },
  Kinova: {
    home: { x: 0, y: 0, z: 400, rx: 0, ry: 0, rz: 0 },
    safe: { x: 0, y: 0, z: 300, rx: 0, ry: 0, rz: 0 },
    pickup: { x: 300, y: 0, z: 100, rx: 0, ry: 0, rz: 0 }
  },
  Generic: {
    home: { x: 0, y: 0, z: 200, rx: 0, ry: 0, rz: 0 },
    safe: { x: 0, y: 0, z: 150, rx: 0, ry: 0, rz: 0 },
    pickup: { x: 200, y: 0, z: 50, rx: 0, ry: 0, rz: 0 }
  }
};

export const CoordinateInput3D: React.FC<CoordinateInput3DProps> = ({
  value,
  onChange,
  workspaceSize = DEFAULT_WORKSPACE,
  showOrientation = true,
  showPresets = true,
  robotType = 'Generic',
  disabled = false,
  label = '3D Position'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewMode, setViewMode] = useState<'top' | 'side' | 'front' | '3d'>('3d');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewRotation, setViewRotation] = useState({ rx: -30, ry: 45 });
  const [zoom, setZoom] = useState(1);
  const [presetsAnchor, setPresetsAnchor] = useState<null | HTMLElement>(null);
  const [showGrid, setShowGrid] = useState(true);

  // Canvas drawing
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up coordinate system
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 0.3 * zoom;

    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Draw workspace boundaries
    drawWorkspace(ctx, workspaceSize, scale, viewMode, viewRotation);
    
    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, workspaceSize, scale, viewMode, viewRotation);
    }
    
    // Draw robot position
    drawRobotPosition(ctx, value, scale, viewMode, viewRotation);
    
    // Draw coordinate axes
    drawAxes(ctx, scale, viewMode, viewRotation);
    
    ctx.restore();
  }, [value, viewMode, viewRotation, zoom, showGrid, workspaceSize]);

  const drawWorkspace = (ctx: CanvasRenderingContext2D, workspace: any, scale: number, mode: string, rotation: any) => {
    const [xMin, xMax] = workspace.x;
    const [yMin, yMax] = workspace.y;
    const [zMin, zMax] = workspace.z;

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;

    if (mode === 'top') {
      // Top view (X-Y plane)
      ctx.strokeRect(xMin * scale, yMin * scale, (xMax - xMin) * scale, (yMax - yMin) * scale);
    } else if (mode === 'side') {
      // Side view (X-Z plane)
      ctx.strokeRect(xMin * scale, -zMax * scale, (xMax - xMin) * scale, (zMax - zMin) * scale);
    } else if (mode === 'front') {
      // Front view (Y-Z plane)
      ctx.strokeRect(yMin * scale, -zMax * scale, (yMax - yMin) * scale, (zMax - zMin) * scale);
    } else {
      // 3D isometric view
      drawIsometricBox(ctx, xMin, yMin, zMin, xMax - xMin, yMax - yMin, zMax - zMin, scale, rotation);
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, workspace: any, scale: number, mode: string, rotation: any) => {
    ctx.strokeStyle = '#f5f5f5';
    ctx.lineWidth = 1;
    
    const gridSize = 50; // 50mm grid
    const [xMin, xMax] = workspace.x;
    const [yMin, yMax] = workspace.y;
    const [zMin, zMax] = workspace.z;

    if (mode === 'top') {
      // Draw X lines
      for (let x = Math.ceil(xMin / gridSize) * gridSize; x <= xMax; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x * scale, yMin * scale);
        ctx.lineTo(x * scale, yMax * scale);
        ctx.stroke();
      }
      // Draw Y lines
      for (let y = Math.ceil(yMin / gridSize) * gridSize; y <= yMax; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(xMin * scale, y * scale);
        ctx.lineTo(xMax * scale, y * scale);
        ctx.stroke();
      }
    }
    // Add grid for other views as needed
  };

  const drawRobotPosition = (ctx: CanvasRenderingContext2D, pos: Position3D, scale: number, mode: string, rotation: any) => {
    let x, y;
    
    if (mode === 'top') {
      x = pos.x * scale;
      y = pos.y * scale;
    } else if (mode === 'side') {
      x = pos.x * scale;
      y = -pos.z * scale;
    } else if (mode === 'front') {
      x = pos.y * scale;
      y = -pos.z * scale;
    } else {
      // 3D isometric
      const { x: px, y: py } = project3DToIsometric(pos.x, pos.y, pos.z, rotation);
      x = px * scale;
      y = py * scale;
    }

    // Draw robot end effector
    ctx.fillStyle = '#2196F3';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Draw orientation indicator if enabled
    if (showOrientation && (pos.rx !== undefined || pos.ry !== undefined || pos.rz !== undefined)) {
      drawOrientationIndicator(ctx, x, y, pos, scale);
    }

    // Draw coordinates text
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(`(${pos.x}, ${pos.y}, ${pos.z})`, x + 12, y - 8);
  };

  const drawAxes = (ctx: CanvasRenderingContext2D, scale: number, mode: string, rotation: any) => {
    const axisLength = 80;
    ctx.lineWidth = 2;

    if (mode === '3d') {
      // 3D axes with proper projection
      const axes = [
        { color: '#ff4444', label: 'X', vec: [axisLength, 0, 0] },
        { color: '#44ff44', label: 'Y', vec: [0, axisLength, 0] },
        { color: '#4444ff', label: 'Z', vec: [0, 0, axisLength] }
      ];

      axes.forEach(axis => {
        const { x, y } = project3DToIsometric(axis.vec[0], axis.vec[1], axis.vec[2], rotation);
        ctx.strokeStyle = axis.color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x * scale * 0.5, y * scale * 0.5);
        ctx.stroke();
        
        ctx.fillStyle = axis.color;
        ctx.font = 'bold 12px Arial';
        ctx.fillText(axis.label, x * scale * 0.5 + 5, y * scale * 0.5 + 5);
      });
    } else {
      // 2D axes for orthographic views
      const axisConfigs = {
        top: [{ color: '#ff4444', label: 'X', x: axisLength, y: 0 }, { color: '#44ff44', label: 'Y', x: 0, y: axisLength }],
        side: [{ color: '#ff4444', label: 'X', x: axisLength, y: 0 }, { color: '#4444ff', label: 'Z', x: 0, y: -axisLength }],
        front: [{ color: '#44ff44', label: 'Y', x: axisLength, y: 0 }, { color: '#4444ff', label: 'Z', x: 0, y: -axisLength }]
      };

      axisConfigs[mode as keyof typeof axisConfigs]?.forEach(axis => {
        ctx.strokeStyle = axis.color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(axis.x, axis.y);
        ctx.stroke();
        
        ctx.fillStyle = axis.color;
        ctx.font = 'bold 12px Arial';
        ctx.fillText(axis.label, axis.x + 5, axis.y + 5);
      });
    }
  };

  const drawIsometricBox = (ctx: CanvasRenderingContext2D, x: number, y: number, z: number, w: number, h: number, d: number, scale: number, rotation: any) => {
    const corners = [
      [x, y, z], [x + w, y, z], [x + w, y + h, z], [x, y + h, z],
      [x, y, z + d], [x + w, y, z + d], [x + w, y + h, z + d], [x, y + h, z + d]
    ];

    const projectedCorners = corners.map(corner => {
      const projected = project3DToIsometric(corner[0], corner[1], corner[2], rotation);
      return { x: projected.x * scale, y: projected.y * scale };
    });

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    // Draw edges
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // bottom face
      [4, 5], [5, 6], [6, 7], [7, 4], // top face
      [0, 4], [1, 5], [2, 6], [3, 7]  // vertical edges
    ];

    edges.forEach(edge => {
      const start = projectedCorners[edge[0]];
      const end = projectedCorners[edge[1]];
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });
  };

  const project3DToIsometric = (x: number, y: number, z: number, rotation: any) => {
    // Simple isometric projection with rotation
    const rad = Math.PI / 180;
    const rx = rotation.rx * rad;
    const ry = rotation.ry * rad;
    
    // Apply rotation
    const cosRx = Math.cos(rx);
    const sinRx = Math.sin(rx);
    const cosRy = Math.cos(ry);
    const sinRy = Math.sin(ry);
    
    const rotatedY = y * cosRx - z * sinRx;
    const rotatedZ = y * sinRx + z * cosRx;
    const rotatedX = x * cosRy + rotatedZ * sinRy;
    const finalZ = -x * sinRy + rotatedZ * cosRy;
    
    return {
      x: rotatedX + rotatedY * 0.5,
      y: finalZ - rotatedY * 0.5
    };
  };

  const drawOrientationIndicator = (ctx: CanvasRenderingContext2D, x: number, y: number, pos: Position3D, scale: number) => {
    const length = 20;
    const { rx = 0, ry = 0, rz = 0 } = pos;
    
    // Draw orientation arrows based on rotation
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2;
    
    const angle = rz * Math.PI / 180;
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Arrow head
    const headLength = 8;
    const headAngle = 0.5;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLength * Math.cos(angle - headAngle),
      endY - headLength * Math.sin(angle - headAngle)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLength * Math.cos(angle + headAngle),
      endY - headLength * Math.sin(angle + headAngle)
    );
    ctx.stroke();
  };

  // Mouse interaction handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || disabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    if (viewMode === '3d') {
      // Rotate view in 3D mode
      setViewRotation(prev => ({
        rx: Math.max(-90, Math.min(90, prev.rx + deltaY * 0.5)),
        ry: (prev.ry + deltaX * 0.5) % 360
      }));
    } else {
      // Move position in 2D modes
      const scale = 0.3 * zoom;
      let newX = value.x;
      let newY = value.y;
      let newZ = value.z;
      
      if (viewMode === 'top') {
        newX = Math.max(workspaceSize.x[0], Math.min(workspaceSize.x[1], value.x + deltaX / scale));
        newY = Math.max(workspaceSize.y[0], Math.min(workspaceSize.y[1], value.y + deltaY / scale));
      } else if (viewMode === 'side') {
        newX = Math.max(workspaceSize.x[0], Math.min(workspaceSize.x[1], value.x + deltaX / scale));
        newZ = Math.max(workspaceSize.z[0], Math.min(workspaceSize.z[1], value.z - deltaY / scale));
      } else if (viewMode === 'front') {
        newY = Math.max(workspaceSize.y[0], Math.min(workspaceSize.y[1], value.y + deltaX / scale));
        newZ = Math.max(workspaceSize.z[0], Math.min(workspaceSize.z[1], value.z - deltaY / scale));
      }
      
      onChange({ ...value, x: newX, y: newY, z: newZ });
    }
    
    setDragStart({ x, y });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCoordinateChange = (axis: keyof Position3D, val: number) => {
    if (disabled) return;
    
    const newValue = { ...value, [axis]: val };
    
    // Validate bounds
    if (axis === 'x') {
      newValue.x = Math.max(workspaceSize.x[0], Math.min(workspaceSize.x[1], val));
    } else if (axis === 'y') {
      newValue.y = Math.max(workspaceSize.y[0], Math.min(workspaceSize.y[1], val));
    } else if (axis === 'z') {
      newValue.z = Math.max(workspaceSize.z[0], Math.min(workspaceSize.z[1], val));
    }
    
    onChange(newValue);
  };

  const handlePresetSelect = (presetName: string) => {
    const presets = ROBOT_PRESETS[robotType];
    const preset = presets[presetName as keyof typeof presets];
    if (preset) {
      onChange(preset);
    }
    setPresetsAnchor(null);
  };

  const resetView = () => {
    setViewRotation({ rx: -30, ry: 45 });
    setZoom(1);
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      
      <Paper elevation={2} sx={{ p: 2 }}>
        {/* Control Panel */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {/* View Mode */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {['top', 'side', 'front', '3d'].map((mode) => (
              <Chip
                key={mode}
                label={mode.toUpperCase()}
                size="small"
                variant={viewMode === mode ? 'filled' : 'outlined'}
                onClick={() => setViewMode(mode as any)}
                disabled={disabled}
              />
            ))}
          </Box>
          
          {/* View Controls */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Reset View">
              <IconButton size="small" onClick={resetView} disabled={disabled}>
                <HomeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Zoom In">
              <IconButton size="small" onClick={() => setZoom(z => Math.min(3, z * 1.2))} disabled={disabled}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Zoom Out">
              <IconButton size="small" onClick={() => setZoom(z => Math.max(0.5, z / 1.2))} disabled={disabled}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Toggle Grid">
              <IconButton 
                size="small" 
                onClick={() => setShowGrid(!showGrid)} 
                disabled={disabled}
                color={showGrid ? 'primary' : 'default'}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Presets */}
          {showPresets && (
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => setPresetsAnchor(e.currentTarget)}
              disabled={disabled}
              startIcon={<TouchIcon />}
            >
              Presets
            </Button>
          )}
        </Box>

        {/* Canvas Viewer */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 1, 
                bgcolor: '#fafafa',
                border: '1px solid #e0e0e0',
                cursor: viewMode === '3d' ? 'grab' : 'crosshair'
              }}
            >
              <canvas
                ref={canvasRef}
                width={300}
                height={200}
                style={{ width: '100%', height: '200px', display: 'block' }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
            </Paper>
            
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TouchIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {viewMode === '3d' ? 'Drag to rotate view' : 'Drag to move position'}
              </Typography>
            </Box>
          </Box>

          {/* Coordinate Inputs */}
          <Box sx={{ minWidth: 200 }}>
            <Grid container spacing={1}>
              {/* Position */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Position (mm)</Typography>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  size="small"
                  label="X"
                  type="number"
                  value={value.x}
                  onChange={(e) => handleCoordinateChange('x', Number(e.target.value))}
                  disabled={disabled}
                  inputProps={{ 
                    min: workspaceSize.x[0], 
                    max: workspaceSize.x[1],
                    step: 1 
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  size="small"
                  label="Y"
                  type="number"
                  value={value.y}
                  onChange={(e) => handleCoordinateChange('y', Number(e.target.value))}
                  disabled={disabled}
                  inputProps={{ 
                    min: workspaceSize.y[0], 
                    max: workspaceSize.y[1],
                    step: 1 
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  size="small"
                  label="Z"
                  type="number"
                  value={value.z}
                  onChange={(e) => handleCoordinateChange('z', Number(e.target.value))}
                  disabled={disabled}
                  inputProps={{ 
                    min: workspaceSize.z[0], 
                    max: workspaceSize.z[1],
                    step: 1 
                  }}
                />
              </Grid>

              {/* Orientation */}
              {showOrientation && (
                <>
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">Orientation (deg)</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      size="small"
                      label="RX"
                      type="number"
                      value={value.rx || 0}
                      onChange={(e) => handleCoordinateChange('rx', Number(e.target.value))}
                      disabled={disabled}
                      inputProps={{ min: -180, max: 180, step: 1 }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      size="small"
                      label="RY"
                      type="number"
                      value={value.ry || 0}
                      onChange={(e) => handleCoordinateChange('ry', Number(e.target.value))}
                      disabled={disabled}
                      inputProps={{ min: -180, max: 180, step: 1 }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      size="small"
                      label="RZ"
                      type="number"
                      value={value.rz || 0}
                      onChange={(e) => handleCoordinateChange('rz', Number(e.target.value))}
                      disabled={disabled}
                      inputProps={{ min: -180, max: 180, step: 1 }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </Box>

        {/* Robot Info */}
        <Box sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Robot: {robotType} | Workspace: {workspaceSize.x[1] - workspaceSize.x[0]}×{workspaceSize.y[1] - workspaceSize.y[0]}×{workspaceSize.z[1] - workspaceSize.z[0]}mm
          </Typography>
        </Box>
      </Paper>

      {/* Presets Menu */}
      <Menu
        anchorEl={presetsAnchor}
        open={Boolean(presetsAnchor)}
        onClose={() => setPresetsAnchor(null)}
      >
        {Object.keys(ROBOT_PRESETS[robotType]).map((presetName) => (
          <MenuItem key={presetName} onClick={() => handlePresetSelect(presetName)}>
            <Box>
              <Typography variant="body2">{presetName.charAt(0).toUpperCase() + presetName.slice(1)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {JSON.stringify(ROBOT_PRESETS[robotType][presetName as keyof typeof ROBOT_PRESETS[typeof robotType]])}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default CoordinateInput3D;