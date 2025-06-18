/**
 * Robot Trajectory Visualization Component
 * Visualizes robot motion paths using SVG/Three.js with path planning logic
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Button,
  FormControlLabel,
  Switch,
  Slider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface Position3D {
  x: number;
  y: number;
  z: number;
  rx?: number;
  ry?: number;
  rz?: number;
}

interface TrajectoryPoint extends Position3D {
  id: string;
  type: 'move' | 'pick' | 'place' | 'wait';
  duration?: number;
  speed?: number;
  description?: string;
  timestamp?: number;
}

interface PathSegment {
  start: Position3D;
  end: Position3D;
  type: 'linear' | 'joint' | 'arc';
  duration: number;
  speed: number;
  waypoints?: Position3D[];
}

interface TrajectoryVisualizationProps {
  trajectoryPoints: TrajectoryPoint[];
  onTrajectoryChange: (points: TrajectoryPoint[]) => void;
  workspaceSize?: {
    x: [number, number];
    y: [number, number];
    z: [number, number];
  };
  robotType?: 'UR3e' | 'Dobot' | 'Kinova' | 'Generic';
  showCollisionZones?: boolean;
  enablePathOptimization?: boolean;
  disabled?: boolean;
}

const DEFAULT_WORKSPACE = {
  x: [-500, 500] as [number, number],
  y: [-500, 500] as [number, number],
  z: [0, 400] as [number, number]
};

// Collision zones definition
const COLLISION_ZONES = [
  { x: 0, y: 0, z: 0, width: 100, height: 100, depth: 50, label: 'Table' },
  { x: -200, y: -200, z: 0, width: 50, height: 50, depth: 300, label: 'Support Column' }
];

export const TrajectoryVisualization: React.FC<TrajectoryVisualizationProps> = ({
  trajectoryPoints,
  onTrajectoryChange,
  workspaceSize = DEFAULT_WORKSPACE,
  robotType = 'Generic',
  showCollisionZones = true,
  enablePathOptimization = true,
  disabled = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [showTiming, setShowTiming] = useState(true);
  const [viewMode, setViewMode] = useState<'top' | 'side' | 'front'>('top');
  const [pathSegments, setPathSegments] = useState<PathSegment[]>([]);
  const [collisionWarnings, setCollisionWarnings] = useState<string[]>([]);
  const animationRef = useRef<number>();

  // Calculate path segments and detect collisions
  useEffect(() => {
    if (trajectoryPoints.length < 2) {
      setPathSegments([]);
      setCollisionWarnings([]);
      return;
    }

    const segments: PathSegment[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < trajectoryPoints.length - 1; i++) {
      const start = trajectoryPoints[i];
      const end = trajectoryPoints[i + 1];
      
      // Calculate segment
      const segment = calculatePathSegment(start, end, robotType);
      segments.push(segment);

      // Check for collisions
      if (showCollisionZones) {
        const collisions = checkCollisions(segment, COLLISION_ZONES);
        warnings.push(...collisions);
      }
    }

    setPathSegments(segments);
    setCollisionWarnings(warnings);
  }, [trajectoryPoints, robotType, showCollisionZones]);

  // SVG drawing
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    
    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    drawTrajectory(svg, trajectoryPoints, pathSegments, viewMode, workspaceSize);
    
    if (showCollisionZones) {
      drawCollisionZones(svg, COLLISION_ZONES, viewMode, workspaceSize);
    }
    
    drawCurrentPosition(svg, currentPoint, trajectoryPoints, viewMode, workspaceSize);
  }, [trajectoryPoints, pathSegments, currentPoint, viewMode, showCollisionZones, workspaceSize]);

  const calculatePathSegment = (start: TrajectoryPoint, end: TrajectoryPoint, robotType: string): PathSegment => {
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) + 
      Math.pow(end.y - start.y, 2) + 
      Math.pow(end.z - start.z, 2)
    );
    
    const speed = end.speed || 100; // mm/s
    const duration = distance / speed;
    
    let type: 'linear' | 'joint' | 'arc' = 'linear';
    let waypoints: Position3D[] = [];

    // Apply robot-specific path planning
    if (enablePathOptimization) {
      const optimized = optimizePath(start, end, robotType);
      type = optimized.type;
      waypoints = optimized.waypoints;
    }

    return {
      start,
      end,
      type,
      duration,
      speed,
      waypoints
    };
  };

  const optimizePath = (start: Position3D, end: Position3D, robotType: string) => {
    // Simple path optimization based on robot type
    const waypoints: Position3D[] = [];
    let type: 'linear' | 'joint' | 'arc' = 'linear';

    // Check if we need to avoid obstacles
    const hasObstacle = checkDirectPathCollision(start, end, COLLISION_ZONES);
    
    if (hasObstacle) {
      // Add waypoint to avoid collision
      const safeHeight = Math.max(start.z, end.z) + 100;
      waypoints.push(
        { x: start.x, y: start.y, z: safeHeight },
        { x: end.x, y: end.y, z: safeHeight }
      );
      type = 'arc';
    }

    // Robot-specific optimizations
    switch (robotType) {
      case 'UR3e':
        // UR3e prefers smooth joint movements
        if (Math.abs(end.z - start.z) > 100) {
          type = 'joint';
        }
        break;
      case 'Dobot':
        // Dobot works better with linear movements
        type = 'linear';
        break;
      case 'Kinova':
        // Kinova can handle complex curves
        if (waypoints.length === 0 && Math.abs(end.x - start.x) > 200) {
          type = 'arc';
        }
        break;
    }

    return { type, waypoints };
  };

  const checkCollisions = (segment: PathSegment, zones: any[]): string[] => {
    const warnings: string[] = [];
    
    zones.forEach(zone => {
      if (segmentIntersectsBox(segment, zone)) {
        warnings.push(`Path intersects with ${zone.label}`);
      }
    });
    
    return warnings;
  };

  const checkDirectPathCollision = (start: Position3D, end: Position3D, zones: any[]): boolean => {
    return zones.some(zone => 
      lineIntersectsBox(start, end, zone)
    );
  };

  const segmentIntersectsBox = (segment: PathSegment, box: any): boolean => {
    // Check if any part of the path segment intersects with the collision box
    const points = [segment.start, ...segment.waypoints, segment.end];
    
    for (let i = 0; i < points.length - 1; i++) {
      if (lineIntersectsBox(points[i], points[i + 1], box)) {
        return true;
      }
    }
    return false;
  };

  const lineIntersectsBox = (start: Position3D, end: Position3D, box: any): boolean => {
    // Simplified box intersection check
    const minX = box.x;
    const maxX = box.x + box.width;
    const minY = box.y;
    const maxY = box.y + box.height;
    const minZ = box.z;
    const maxZ = box.z + box.depth;
    
    // Check if line passes through box bounds (simplified)
    const lineMinX = Math.min(start.x, end.x);
    const lineMaxX = Math.max(start.x, end.x);
    const lineMinY = Math.min(start.y, end.y);
    const lineMaxY = Math.max(start.y, end.y);
    const lineMinZ = Math.min(start.z, end.z);
    const lineMaxZ = Math.max(start.z, end.z);
    
    return !(lineMaxX < minX || lineMinX > maxX ||
             lineMaxY < minY || lineMinY > maxY ||
             lineMaxZ < minZ || lineMinZ > maxZ);
  };

  const drawTrajectory = (svg: SVGSVGElement, points: TrajectoryPoint[], segments: PathSegment[], mode: string, workspace: any) => {
    const svgNS = "http://www.w3.org/2000/svg";
    const { width, height, scale } = getSVGDimensions(svg, workspace, mode);
    
    // Draw workspace boundary
    const boundary = document.createElementNS(svgNS, "rect");
    boundary.setAttribute("x", "10");
    boundary.setAttribute("y", "10");
    boundary.setAttribute("width", (width - 20).toString());
    boundary.setAttribute("height", (height - 20).toString());
    boundary.setAttribute("fill", "none");
    boundary.setAttribute("stroke", "#e0e0e0");
    boundary.setAttribute("stroke-width", "2");
    svg.appendChild(boundary);

    // Draw grid
    drawGrid(svg, workspace, mode);

    // Draw path segments
    segments.forEach((segment, index) => {
      const pathElement = document.createElementNS(svgNS, "path");
      const pathData = generatePathData(segment, mode, workspace, { width, height, scale });
      
      pathElement.setAttribute("d", pathData);
      pathElement.setAttribute("fill", "none");
      pathElement.setAttribute("stroke", getPathColor(segment.type));
      pathElement.setAttribute("stroke-width", "3");
      pathElement.setAttribute("stroke-dasharray", segment.type === 'joint' ? "5,5" : "none");
      
      if (index === currentPoint && isPlaying) {
        pathElement.setAttribute("stroke", "#ff4444");
        pathElement.setAttribute("stroke-width", "4");
      }
      
      svg.appendChild(pathElement);
    });

    // Draw trajectory points
    points.forEach((point, index) => {
      const { x, y } = project3DToSVG(point, mode, workspace, { width, height, scale });
      
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", x.toString());
      circle.setAttribute("cy", y.toString());
      circle.setAttribute("r", index === currentPoint ? "8" : "6");
      circle.setAttribute("fill", getPointColor(point.type));
      circle.setAttribute("stroke", "#fff");
      circle.setAttribute("stroke-width", "2");
      
      svg.appendChild(circle);

      // Add point labels
      if (showWaypoints) {
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", (x + 12).toString());
        text.setAttribute("y", (y - 8).toString());
        text.setAttribute("font-size", "12");
        text.setAttribute("fill", "#666");
        text.textContent = `${index + 1}: ${point.type}`;
        svg.appendChild(text);
      }

      // Add timing information
      if (showTiming && point.duration) {
        const timeText = document.createElementNS(svgNS, "text");
        timeText.setAttribute("x", (x + 12).toString());
        timeText.setAttribute("y", (y + 8).toString());
        timeText.setAttribute("font-size", "10");
        timeText.setAttribute("fill", "#999");
        timeText.textContent = `${point.duration}s`;
        svg.appendChild(timeText);
      }
    });
  };

  const drawCollisionZones = (svg: SVGSVGElement, zones: any[], mode: string, workspace: any) => {
    const svgNS = "http://www.w3.org/2000/svg";
    const { width, height, scale } = getSVGDimensions(svg, workspace, mode);

    zones.forEach(zone => {
      const { x, y, w, h } = projectBoxToSVG(zone, mode, workspace, { width, height, scale });
      
      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("x", x.toString());
      rect.setAttribute("y", y.toString());
      rect.setAttribute("width", w.toString());
      rect.setAttribute("height", h.toString());
      rect.setAttribute("fill", "rgba(255, 0, 0, 0.2)");
      rect.setAttribute("stroke", "#ff0000");
      rect.setAttribute("stroke-width", "1");
      rect.setAttribute("stroke-dasharray", "3,3");
      
      svg.appendChild(rect);

      // Add zone label
      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", (x + w/2).toString());
      text.setAttribute("y", (y + h/2).toString());
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "10");
      text.setAttribute("fill", "#ff0000");
      text.textContent = zone.label;
      svg.appendChild(text);
    });
  };

  const drawCurrentPosition = (svg: SVGSVGElement, current: number, points: TrajectoryPoint[], mode: string, workspace: any) => {
    if (current >= points.length) return;
    
    const svgNS = "http://www.w3.org/2000/svg";
    const { width, height, scale } = getSVGDimensions(svg, workspace, mode);
    const point = points[current];
    const { x, y } = project3DToSVG(point, mode, workspace, { width, height, scale });
    
    // Draw current position indicator
    const indicator = document.createElementNS(svgNS, "circle");
    indicator.setAttribute("cx", x.toString());
    indicator.setAttribute("cy", y.toString());
    indicator.setAttribute("r", "12");
    indicator.setAttribute("fill", "none");
    indicator.setAttribute("stroke", "#2196F3");
    indicator.setAttribute("stroke-width", "3");
    indicator.setAttribute("opacity", "0.8");
    
    svg.appendChild(indicator);
  };

  const drawGrid = (svg: SVGSVGElement, workspace: any, mode: string) => {
    const svgNS = "http://www.w3.org/2000/svg";
    const { width, height } = getSVGDimensions(svg, workspace, mode);
    const gridSize = 50; // 50mm grid
    
    // Vertical lines
    for (let x = 10; x < width; x += gridSize * 0.1) {
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", x.toString());
      line.setAttribute("y1", "10");
      line.setAttribute("x2", x.toString());
      line.setAttribute("y2", (height - 10).toString());
      line.setAttribute("stroke", "#f5f5f5");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
    }
    
    // Horizontal lines
    for (let y = 10; y < height; y += gridSize * 0.1) {
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", "10");
      line.setAttribute("y1", y.toString());
      line.setAttribute("x2", (width - 10).toString());
      line.setAttribute("y2", y.toString());
      line.setAttribute("stroke", "#f5f5f5");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
    }
  };

  const getSVGDimensions = (svg: SVGSVGElement, workspace: any, mode: string) => {
    const rect = svg.getBoundingClientRect();
    const width = rect.width || 400;
    const height = rect.height || 300;
    
    let scale = 1;
    if (mode === 'top') {
      scale = Math.min(
        (width - 20) / (workspace.x[1] - workspace.x[0]),
        (height - 20) / (workspace.y[1] - workspace.y[0])
      );
    } else if (mode === 'side') {
      scale = Math.min(
        (width - 20) / (workspace.x[1] - workspace.x[0]),
        (height - 20) / (workspace.z[1] - workspace.z[0])
      );
    } else if (mode === 'front') {
      scale = Math.min(
        (width - 20) / (workspace.y[1] - workspace.y[0]),
        (height - 20) / (workspace.z[1] - workspace.z[0])
      );
    }
    
    return { width, height, scale };
  };

  const project3DToSVG = (point: Position3D, mode: string, workspace: any, dimensions: any) => {
    const { width, height, scale } = dimensions;
    let x, y;
    
    if (mode === 'top') {
      x = 10 + (point.x - workspace.x[0]) * scale;
      y = 10 + (point.y - workspace.y[0]) * scale;
    } else if (mode === 'side') {
      x = 10 + (point.x - workspace.x[0]) * scale;
      y = height - 10 - (point.z - workspace.z[0]) * scale;
    } else if (mode === 'front') {
      x = 10 + (point.y - workspace.y[0]) * scale;
      y = height - 10 - (point.z - workspace.z[0]) * scale;
    }
    
    return { x: x || 0, y: y || 0 };
  };

  const projectBoxToSVG = (box: any, mode: string, workspace: any, dimensions: any) => {
    const { width, height, scale } = dimensions;
    let x, y, w, h;
    
    if (mode === 'top') {
      x = 10 + (box.x - workspace.x[0]) * scale;
      y = 10 + (box.y - workspace.y[0]) * scale;
      w = box.width * scale;
      h = box.height * scale;
    } else if (mode === 'side') {
      x = 10 + (box.x - workspace.x[0]) * scale;
      y = height - 10 - (box.z + box.depth - workspace.z[0]) * scale;
      w = box.width * scale;
      h = box.depth * scale;
    } else if (mode === 'front') {
      x = 10 + (box.y - workspace.y[0]) * scale;
      y = height - 10 - (box.z + box.depth - workspace.z[0]) * scale;
      w = box.height * scale;
      h = box.depth * scale;
    }
    
    return { x: x || 0, y: y || 0, w: w || 0, h: h || 0 };
  };

  const generatePathData = (segment: PathSegment, mode: string, workspace: any, dimensions: any): string => {
    const start = project3DToSVG(segment.start, mode, workspace, dimensions);
    const end = project3DToSVG(segment.end, mode, workspace, dimensions);
    
    let pathData = `M ${start.x} ${start.y}`;
    
    if (segment.waypoints && segment.waypoints.length > 0) {
      // Draw curved path through waypoints
      segment.waypoints.forEach(waypoint => {
        const wp = project3DToSVG(waypoint, mode, workspace, dimensions);
        pathData += ` L ${wp.x} ${wp.y}`;
      });
    }
    
    pathData += ` L ${end.x} ${end.y}`;
    
    return pathData;
  };

  const getPathColor = (type: string): string => {
    switch (type) {
      case 'linear': return '#2196F3';
      case 'joint': return '#ff9800';
      case 'arc': return '#4caf50';
      default: return '#666';
    }
  };

  const getPointColor = (type: string): string => {
    switch (type) {
      case 'move': return '#2196F3';
      case 'pick': return '#4caf50';
      case 'place': return '#ff9800';
      case 'wait': return '#9c27b0';
      default: return '#666';
    }
  };

  // Animation control
  const playAnimation = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    setIsPlaying(true);
    let lastTime = Date.now();
    let segmentProgress = 0;
    let currentSegment = 0;

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000 * playbackSpeed;
      lastTime = now;

      if (currentSegment < pathSegments.length) {
        const segment = pathSegments[currentSegment];
        segmentProgress += deltaTime / segment.duration;

        if (segmentProgress >= 1) {
          segmentProgress = 0;
          currentSegment++;
          setCurrentPoint(currentSegment + 1);
        }

        if (currentSegment < pathSegments.length) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
          setCurrentPoint(0);
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    setCurrentPoint(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const nextPoint = () => {
    setCurrentPoint(Math.min(trajectoryPoints.length - 1, currentPoint + 1));
  };

  const prevPoint = () => {
    setCurrentPoint(Math.max(0, currentPoint - 1));
  };

  const getTotalDuration = (): number => {
    return pathSegments.reduce((total, segment) => total + segment.duration, 0);
  };

  const getTotalDistance = (): number => {
    return pathSegments.reduce((total, segment) => {
      const distance = Math.sqrt(
        Math.pow(segment.end.x - segment.start.x, 2) +
        Math.pow(segment.end.y - segment.start.y, 2) +
        Math.pow(segment.end.z - segment.start.z, 2)
      );
      return total + distance;
    }, 0);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Robot Trajectory Visualization
      </Typography>

      {/* Control Panel */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Playback Controls */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Previous Point">
              <IconButton size="small" onClick={prevPoint} disabled={disabled || currentPoint === 0}>
                <PrevIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isPlaying ? "Pause" : "Play"}>
              <IconButton size="small" onClick={playAnimation} disabled={disabled || trajectoryPoints.length < 2}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Stop">
              <IconButton size="small" onClick={stopAnimation} disabled={disabled}>
                <StopIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Next Point">
              <IconButton size="small" onClick={nextPoint} disabled={disabled || currentPoint >= trajectoryPoints.length - 1}>
                <NextIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Speed Control */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
            <SpeedIcon fontSize="small" />
            <Slider
              size="small"
              value={playbackSpeed}
              onChange={(_, value) => setPlaybackSpeed(value as number)}
              min={0.1}
              max={3}
              step={0.1}
              disabled={disabled}
              sx={{ flex: 1 }}
            />
            <Typography variant="caption">{playbackSpeed.toFixed(1)}x</Typography>
          </Box>

          {/* View Mode */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {['top', 'side', 'front'].map((mode) => (
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

          {/* Display Options */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={showWaypoints}
                  onChange={(e) => setShowWaypoints(e.target.checked)}
                  disabled={disabled}
                />
              }
              label="Labels"
            />
            
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={showTiming}
                  onChange={(e) => setShowTiming(e.target.checked)}
                  disabled={disabled}
                />
              }
              label="Timing"
            />
          </Box>
        </Box>
      </Paper>

      {/* Main Visualization */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* SVG Canvas */}
        <Paper elevation={2} sx={{ flex: 1, p: 1 }}>
          <svg
            ref={svgRef}
            width="100%"
            height="400"
            style={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}
          />
          
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              Point {currentPoint + 1} of {trajectoryPoints.length} | View: {viewMode.toUpperCase()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total: {getTotalDistance().toFixed(1)}mm, {getTotalDuration().toFixed(1)}s
            </Typography>
          </Box>
        </Paper>

        {/* Side Panel */}
        <Box sx={{ width: 300 }}>
          {/* Collision Warnings */}
          {collisionWarnings.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Collision Warnings:</Typography>
              {collisionWarnings.map((warning, index) => (
                <Typography key={index} variant="caption" display="block">
                  • {warning}
                </Typography>
              ))}
            </Alert>
          )}

          {/* Trajectory Points List */}
          <Paper elevation={1} sx={{ maxHeight: 300, overflow: 'auto' }}>
            <Typography variant="subtitle2" sx={{ p: 1, borderBottom: '1px solid #e0e0e0' }}>
              Trajectory Points
            </Typography>
            <List dense>
              {trajectoryPoints.map((point, index) => (
                <React.Fragment key={point.id}>
                  <ListItem
                    button
                    selected={index === currentPoint}
                    onClick={() => setCurrentPoint(index)}
                    disabled={disabled}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            size="small"
                            label={point.type}
                            color={index === currentPoint ? 'primary' : 'default'}
                            style={{ backgroundColor: getPointColor(point.type), color: 'white' }}
                          />
                          <Typography variant="body2">
                            Point {index + 1}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          ({point.x}, {point.y}, {point.z})
                          {point.speed && ` • ${point.speed}mm/s`}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < trajectoryPoints.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default TrajectoryVisualization;