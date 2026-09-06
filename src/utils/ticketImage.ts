import logoUrl from '../../assets/logo.png';
import { Participant, EventConfig } from '../types';

const W = 720;
const H = 1080;
const NAVY = '#0a2240';
const ORANGE = '#ff5c35';
const TEAL = '#004f51';
const MIST = '#dce3eb';
const WHITE = '#ffffff';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  fontWeight: string,
  fill: string,
  size: number,
  y: number,
  maxWidth: number
) {
  let s = size;
  ctx.font = `${fontWeight} ${s}px ${fontFamily}`;
  while (ctx.measureText(text).width > maxWidth && s > 14) {
    s -= 1;
    ctx.font = `${fontWeight} ${s}px ${fontFamily}`;
  }
  ctx.fillStyle = fill;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, y);
}

export function ticketFilename(code: string): string {
  return `${code.replace(/[^a-z0-9]/gi, '')}-ticket.png`;
}

export async function buildTicketPngBlob(
  participant: Participant,
  config: EventConfig,
  qrCanvas: HTMLCanvasElement | null
): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W - 60, 0, 0, W - 60, 0, 420);
  glow.addColorStop(0, 'rgba(255,92,53,0.20)');
  glow.addColorStop(1, 'rgba(255,92,53,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, 0, W, 14);

  const logo = await loadImage(logoUrl);
  if (logo) {
    const lw = 130;
    const lh = Math.round(130 * (logo.naturalHeight / logo.naturalWidth));
    ctx.drawImage(logo, (W - lw) / 2, 44, lw, lh);
  }

  const dateLine = `${new Date(config.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  drawFittedText(ctx, config.eventName, 'Myriad Pro, Gill Sans, system-ui, sans-serif', '900', WHITE, 44, 216, W - 110);
  ctx.font = '500 24px Gill Sans, system-ui, sans-serif';
  ctx.fillStyle = MIST;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.eventLocation ? `${dateLine} · ${config.eventLocation}` : dateLine, W / 2, 266);

  ctx.font = '700 22px Myriad Pro, Gill Sans, system-ui, sans-serif';
  try {
    ctx.letterSpacing = '6px';
  } catch {
    // letterSpacing not supported
  }
  ctx.fillStyle = ORANGE;
  ctx.fillText('REGISTRATION CODE', W / 2, 326);
  try {
    ctx.letterSpacing = '0px';
  } catch {
    // ignore
  }

  ctx.font = '900 66px Consolas, Menlo, monospace';
  ctx.fillStyle = WHITE;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(participant.code, W / 2, 402);

  const cardW = 336;
  const cardH = 336;
  const cardX = (W - cardW) / 2;
  const cardY = 452;
  ctx.fillStyle = WHITE;
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fill();

  if (qrCanvas) {
    const qrSize = 280;
    ctx.drawImage(qrCanvas, (W - qrSize) / 2, cardY + (cardH - qrSize) / 2, qrSize, qrSize);
  } else {
    ctx.fillStyle = NAVY;
    ctx.font = '600 22px Gill Sans, system-ui, sans-serif';
    ctx.fillText('Code QR', W / 2, cardY + cardH / 2);
  }

  ctx.fillStyle = WHITE;
  ctx.font = '700 32px Myriad Pro, Gill Sans, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawFittedText(ctx, participant.fullName || 'Attendee', 'Myriad Pro, Gill Sans, system-ui, sans-serif', '700', WHITE, 30, 830, W - 100);

  ctx.font = '500 22px Gill Sans, system-ui, sans-serif';
  ctx.fillStyle = MIST;
  ctx.fillText(participant.email || '', W / 2, 878);

  ctx.strokeStyle = 'rgba(220,227,235,0.20)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 924);
  ctx.lineTo(W - 120, 924);
  ctx.stroke();

  ctx.fillStyle = MIST;
  ctx.font = '500 22px Gill Sans, system-ui, sans-serif';
  ctx.fillText('Show this ticket at the entrance to check in', W / 2, 972);

  ctx.fillStyle = ORANGE;
  ctx.font = '700 22px Myriad Pro, Gill Sans, system-ui, sans-serif';
  ctx.fillText(config.eventName, W / 2, 1018);

  ctx.fillStyle = TEAL;
  ctx.fillRect(0, H - 14, W, 14);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function saveOrShareTicket(blob: Blob, filename: string, shareTitle: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([blob], filename, { type: 'image/png' });
  const nav = navigator as Navigator & {
    share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
    canShare?: (data: { files: File[] }) => boolean;
  };
  if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: shareTitle, text: shareTitle });
      return 'shared';
    } catch (err) {
      const name = (err as { name?: string }).name;
      if (name === 'AbortError') return 'cancelled';
    }
  }
  triggerDownload(blob, filename);
  return 'downloaded';
}