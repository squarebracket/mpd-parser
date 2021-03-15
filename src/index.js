import { version } from '../package.json';
import { parseMpdTree } from './inheritAttributes';
import { stringToMpdXml } from './stringToMpdXml';
import { parseUTCTimingScheme } from './parseUTCTimingScheme';
import { toM3u8 } from './toM3u8';

export const VERSION = version;

export const parse = (manifestString, options) => {
  return parseMpdTree(stringToMpdXml(manifestString), options);
};

export const toPlaylists = toM3u8;

/**
 * Parses the manifest for a UTCTiming node, returning the nodes attributes if found
 *
 * @param {string} manifestString
 *        XML string of the MPD manifest
 * @return {Object|null}
 *         Attributes of UTCTiming node specified in the manifest. Null if none found
 */
export const parseUTCTiming = (manifestString) =>
  parseUTCTimingScheme(stringToMpdXml(manifestString));
