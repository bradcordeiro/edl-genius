const EDL = require('../src/EDL/EDL');

(async function debug() {
  const events = new EDL('./test/edl_files/12_16 TL01 MUSIC.edl');

  return events;
}());
