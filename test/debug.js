const edlParser = require('../src/edlParser/edlParser');

(async function debug() {
  const events = await edlParser('./test/edl_files/cmx3600.edl');

  return events;
}());
