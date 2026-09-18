'use client';

import { useMemo } from 'react';
import { Import, Workflow } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NODE_COLORS, type NodeData } from '@/types/canvas';
import type { CanvasTemplate } from './starter-templates';

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: CanvasTemplate[];
  onImport: (template: CanvasTemplate) => void;
}

interface PreviewBounds {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

const PREVIEW_WIDTH = 280;
const PREVIEW_HEIGHT = 150;
const PREVIEW_PADDING = 18;

function getNodeSize(node: CanvasTemplate['nodes'][number]) {
  return {
    width: node.width ?? node.data.width ?? 140,
    height: node.height ?? node.data.height ?? 70,
  };
}

function getPreviewBounds(template: CanvasTemplate): PreviewBounds {
  const bounds = template.nodes.reduce(
    (current, node) => {
      const size = getNodeSize(node);
      const maxX = node.position.x + size.width;
      const maxY = node.position.y + size.height;

      return {
        minX: Math.min(current.minX, node.position.x),
        minY: Math.min(current.minY, node.position.y),
        maxX: Math.max(current.maxX, maxX),
        maxY: Math.max(current.maxY, maxY),
      };
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );

  return {
    minX: bounds.minX,
    minY: bounds.minY,
    width: Math.max(bounds.maxX - bounds.minX, 1),
    height: Math.max(bounds.maxY - bounds.minY, 1),
  };
}

function getNodeCenter(node: CanvasTemplate['nodes'][number]) {
  const size = getNodeSize(node);
  return {
    x: node.position.x + size.width / 2,
    y: node.position.y + size.height / 2,
  };
}

function PreviewNode({
  node,
  bounds,
  scale,
}: {
  node: CanvasTemplate['nodes'][number];
  bounds: PreviewBounds;
  scale: number;
}) {
  const size = getNodeSize(node);
  const color = NODE_COLORS[(node.data.color as NodeData['color']) || 'neutral'];
  const x = PREVIEW_PADDING + (node.position.x - bounds.minX) * scale;
  const y = PREVIEW_PADDING + (node.position.y - bounds.minY) * scale;
  const width = size.width * scale;
  const height = size.height * scale;
  const radius = node.data.shape === 'circle' || node.data.shape === 'pill' ? height / 2 : 5;
  const label = node.data.label;

  if (node.data.shape === 'diamond') {
    return (
      <g>
        <polygon
          points={`${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`}
          fill={color.bg}
          stroke={color.text}
          strokeWidth='1.5'
        />
        <text x={x + width / 2} y={y + height / 2 + 3} fill={color.text} textAnchor='middle' fontSize='8'>
          {label}
        </text>
      </g>
    );
  }

  if (node.data.shape === 'hexagon') {
    const inset = width * 0.2;
    return (
      <g>
        <polygon
          points={`${x + inset},${y} ${x + width - inset},${y} ${x + width},${y + height / 2} ${x + width - inset},${y + height} ${x + inset},${y + height} ${x},${y + height / 2}`}
          fill={color.bg}
          stroke={color.text}
          strokeWidth='1.5'
        />
        <text x={x + width / 2} y={y + height / 2 + 3} fill={color.text} textAnchor='middle' fontSize='8'>
          {label}
        </text>
      </g>
    );
  }

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={radius} fill={color.bg} stroke={color.text} strokeWidth='1.5' />
      <text x={x + width / 2} y={y + height / 2 + 3} fill={color.text} textAnchor='middle' fontSize='8'>
        {label}
      </text>
    </g>
  );
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const bounds = useMemo(() => getPreviewBounds(template), [template]);
  const scale = Math.min(
    (PREVIEW_WIDTH - PREVIEW_PADDING * 2) / bounds.width,
    (PREVIEW_HEIGHT - PREVIEW_PADDING * 2) / bounds.height,
  );

  return (
    <svg
      viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
      className='h-36 w-full rounded-xl border border-subtle bg-base'
      role='img'
      aria-label={`${template.name} diagram preview`}
    >
      {template.edges.map((edge) => {
        const source = template.nodes.find((node) => node.id === edge.source);
        const target = template.nodes.find((node) => node.id === edge.target);
        if (!source || !target) return null;

        const sourceCenter = getNodeCenter(source);
        const targetCenter = getNodeCenter(target);
        return (
          <line
            key={edge.id}
            x1={PREVIEW_PADDING + (sourceCenter.x - bounds.minX) * scale}
            y1={PREVIEW_PADDING + (sourceCenter.y - bounds.minY) * scale}
            x2={PREVIEW_PADDING + (targetCenter.x - bounds.minX) * scale}
            y2={PREVIEW_PADDING + (targetCenter.y - bounds.minY) * scale}
            stroke='var(--color-muted-foreground)'
            strokeWidth='1.5'
          />
        );
      })}
      {template.nodes.map((node) => (
        <PreviewNode key={node.id} node={node} bounds={bounds} scale={scale} />
      ))}
    </svg>
  );
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  templates,
  onImport,
}: StarterTemplatesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[calc(100%-2rem)] max-w-5xl! rounded-3xl bg-elevated p-6'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-foreground'>
            <Workflow className='h-5 w-5 text-primary' />
            Starter templates
          </DialogTitle>
          <DialogDescription>
            Start with a pre-built architecture and customize it on the canvas.
          </DialogDescription>
        </DialogHeader>

        <div className='max-h-[min(70vh,42rem)] overflow-y-auto pr-1'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {templates.map((template) => (
              <article key={template.id} className='flex flex-col gap-3 rounded-2xl border border-subtle bg-surface p-3'>
                <TemplatePreview template={template} />
                <div className='min-h-18'>
                  <h3 className='text-sm font-medium text-foreground'>{template.name}</h3>
                  <p className='mt-1 text-xs leading-5 text-muted-foreground'>{template.description}</p>
                </div>
                <Button
                  type='button'
                  className='mt-auto w-full'
                  onClick={() => {
                    onImport(template);
                    onOpenChange(false);
                  }}
                >
                  <Import className='h-4 w-4' />
                  Import template
                </Button>
              </article>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
