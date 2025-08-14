export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width <= maxWidth) line = test;
    else { if (line) lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

export function drawOutlinedText(
  ctx: CanvasRenderingContext2D,
  line: string, x: number, y: number, outline = true
) {
  if (outline) {
    ctx.strokeStyle = 'rgba(0,0,0,.7)';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeText(line, x, y);
  }
  ctx.fillStyle = '#fff';
  ctx.fillText(line, x, y);
}
