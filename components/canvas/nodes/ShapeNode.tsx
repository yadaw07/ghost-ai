'use client';

import { useState, useEffect } from 'react';
import {
  Handle,
  Position,
  NodeProps,
  NodeResizer,
  useReactFlow,
} from '@xyflow/react';

import { cn } from '@/lib/utils';
import { NodeData, NODE_COLORS, NodeColorKey } from '@/types/canvas';
import { Textarea } from '@/components/ui/textarea';

const RESIZER_COLOR = 'rgba(255, 255, 255, 0.3)';

const MIN_WIDTH = 60;
const MIN_HEIGHT = 40;

const HANDLE_CLS =
  '!h-2.5 !w-2.5 !rounded-full !border-2 !border-base !bg-white opacity-0 transition-opacity group-hover/node:opacity-100';

const RESIZER_HANDLE_STYLE: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.55)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  zIndex: 20,
};

const RESIZER_LINE_STYLE: React.CSSProperties = {
  borderColor: RESIZER_COLOR,
  borderWidth: 1,
};

export function ShapeNode({
  id,
  data,
  selected,
  width: nodeWidth,
  height: nodeHeight,
}: NodeProps) {
  const { updateNode } = useReactFlow();

  const nodeData = data as NodeData;
  const shape: NodeData['shape'] = nodeData.shape || 'rectangle';
  const label: string = nodeData.label || '';

  const width = typeof nodeWidth === 'number' ? nodeWidth : 100;
  const height = typeof nodeHeight === 'number' ? nodeHeight : 50;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);

  useEffect(() => {
    setEditValue(label);
  }, [label]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);

    if (editValue !== label) {
      updateNode(id, (node) => ({
        ...node,
        data: { ...node.data, label: editValue },
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(label);
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  const renderShape = () => {
    const colorKey = (nodeData.color as NodeColorKey) || 'neutral';
    const { bg, text } = NODE_COLORS[colorKey] || NODE_COLORS.neutral;

    const content = isEditing ? (
      <Textarea
        className='nodrag nowheel w-full resize-none border-none bg-transparent p-0 text-center text-xs font-medium leading-tight text-foreground outline-none focus-visible:ring-0'
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    ) : (
      <span
        className='w-full px-2 text-center text-xs font-medium cursor-text'
        style={{ color: text }}
        onDoubleClick={handleDoubleClick}
      >
        {label ||
          (shape === 'circle'
            ? 'Circle'
            : shape === 'pill'
              ? 'Pill'
              : 'Rectangle')}
      </span>
    );

    const shapeClass = cn(
      'w-full h-full border-2 transition-colors flex items-center justify-center',
      shape === 'circle' || shape === 'pill' ? 'rounded-full' : 'rounded-md',
      selected ? 'border-primary' : 'border-border',
    );

    return (
      <div className={shapeClass} style={{ backgroundColor: bg }}>
        {content}
      </div>
    );
  };

  const renderSVG = () => {
    const colorKey = (nodeData.color as NodeColorKey) || 'neutral';
    const { bg, text } = NODE_COLORS[colorKey] || NODE_COLORS.neutral;

    const strokeColor = selected
      ? 'var(--color-primary)'
      : 'var(--color-border)';
    const fill = bg;

    const content = (
    <div
      className='flex h-full w-full items-center justify-center text-center'
      style={{ color: text }}
    >
      {isEditing ? (
        <Textarea
          className='nodrag nowheel w-full resize-none border-none bg-transparent p-0 text-center text-xs font-medium leading-tight text-foreground outline-none focus-visible:ring-0'
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span
          className='text-xs font-medium cursor-text'
          onDoubleClick={handleDoubleClick}
        >
          {label || shape}
        </span>
      )}
    </div>
  );

    switch (shape) {
      case 'diamond':
        return (
          <svg
            width='100%'
            height='100%'
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio='none'
            className='block'
          >
            <polygon
              points={`${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`}
              fill={fill}
              stroke={strokeColor}
              strokeWidth='2'
              className='transition-colors'
            />
            <foreignObject x='0' y='0' width='100%' height='100%'>
              {content}
            </foreignObject>
          </svg>
        );
      case 'hexagon':
        const w = width;
        const h = height;
        const x1 = w * 0.25;
        const x2 = w * 0.75;
        return (
          <svg
            width='100%'
            height='100%'
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio='none'
            className='block'
          >
            <polygon
              points={`${x1},0 ${x2},0 ${w},${h / 2} ${x2},${h} ${x1},${h} 0,${h / 2}`}
              fill={fill}
              stroke={strokeColor}
              strokeWidth='2'
              className='transition-colors'
            />
            <foreignObject x='20%' y='30%' width='60%' height='80%'>
              {content}
            </foreignObject>
          </svg>
        );
      case 'cylinder': {
        const ry = Math.min(Math.max(height * 0.15, 8), 20);
        const rx = width / 2;

        return (
          <svg
            width='100%'
            height='100%'
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio='none'
            className='block'
          >
            {/* Main cylinder body */}
            <path
              d={`
          M 0 ${ry}
          C 0 0, ${width} 0, ${width} ${ry}
          L ${width} ${height - ry}
          C ${width} ${height}, 0 ${height}, 0 ${height - ry}
          Z
        `}
              fill={fill}
              stroke={strokeColor}
              strokeWidth='2'
              className='transition-colors'
            />

            {/* Top ellipse */}
            <ellipse
              cx={rx}
              cy={ry}
              rx={rx}
              ry={ry}
              fill={fill}
              stroke={strokeColor}
              strokeWidth='2'
              className='transition-colors'
            />

            {/* Bottom curved edge */}
            <path
              d={`
          M 0 ${height - ry}
          C 0 ${height}, ${width} ${height}, ${width} ${height - ry}
        `}
              fill='none'
              stroke={strokeColor}
              strokeWidth='2'
              className='transition-colors'
            />

            <foreignObject x='10%' y='25%' width='80%' height='70%'>
              {content}
            </foreignObject>
          </svg>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className='group/node relative h-full w-full flex items-center justify-center'>
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        lineStyle={RESIZER_LINE_STYLE}
        handleStyle={RESIZER_HANDLE_STYLE}
      />
      <Handle
        id='top'
        type='target'
        position={Position.Top}
        className={HANDLE_CLS}
      />
      <Handle
        id='left'
        type='target'
        position={Position.Left}
        className={HANDLE_CLS}
      />

      {['diamond', 'hexagon', 'cylinder'].includes(shape)
        ? renderSVG()
        : renderShape()}

      <Handle
        id='bottom'
        type='source'
        position={Position.Bottom}
        className={HANDLE_CLS}
      />
      <Handle
        id='right'
        type='source'
        position={Position.Right}
        className={HANDLE_CLS}
      />
    </div>
  );
}
