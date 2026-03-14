"use client";

import { useLayoutEffect, useRef } from "react";

type BoldSegment = { start: number; end: number; bold?: boolean };

function getTextNodesInOrder(root: Node): Text[] {
  const result: Text[] = [];
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result.push(node as Text);
    } else {
      node.childNodes.forEach(walk);
    }
  };
  walk(root);
  return result;
}

function applyBoldSegments(codeEl: HTMLElement, segments: BoldSegment[]) {
  if (segments.length === 0) return;
  const textNodes = getTextNodesInOrder(codeEl);
  let offset = 0;
  const nodesToWrap: Text[] = [];
  for (const node of textNodes) {
    const len = node.textContent?.length ?? 0;
    const nodeStart = offset;
    const nodeEnd = offset + len;
    const inBold = segments.some(
      (s) => s.bold && nodeStart < s.end && nodeEnd > s.start
    );
    if (inBold) nodesToWrap.push(node);
    offset = nodeEnd;
  }
  for (const node of nodesToWrap) {
    if (node.parentElement?.tagName === "STRONG") continue; // already wrapped
    const strong = document.createElement("strong");
    strong.className = "font-semibold code-bold-segment";
    node.parentNode?.insertBefore(strong, node);
    strong.appendChild(node);
  }
}

type Props = {
  html: string;
  boldSegments: BoldSegment[];
  className?: string;
};

export function CodeBlockWithAnnotations({
  html,
  boldSegments,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || boldSegments.length === 0) return;
    const codeEl = container.querySelector("code");
    if (!codeEl) return;
    applyBoldSegments(codeEl, boldSegments);
  }, [html, boldSegments]);

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
