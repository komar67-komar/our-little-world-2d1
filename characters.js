// Original 24×44 pixel sprites. The atlas is assembled from independent
// anatomy, hair and clothing layers and cached by appearance, so new palettes,
// hairstyles, outfits and animation rows can be added without touching physics.
export const SPRITE = Object.freeze({ width: 24, height: 44, scale: 2, columns: 4 });

const sheets = new Map();
const states = Object.freeze({ idle: { row: 0, frames: 2, fps: 2.1 }, walk: { row: 1, frames: 4, fps: 9 }, jump: { row: 2, frames: 1, fps: 1 }, talk:{row:3,frames:2,fps:2}, hug:{row:4,frames:2,fps:2.4}, handhold:{row:5,frames:2,fps:2.4}, kiss:{row:6,frames:2,fps:2.2}, sit:{row:7,frames:2,fps:1.8}, handhold_walk:{row:8,frames:4,fps:9} });

function shade(color, amount) {
  const hex = color.replace('#', '');
  const value = Number.parseInt(hex, 16);
  return `#${[16, 8, 0].map(shift => Math.max(0, Math.min(255, ((value >> shift) & 255) + amount)).toString(16).padStart(2, '0')).join('')}`;
}

function px(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

function spriteKey(p) {
  return [p.skin, p.hair, p.hairStyle || (p.style ? 'crop' : 'long'), p.shirt, p.pants, p.outfit || 'cardigan'].join('|');
}

function paintFrame(c, p, state, frame) {
  const skin = p.skin || '#e6ad86', skinLight = shade(skin, 24), skinShade = shade(skin, -30);
  const hair = p.hair || '#63483c', hairHi = shade(hair, 28), hairShadow = shade(hair, -24);
  const shirt = p.shirt || '#d77d72', shirtHi = shade(shirt, 27), shirtShadow = shade(shirt, -34);
  const pants = p.pants || '#596f84', pantsHi = shade(pants, 22), pantsShadow = shade(pants, -30);
  const outline = '#3e3a3b', shoe = '#59453e';
  const cycle = [[-1, 1, 1, -1], [0, 0, 0, 0], [1, -1, -1, 1], [0, 0, 0, 0]][frame % 4];
  const walking = state === 'walk' || state === 'handhold_walk';
  const stride = walking ? cycle : [0, 0, 0, 0];
  const bob = walking ? (frame % 2 ? -1 : 0) : state === 'idle' && frame === 1 ? -1 : 0;
  const jump = state === 'jump';
  const gesture = ['talk','hug','handhold','kiss','sit'].includes(state);

  // Hair behind the silhouette: each style has its own recognisable shape.
  const hairStyle = p.hairStyle || (p.style ? 'crop' : 'long');
  if (hairStyle === 'long') {
    px(c, 5, 7, 4, 18, hairShadow); px(c, 6, 6, 3, 19, hair);
    px(c, 16, 7, 4, 20, hairShadow); px(c, 16, 6, 3, 19, hair);
    px(c, 7, 20, 12, 5, hairShadow);
  } else if (hairStyle === 'bob') {
    px(c, 5, 8, 4, 14, hairShadow); px(c, 16, 8, 4, 14, hairShadow);
    px(c, 6, 8, 3, 12, hair); px(c, 16, 8, 3, 12, hair);
  } else if (hairStyle === 'curls') {
    [[6, 7], [9, 5], [13, 5], [16, 7], [5, 10], [17, 10]].forEach(([x, y]) => px(c, x, y, 4, 4, hairShadow));
    [[7, 6], [10, 4], [14, 5], [16, 8], [6, 9]].forEach(([x, y]) => px(c, x, y, 3, 3, hair));
    px(c, 7, 15, 3, 5, hairShadow); px(c, 16, 14, 3, 6, hairShadow);
  } else {
    px(c, 6, 8, 13, 8, hairShadow); px(c, 7, 6, 12, 8, hair);
    px(c, 6, 9, 3, 8, hair); px(c, 16, 9, 3, 5, hair);
  }

  // Arms and hands are separate layers, so later gestures can be animated here.
  const armSwing = state === 'walk' ? stride[0] : 0;
  if (state === 'hug' || state === 'kiss') {
    px(c, 3, 16, 5, 8, shirt); px(c, 6, 19, 5, 3, skin);
    px(c, 16, 16, 5, 8, shirt); px(c, 13, 19, 5, 3, skin);
  } else if (state === 'handhold' || state === 'handhold_walk') {
    px(c, 3, 20, 4, 10, shirt); px(c, 4, 27, 5, 3, skin);
    px(c, 17, 20, 4, 10, shirt); px(c, 15, 27, 5, 3, skin);
  } else if (state === 'talk') {
    px(c, 3, 15, 4, 8, shirt); px(c, 2, 13-(frame%2), 5, 4, skin);
    px(c, 17, 18, 4, 11, shirt); px(c, 17, 27, 3, 4, skin);
  } else if (state === 'sit') {
    px(c, 7, 29, 5, 8, outline); px(c, 8, 30, 4, 6, pants);
    px(c, 12, 29, 5, 8, outline); px(c, 13, 30, 4, 6, pants);
  } else if (jump) {
    px(c, 3, 18, 4, 8, shirtShadow); px(c, 2, 13, 4, 8, shirt); px(c, 3, 12, 3, 4, skin);
    px(c, 17, 18, 4, 8, shirtShadow); px(c, 18, 13, 4, 8, shirt); px(c, 18, 12, 3, 4, skin);
  } else {
    px(c, 4 + armSwing, 18, 4, 11, outline); px(c, 5 + armSwing, 19, 3, 8, shirt);
    px(c, 5 + armSwing, 27, 3, 4, skinShade); px(c, 6 + armSwing, 27, 2, 3, skin);
    px(c, 16 - armSwing, 18, 4, 11, outline); px(c, 16 - armSwing, 19, 3, 8, shirt);
    px(c, 16 - armSwing, 27, 3, 4, skinShade); px(c, 16 - armSwing, 27, 2, 3, skin);
  }

  // Layered legs, trousers and little stitched highlights.
  const liftL = jump ? -4 : stride[1], liftR = jump ? -4 : stride[2];
  px(c, 7 + (jump ? -1 : stride[0]), 29 + bob, 5, 11, outline);
  px(c, 8 + (jump ? -1 : stride[0]), 30 + bob, 3, 9, pantsShadow);
  px(c, 8 + (jump ? -1 : stride[0]), 30 + bob, 2, 7, pants);
  px(c, 8 + (jump ? -1 : stride[0]), 31 + bob, 1, 4, pantsHi);
  px(c, 12 + (jump ? 1 : stride[3]), 29 + bob, 5, 11, outline);
  px(c, 13 + (jump ? 1 : stride[3]), 30 + bob, 3, 9, pantsShadow);
  px(c, 13 + (jump ? 1 : stride[3]), 30 + bob, 2, 7, pants);
  px(c, 13 + (jump ? 1 : stride[3]), 31 + bob, 1, 4, pantsHi);
  if (jump) {
    px(c, 4, 38, 6, 4, shoe); px(c, 14, 38, 6, 4, shoe);
    px(c, 5, 38, 3, 1, '#e6c995'); px(c, 15, 38, 3, 1, '#e6c995');
  } else {
    px(c, 6 + liftL, 39 + bob, 7, 4, outline); px(c, 7 + liftL, 39 + bob, 6, 3, shoe); px(c, 8 + liftL, 39 + bob, 3, 1, '#e4c590');
    px(c, 12 + liftR, 39 + bob, 7, 4, outline); px(c, 13 + liftR, 39 + bob, 6, 3, shoe); px(c, 14 + liftR, 39 + bob, 3, 1, '#e4c590');
  }

  // Jacket, shirt and outfit-specific silhouette.
  px(c, 6, 15 + bob, 13, 16, outline); px(c, 7, 16 + bob, 11, 14, shirtShadow);
  px(c, 7, 16 + bob, 10, 13, shirt); px(c, 8, 17 + bob, 3, 11, shirtHi);
  px(c, 13, 17 + bob, 4, 12, shirtShadow); px(c, 7, 28 + bob, 11, 2, shirtShadow);
  const outfit = p.outfit || 'cardigan';
  if (outfit === 'overalls') {
    px(c, 8, 18 + bob, 8, 12, '#547e88'); px(c, 8, 17 + bob, 2, 8, '#84a8a5');
    px(c, 14, 17 + bob, 2, 8, '#84a8a5'); px(c, 9, 23 + bob, 6, 5, '#72969a');
    px(c, 10, 24 + bob, 1, 1, '#e7c979'); px(c, 13, 24 + bob, 1, 1, '#e7c979');
  } else if (outfit === 'dress') {
    px(c, 6, 27 + bob, 13, 6, shirtShadow); px(c, 5, 29 + bob, 15, 4, shirt);
    px(c, 6, 30 + bob, 13, 2, shirtHi); px(c, 8, 28 + bob, 1, 3, '#f2d8a2');
  } else {
    // Cardigan seams, contrasting collar and buttons.
    px(c, 11, 16 + bob, 3, 4, '#f5e0b6'); px(c, 12, 20 + bob, 1, 8, '#f2d5a1');
    px(c, 14, 21 + bob, 1, 1, '#f8e8c9'); px(c, 14, 25 + bob, 1, 1, '#f8e8c9');
  }

  // Neck and face framed by hair, with skin highlights, eyes and a small smile.
  px(c, 10, 13 + bob, 6, 5, skinShade); px(c, 11, 13 + bob, 4, 4, skin);
  px(c, 7, 6 + bob, 12, 11, outline); px(c, 8, 7 + bob, 10, 9, skinShade);
  px(c, 9, 7 + bob, 8, 8, skin); px(c, 10, 8 + bob, 4, 3, skinLight);
  px(c, 7, 10 + bob, 2, 3, skinShade); px(c, 18, 10 + bob, 2, 3, skinShade);
  // bangs are painted last, framing the upper face without hiding the eyes
  if (hairStyle === 'curls') {
    px(c, 8, 6 + bob, 4, 3, hair); px(c, 12, 5 + bob, 4, 4, hair); px(c, 16, 7 + bob, 3, 3, hair);
  } else if (hairStyle === 'crop') {
    px(c, 8, 6 + bob, 10, 4, hair); px(c, 9, 9 + bob, 4, 2, hairShadow); px(c, 13, 7 + bob, 4, 2, hairHi);
  } else if (hairStyle === 'bob') {
    px(c, 7, 6 + bob, 12, 4, hair); px(c, 8, 9 + bob, 3, 3, hair); px(c, 15, 8 + bob, 4, 5, hair);
    px(c, 13, 7 + bob, 3, 1, hairHi);
  } else {
    px(c, 7, 6 + bob, 12, 4, hair); px(c, 8, 9 + bob, 4, 2, hair); px(c, 12, 6 + bob, 3, 1, hairHi);
    px(c, 17, 10 + bob, 2, 7, hair);
  }
  const blink = state === 'idle' && frame === 1;
  if (blink) {
    px(c, 11, 11 + bob, 2, 1, outline); px(c, 15, 11 + bob, 2, 1, outline);
  } else {
    px(c, 11, 10 + bob, 2, 3, outline); px(c, 15, 10 + bob, 2, 3, outline);
    px(c, 11, 10 + bob, 1, 1, '#fff4dc'); px(c, 15, 10 + bob, 1, 1, '#fff4dc');
  }
  px(c, 14, 13 + bob, 2, 1, skinShade); px(c, 12, 15 + bob, 4, 1, '#a65f5a');
  px(c, 9, 13 + bob, 2, 1, '#d88978'); px(c, 17, 13 + bob, 1, 1, '#d88978');
}

export function getCharacterSheet(person) {
  const key = spriteKey(person);
  if (sheets.has(key)) return sheets.get(key);
  const image = document.createElement('canvas');
  image.width = SPRITE.width * SPRITE.columns;
  image.height = SPRITE.height * 9;
  const c = image.getContext('2d', { alpha: true });
  c.imageSmoothingEnabled = false;
  for (const [stateName, config] of Object.entries(states)) {
    for (let frame = 0; frame < config.frames; frame++) {
      c.save();
      c.translate(frame * SPRITE.width, config.row * SPRITE.height);
      paintFrame(c, person, stateName, frame);
      c.restore();
    }
  }
  const result = { image, states, key };
  sheets.set(key, result);
  return result;
}

export function spriteSource(person, stateName, elapsed) {
  const sheet = getCharacterSheet(person);
  const state = sheet.states[stateName] || sheet.states.idle;
  const frame = Math.floor(elapsed * state.fps) % state.frames;
  return { image: sheet.image, sx: frame * SPRITE.width, sy: state.row * SPRITE.height, sw: SPRITE.width, sh: SPRITE.height };
}
