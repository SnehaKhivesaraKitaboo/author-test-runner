'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const APP_VIDEO_NAME = 'authoring-app-recording.mp4';
const FRAME_SECONDS = 2;

function getFfmpegPath() {
  try {
    return require('ffmpeg-static');
  } catch {
    return null;
  }
}

function toFfmpegPath(filePath) {
  return path.resolve(filePath).replace(/\\/g, '/').replace(/'/g, "'\\''");
}

function listLiveSnapshots(screenshotsDir) {
  const liveDir = path.join(screenshotsDir, 'live');
  if (!fs.existsSync(liveDir)) return [];

  return fs.readdirSync(liveDir)
    .filter(name => name.endsWith('.png'))
    .sort()
    .map(name => path.join(liveDir, name));
}

/**
 * Build app-only MP4 from viewport screenshots (no Cypress runner sidebar).
 * Returns output path or null.
 */
function buildVideoFromLiveScreenshots(screenshotsDir, videosDir) {
  const ffmpeg = getFfmpegPath();
  if (!ffmpeg) return null;

  const snaps = listLiveSnapshots(screenshotsDir);
  if (!snaps.length) return null;

  ensureDir(videosDir);
  const outPath = path.join(videosDir, APP_VIDEO_NAME);
  const listPath = path.join(videosDir, '_frames.txt');

  const lines = [];
  for (const snap of snaps) {
    lines.push(`file '${toFfmpegPath(snap)}'`);
    lines.push(`duration ${FRAME_SECONDS}`);
  }
  lines.push(`file '${toFfmpegPath(snaps[snaps.length - 1])}'`);
  fs.writeFileSync(listPath, lines.join('\n'), 'utf-8');

  try {
    execFileSync(ffmpeg, [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listPath,
      '-vf', 'scale=1440:900:force_original_aspect_ratio=decrease,pad=1440:900:(ow-iw)/2:(oh-ih)/2',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      outPath,
    ], { stdio: 'pipe' });
    return outPath;
  } catch (err) {
    console.log(`[app-video] ffmpeg from snapshots failed: ${err.message || err}`);
    return null;
  } finally {
    try { fs.unlinkSync(listPath); } catch { /* ignore */ }
  }
}

function copyNativeCypressVideo(videosDir) {
  if (!fs.existsSync(videosDir)) return null;

  const natives = fs.readdirSync(videosDir)
    .filter(f => f.endsWith('.mp4') && f !== APP_VIDEO_NAME)
    .map(f => ({ name: f, mtime: fs.statSync(path.join(videosDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  if (!natives.length) return null;

  const src = path.join(videosDir, natives[0].name);
  const dest = path.join(videosDir, APP_VIDEO_NAME);
  fs.copyFileSync(src, dest);
  return dest;
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

/**
 * Produce a single app-only recording for Test Artifacts.
 * Prefers viewport snapshot slideshow; falls back to native headless Cypress mp4.
 */
function finalizeAppRecording(runId, runScreensDir, runVideosDir) {
  ensureDir(runVideosDir(runId));

  const fromSnaps = buildVideoFromLiveScreenshots(runScreensDir(runId), runVideosDir(runId));
  if (fromSnaps) {
    console.log(`[${runId}][app-video] Created ${APP_VIDEO_NAME} from viewport snapshots`);
    return fromSnaps;
  }

  const fromNative = copyNativeCypressVideo(runVideosDir(runId));
  if (fromNative) {
    console.log(`[${runId}][app-video] Using headless Cypress recording as ${APP_VIDEO_NAME}`);
    return fromNative;
  }

  console.log(`[${runId}][app-video] No app recording available`);
  return null;
}

module.exports = {
  APP_VIDEO_NAME,
  finalizeAppRecording,
};
