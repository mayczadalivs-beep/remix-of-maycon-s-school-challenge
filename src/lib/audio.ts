let ctx: AudioContext | null = null;
let musicNodes: { stop: () => void } | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Reguada: thump grave + estalo agudo de ruído (chicotada na madeira). */
export function playSmack() {
  const c = getCtx();
  const now = c.currentTime;

  // 1) Thump grave (impacto)
  const thump = c.createOscillator();
  const thumpGain = c.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(180, now);
  thump.frequency.exponentialRampToValueAtTime(40, now + 0.18);
  thumpGain.gain.setValueAtTime(0.0001, now);
  thumpGain.gain.exponentialRampToValueAtTime(1.5, now + 0.005);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  thump.connect(thumpGain).connect(c.destination);
  thump.start(now);
  thump.stop(now + 0.3);

  // 2) Estalo / whip (ruído filtrado)
  const bufferSize = Math.floor(c.sampleRate * 0.25);
  const noiseBuf = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = noiseBuf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(3500, now);
  bp.frequency.exponentialRampToValueAtTime(900, now + 0.18);
  bp.Q.value = 1.2;
  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(1.2, now + 0.004);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  noise.connect(bp).connect(noiseGain).connect(c.destination);
  noise.start(now);
  noise.stop(now + 0.25);
}

/** Som curto e doce para acerto. */
export function playDing() {
  const c = getCtx();
  const now = c.currentTime;
  const notes = [880, 1320];
  notes.forEach((freq, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    const t0 = now + i * 0.08;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.8, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + 0.4);
  });
}

/** Música ambiente suave em loop (pad de acordes em Lá maior). */
export function startMusic() {
  if (musicNodes) return;
  const c = getCtx();
  const master = c.createGain();
  master.gain.value = 0.18;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1200;
  master.connect(filter).connect(c.destination);

  // Acorde Lá maior (A3, C#4, E4) + oitava suave
  const freqs = [220, 277.18, 329.63, 440];
  const oscs = freqs.map((f) => {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = c.createGain();
    g.gain.value = 0.25;
    // LFO de volume para respirar
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 0.12 + Math.random() * 0.1;
    lfoGain.gain.value = 0.12;
    lfo.connect(lfoGain).connect(g.gain);
    o.connect(g).connect(master);
    o.start();
    lfo.start();
    return { o, lfo };
  });

  musicNodes = {
    stop: () => {
      oscs.forEach(({ o, lfo }) => { try { o.stop(); lfo.stop(); } catch {} });
      try { master.disconnect(); filter.disconnect(); } catch {}
      musicNodes = null;
    },
  };
}

export function stopMusic() {
  musicNodes?.stop();
}

export function isMusicPlaying() {
  return musicNodes !== null;
}