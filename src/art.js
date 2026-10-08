// Shared vector illustrations keep the shop, buildings and moving cargo consistent.
const art = {
  earth: '<path fill="#997449" d="m8 43 11-18 16-5 18 16 4 17H8Z"/><path fill="#bf9a60" d="m19 25 16-5 7 14-20 8-14 1Z"/><path d="m22 42 7 11m13-19 11 2"/><path fill="#75a46a" d="M31 24c-12-2-15-10-14-15 9-1 16 4 17 12 0-9 6-15 15-15-1 9-6 15-15 16v8"/>',
  wind: '<path d="M7 24h32c15 0 16-17 5-17-6 0-9 4-9 8M6 34h43c13 0 12 17 2 17-6 0-8-4-8-7M15 45h14c8 0 8 12 1 12" fill="none" stroke="#60998f" stroke-width="5"/><path d="M12 14h13" stroke="#a7c8bf" stroke-width="4"/>',
  fire: '<path fill="#ec8645" d="M33 4c5 16 17 19 20 32 4 16-8 24-21 24S8 50 11 38c2-9 8-12 10-21 3 4 3 8 5 10 5-8 3-15 7-23Z"/><path fill="#ffd579" d="M32 29c0 8-9 13-9 21 0 6 5 10 10 10 7 0 12-5 11-12-1-7-6-12-12-19Z"/>',
  water: '<path fill="#72b7cf" d="M32 5C27 18 12 31 12 42a20 20 0 0 0 40 0C52 31 37 18 32 5Z"/><path d="M22 36c-5 9-1 16 6 17" stroke="#d8f3f5" stroke-width="5" fill="none"/>',
  lava: '<path fill="#8e7564" d="m6 55 17-27 7-18h9l8 19 13 26Z"/><path fill="#ed8647" d="m23 28 7-18h9l8 19-9-4-4 18-6-17Z"/><path d="m19 43-6 12m33-15 9 15" stroke="#f8bd68" stroke-width="5"/><path d="M32 4V1m13 9 5-5M21 8l-4-5" stroke="#d98249"/>',
  steam: '<path fill="#aabeb5" d="M9 43a10 10 0 0 1 7-19c-1-16 20-22 28-8 14-3 20 18 7 22 6 12-10 21-18 11-6 10-23 7-24-6Z"/><path d="M20 58v-7m13 10v-6m13 3v-9" stroke="#819e94"/>',
  dust: '<path fill="#e2c89b" d="m8 52 13-14 8 4 8-18 21 28Z"/><g fill="#bea272"><circle cx="16" cy="25" r="3"/><circle cx="30" cy="14" r="4"/><circle cx="49" cy="11" r="3"/><circle cx="51" cy="31" r="2"/><circle cx="11" cy="10" r="2"/></g>',
  clay: '<ellipse fill="#b97962" cx="32" cy="46" rx="24" ry="12"/><path fill="#d09c7c" d="m11 45 5-21 15-11 17 6 7 25-19 7Z"/><path d="m17 24 16 6 15-11M33 30l3 21" stroke="#b97962"/>',
  stone: '<path fill="#8e9c8e" d="m8 46 6-25 22-12 16 12 5 27-16 9-20-2Z"/><path fill="#b8c3ae" d="m14 21 22-12 5 22-20 6Z"/><path d="m41 31 11-10M21 37v18m20-24 1 26" stroke="#758579"/>',
  glass: '<path fill="#c2e7df" d="m15 7 36 5-5 46-35-5Z"/><path d="m15 7 36 5-5 46-35-5Z" fill="none" stroke="#73aaa5"/><path d="m22 20 17-5M20 32l22-7m-19 19 12-5" stroke="#f6ffff" stroke-width="4"/>',
  sand: '<path fill="#e0c381" d="m5 52 13-16 9 4 14-18 19 30Z"/><path d="m27 40 14-18 9 12" stroke="#bca16c"/><g fill="#b89d64"><circle cx="20" cy="48" r="2"/><circle cx="39" cy="44" r="2"/><circle cx="48" cy="48" r="2"/><circle cx="13" cy="24" r="2"/><circle cx="28" cy="17" r="2"/></g>',
  mud: '<ellipse fill="#846448" cx="32" cy="44" rx="27" ry="14"/><ellipse fill="#ae8761" cx="30" cy="40" rx="18" ry="7"/><path fill="#7eaab4" d="M40 7c-2 7-8 12-8 17a8 8 0 0 0 16 0c0-5-6-10-8-17Z"/><path d="m18 44 5 2m15 2 8-3"/>',
  ice: '<path fill="#a6d7e3" d="m12 19 24-12 18 13v28L30 60 12 46Z"/><path fill="#d4f0f1" d="m12 19 24-12 18 13-24 12Z"/><path d="m30 32 24-12M30 32v28m-18-41 18 13" stroke="#71afc3"/><path d="m19 38 5 4m15-4 7-4" stroke="#efffff"/>',
  cloud: '<path fill="#edf0e3" d="M12 49a13 13 0 0 1 1-26C14 9 32 4 41 20c15-5 24 15 14 24-5 6-34 7-43 5Z"/><path d="M19 40h27" stroke="#c4d2c3"/>',
  rain: '<path fill="#a9bcb7" d="M13 32a10 10 0 0 1 0-20c5-13 22-14 29 0 17-5 22 19 7 20Z"/><path d="m20 41-5 10m20-13-5 11m21-7-5 11m-18 1-3 7" stroke="#6caac8" stroke-width="4"/>',
  plant: '<path d="M32 58V20" stroke="#628453" stroke-width="4"/><path fill="#86b56b" d="M31 39C11 42 5 24 8 16c17 0 26 10 23 23ZM33 27C32 10 42 3 57 7c-1 15-10 23-24 20Z"/><path d="m15 24 16 15m2-12 16-13" stroke="#638e54"/><path d="M21 59h22" stroke="#9b805b" stroke-width="5"/>',
  wood: '<path fill="#b38957" d="m12 23 31-13 14 26-30 18Z"/><ellipse fill="#dfbf86" cx="20" cy="39" rx="13" ry="17" transform="rotate(-27 20 39)"/><ellipse fill="none" cx="20" cy="39" rx="7" ry="10" transform="rotate(-27 20 39)"/><path d="m30 26 17-8m-13 20 18-10" stroke="#85623d"/>',
  coal: '<path fill="#46514e" d="m8 43 9-25 21-9 18 23-4 21-30 5Z"/><path fill="#6e7973" d="m17 18 21-9-8 23-22 11Z"/><path d="m30 32 26 0m-26 0-8 26m8-26 22 21" stroke="#303a37"/>',
  metal: '<path fill="#9eafba" d="m7 35 14-18h28l10 21-16 15H16Z"/><path fill="#d0dbe0" d="m7 35 14-18h28l-9 20Z"/><path d="m7 35 33 2 19 1M40 37l3 16" stroke="#6e8595"/>',
  steel: '<path fill="#778e9e" d="m8 18 37-7 12 7v10l-13 2v12l13-2v11l-37 9-12-8V41l12 2V30L8 29Z"/><path fill="#b6c7cf" d="m8 18 37-7 12 7-37 9Z"/><path d="m20 27 37-9m-37 9v11m0 9v13m0-13 37-7" stroke="#496778"/>',
  crystal: '<path fill="#ae9acc" d="m24 7 15-3 10 18-11 36-17-7-9-28Z"/><path fill="#d6c5e8" d="m24 7 15-3-5 20-22-1Z"/><path fill="#9177b4" d="m34 24 15-2-11 36Z"/><path d="m24 7 10 17-13 27m13-27 4 34" stroke="#8168a2"/><path d="m51 7 2 6m-5-3h7" stroke="#e4d6f2"/>',
  energy: '<path fill="#f1cf5a" d="M34 3 13 35h15l-4 26 28-36H35L43 3Z"/><path d="m10 14-5-5m48 9 7-3M8 50l-5 4m50-2 5 6" stroke="#d3ac40"/>',
  life: '<path fill="#d79787" d="M32 56 10 34C-5 17 19 2 32 20 46 2 69 17 54 34Z"/><path d="m15 32 10 0 5-9 6 19 5-10h9" fill="none" stroke="#fff0d6" stroke-width="4"/>',
  gold: '<path fill="#dfb64d" d="m7 37 13-22h30l9 23-13 15H16Z"/><path fill="#f5da7f" d="m7 37 13-22h30l-9 24Z"/><path d="m7 37 34 2 18-1m-18 1 5 14" stroke="#af8631"/><path d="M52 4v8m-4-4h8" stroke="#e6bc4e"/>',
  factory: '<path fill="#b4c39b" d="M7 29 22 20v10l15-10v10l14-9 6 8v29H7Z"/><path fill="#8c9c75" d="M43 27V10h10v20Z"/><path d="M47 7c-10-3-4-7-12-7" stroke="#bac6af" stroke-width="4"/><path fill="#f4e7b6" d="M15 37h8v8h-8Zm14 0h8v8h-8Z"/><path fill="#718a5e" d="M42 41h9v17h-9Z"/><path d="M7 54h50" stroke="#6f815e"/>',
  seller: '<path fill="#e8d4a2" d="M10 23h44v34H10Z"/><path fill="#a9824d" d="M9 10h46l5 15H4Z"/><path fill="#f2ebcf" d="M15 10h9l-2 15H12Zm19 0h9l4 15H35Z"/><path fill="#ba9960" d="M16 34h17v23H16Z"/><path fill="#eff2dc" d="M39 34h9v12h-9Z"/><circle cx="31" cy="39" r="8" fill="#f6d470"/><path d="M31 34v10m3-9h-4c-4 0-4 4 0 4h2c4 0 3 4-1 4h-3" stroke="#a5833e" stroke-width="1.5"/>',
  belt: '<rect x="5" y="14" width="54" height="37" rx="12" fill="#748477"/><rect x="8" y="18" width="48" height="29" rx="10" fill="#b4bfa7"/><path d="M17 21v23m10-23v23m10-23v23m10-23v23" stroke="#87977e" stroke-width="3"/><path d="M21 33h23m-6-6 6 6-6 6" stroke="#eef3de" stroke-width="3" fill="none"/><path d="M13 54v5m38-5v5" stroke="#72836c" stroke-width="4"/>',
};
export function iconMarkup(id) {
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="#626d59" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${art[id] || art.earth}</svg>`;
}
export function createSprites() {
  return Object.fromEntries(Object.keys(art).map(id => {
    const image = new Image();
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconMarkup(id));
    return [id, image];
  }));
}
