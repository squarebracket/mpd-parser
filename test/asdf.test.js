import QUnit from 'qunit';
import { parse } from '../src';
import {segmentRange} from '../src/segment/durationTimeParser.js';
import multiPeriodMultiAudio from './manifests/multi-period-multi-audio.mpd';
import multiPeriodWithGaps from './manifests/multiperiod-with-gap.mpd';
import multiPeriodWithGaps2 from './manifests/multiperiod-with-gap2.mpd';
import error2 from './manifests/error2.mpd';
import error3 from './manifests/error3.mpd';
import error5 from './manifests/error5.mpd';
import error6 from './manifests/error6.mpd';
import error7 from './manifests/error7.mpd';
import error8 from './manifests/error8.mpd';
import error9 from './manifests/error9.mpd';
import { useFakeTimers } from 'sinon';
import { range } from '../src/utils/list';

QUnit.config.maxDepth = 7;

QUnit.module('new tests');
function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

QUnit.test('seg generation', function(assert) {
  let attrs1 = {
    NOW: 1536857988940,
    availabilityStartTime: 1535471778,
    clientOffset: -2,
    duration: 96256,
    end: undefined,
    endNumber: 691261,
    id: "1",
    label: "English",
    maxSegmentDuration: 2.00533,
    minBufferTime: 2.00533,
    minimumUpdatePeriod: 5.5,
    periodDuration: undefined,
    presentationTimeOffset: "66533316928",
    profiles: "urn:mpeg:dash:profile:isoff-live:2011",
    publishTime: "2018-09-13T16:59:46Z",
    sourceDuration: 0,
    start: 1386110.76933,
    startNumber: 691213,
    timescale: 48000,
    timeShiftBufferDepth: 50.13333,
    type: "dynamic",
  };
  let attrs2 = {
    NOW: 1536857988940,
    availabilityStartTime: 1535471778,
    clientOffset: -2,
    duration: 96256,
    end: undefined,
    endNumber: undefined,
    id: "1",
    label: "English",
    maxSegmentDuration: 2.00533,
    minBufferTime: 2.00533,
    minimumUpdatePeriod: 5.5,
    periodDuration: undefined,
    presentationTimeOffset: "66537927456",
    profiles: "urn:mpeg:dash:profile:isoff-live:2011",
    publishTime: "2018-09-13T16:59:46Z",
    sourceDuration: 0,
    start: 1386206.822,
    startNumber: 691261,
    timescale: 48000,
    timeShiftBufferDepth: 50.13333,
    type: "dynamic",
  };
  let nums1 = segmentRange.dynamic(attrs1);
  let nums2 = segmentRange.dynamic(attrs2);

  assert.deepEqual(nums1, {start: 691238, end: 691261}, 'old period success');
  assert.deepEqual(nums2, {start: 691261, end: 691262}, 'new period success');
});

QUnit.test('seg generation2', function(assert) {
  let attrs1 = {
    NOW: 1536861498389,
    availabilityStartTime: 1535471778,
    clientOffset: -1,
    duration: 96257,
    end: undefined,
    endNumber: 693011,
    id: "1",
    label: "English",
    maxSegmentDuration: 2.00533,
    minBufferTime: 2.00533,
    minimumUpdatePeriod: 5.5,
    periodDuration: undefined,
    profiles: "urn:mpeg:dash:profile:isoff-live:2011",
    publishTime: "2018-09-13T16:59:46Z",
    sourceDuration: 0,
    start: 1389622.28066,
    startNumber: 692964,
    timescale: 48000,
    timeShiftBufferDepth: 50.13333,
    type: "dynamic",
  };
  let attrs2 = {
    NOW: 1536861498389,
    availabilityStartTime: 1535471778,
    clientOffset: -1,
    duration: 96257,
    end: undefined,
    endNumber: undefined,
    id: "1",
    label: "English",
    maxSegmentDuration: 2.00533,
    minBufferTime: 2.00533,
    minimumUpdatePeriod: 5.5,
    periodDuration: undefined,
    profiles: "urn:mpeg:dash:profile:isoff-live:2011",
    publishTime: "2018-09-13T16:59:46Z",
    sourceDuration: 0,
    start: 1389716.328,
    startNumber: 693011,
    timescale: 48000,
    timeShiftBufferDepth: 50.13333,
    type: "dynamic",
  };
  let nums1 = segmentRange.dynamic(attrs1);
  let nums2 = segmentRange.dynamic(attrs2);

  assert.deepEqual(nums1, {start: 692988, end: 693011}, 'old period success');
  assert.deepEqual(nums2, {start: 693011, end: 693012}, 'new period success');
});

QUnit.test('seg generation 3', function(assert) {
  this.clock = useFakeTimers({now: 1537807182559});
  const actual = parse(error2);

  const p1SegsActual = actual.periods['p859'].adaptationSets['3']
    .representations['1_1775000'].segments.map(seg => seg.number);
  const p1SegsExpected = '257421 257422 257423 257424 257425 257426 257427 257428 257429 257430 257431 257432 257433 257434 257435 257436 257437 257438 257439 257440 257441'.split(' ').map(num => Number(num));

  const p2SegsActual = actual.periods['p860'].adaptationSets['3']
    .representations['1_1775000'].segments.map(seg => seg.number);
  const p2SegsExpected = '257442 257443 257444'.split(' ').map(num => Number(num));

  assert.deepEqual(p1SegsActual, p1SegsExpected, '1st period segs');
  assert.deepEqual(p2SegsActual, p2SegsExpected, '2nd period segs');

  this.clock.restore();

});

QUnit.skip('asdf', function(assert) {
  this.clock = useFakeTimers({now: 1537561038171});
  const actual = parse(multiPeriodMultiAudio);

  //assert.deepEqual(actual.periods.p5873.adaptationSets[3].representations, {});

	let periods = {};
  const mpd = {
    "attributes": {
      "NOW": 1537561038171,
      "availabilityStartTime": 1537208106,
      "clientOffset": 0,
      "maxSegmentDuration": 2.00533,
      "minBufferTime": 2.00533,
      "minimumUpdatePeriod": 5.5,
      "profiles": "urn:mpeg:dash:profile:isoff-live:2011",
      "publishTime": "2018-09-21T20:08:19Z",
      "sourceDuration": 0,
      "timeShiftBufferDepth": 50.13333,
      "type": "dynamic",
      "xmlns": "urn:mpeg:dash:schema:mpd:2011",
      "xmlns:cenc": "urn:mpeg:cenc:2013",
      "xmlns:mspr": "urn:microsoft:playready",
      "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "xsi:schemaLocation": "urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
    },
    periods,
  };

  const adaptationSets = {
    "1": {
      "attributes": {
        "NOW": 1537561038171,
        "availabilityStartTime": 1537208106,
        "baseUrls": [
          ""
        ],
        "clientOffset": 0,
        "duration": 60,
        "end": undefined,
        "id": "1",
        "label": "English",
        "lang": "eng",
        "maxSegmentDuration": 2.00533,
        "mimeType": "audio/mp4",
        "minBufferTime": 2.00533,
        "minimumUpdatePeriod": 5.5,
        "periodDuration": 60,
        "profiles": "urn:mpeg:dash:profile:isoff-live:2011",
        "publishTime": "2018-09-21T20:08:19Z",
        "role": {},
        "segmentAlignment": "true",
        "segmentInfo": {
          "template": {
            "duration": 96257,
            "initialization": {
              "sourceURL": "$RepresentationID$/$Bandwidth$/init.m4a"
            },
            "media": "$RepresentationID$/$Bandwidth$/$Number$.m4f",
            "presentationTimeOffset": "16911386811",
            "startNumber": 175691,
            "timescale": 48000
          }
        },
        "sourceDuration": 0,
        "start": 352320,
        "startNumber": 175691,
        "startWithSAP": "1",
        "timeShiftBufferDepth": 50.13333,
        "type": "dynamic",
        "xmlns": "urn:mpeg:dash:schema:mpd:2011",
        "xmlns:cenc": "urn:mpeg:cenc:2013",
        "xmlns:mspr": "urn:microsoft:playready",
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xsi:schemaLocation": "urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
      },
      "closedCaptions": {},
      "contentProtection": {},
      "continuesPeriod": "p5872",
      "id": "1",
      "index": 0,
      "supplementalProperties": {
        "urn:mpeg:dash:period-continuity:2015": "p5872"
      }
    },
    "2": {
      "attributes": {
        "NOW": 1537561038171,
        "availabilityStartTime": 1537208106,
        "baseUrls": [
          ""
        ],
        "clientOffset": 0,
        "duration": 60,
        "end": undefined,
        "id": "2",
        "label": "French",
        "lang": "fre",
        "maxSegmentDuration": 2.00533,
        "mimeType": "audio/mp4",
        "minBufferTime": 2.00533,
        "minimumUpdatePeriod": 5.5,
        "periodDuration": 60,
        "profiles": "urn:mpeg:dash:profile:isoff-live:2011",
        "publishTime": "2018-09-21T20:08:19Z",
        "role": {},
        "segmentAlignment": "true",
        "segmentInfo": {
          "template": {
            "duration": 96257,
            "initialization": {
              "sourceURL": "$RepresentationID$/$Bandwidth$/init.m4a"
            },
            "media": "$RepresentationID$/$Bandwidth$/$Number$.m4f",
            "presentationTimeOffset": "16911386811",
            "startNumber": 175691,
            "timescale": 48000
          }
        },
        "sourceDuration": 0,
        "start": 352320,
        "startNumber": 175691,
        "startWithSAP": "1",
        "timeShiftBufferDepth": 50.13333,
        "type": "dynamic",
        "xmlns": "urn:mpeg:dash:schema:mpd:2011",
        "xmlns:cenc": "urn:mpeg:cenc:2013",
        "xmlns:mspr": "urn:microsoft:playready",
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xsi:schemaLocation": "urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
      },
      "closedCaptions": {},
      "contentProtection": {},
      "continuesPeriod": "p5872",
      "id": "2",
      "index": 1,
      "supplementalProperties": {
        "urn:mpeg:dash:period-continuity:2015": "p5872"
      }
    },
		"3": {
			"attributes": {
				"NOW": 1537561038171,
				"availabilityStartTime": 1537208106,
				"baseUrls": [
					""
				],
				"clientOffset": 0,
				"duration": 60,
				"end": undefined,
				"id": "3",
				"maxSegmentDuration": 2.00533,
				"mimeType": "video/mp4",
				"minBufferTime": 2.00533,
				"minimumUpdatePeriod": 5.5,
				"periodDuration": 60,
				"profiles": "urn:mpeg:dash:profile:isoff-live:2011",
				"publishTime": "2018-09-21T20:08:19Z",
				"role": {},
				"segmentAlignment": "true",
				"segmentInfo": {
					"template": {
						"duration": 180181,
            "initialization": {
              "sourceURL": "$RepresentationID$/$Bandwidth$/init.m4v"
            },
						"media": "$RepresentationID$/$Bandwidth$/$Number$.m4f",
						"presentationTimeOffset": "31708800000",
						"startNumber": 175984,
						"timescale": 90000
					}
				},
				"sourceDuration": 0,
				"start": 352320,
				"startNumber": 175984,
				"startWithSAP": "1",
				"timeShiftBufferDepth": 50.13333,
				"type": "dynamic",
				"xmlns": "urn:mpeg:dash:schema:mpd:2011",
				"xmlns:cenc": "urn:mpeg:cenc:2013",
				"xmlns:mspr": "urn:microsoft:playready",
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xsi:schemaLocation": "urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
			},
			"closedCaptions": {
				"CC1": "en",
				"CC3": "fr"
			},
			"contentProtection": {},
			"continuesPeriod": "p5872",
			"id": "3",
			"index": 2,
			"supplementalProperties": {
				"urn:mpeg:dash:period-continuity:2015": "p5872"
			}
		}
  };

	const videoRepresentations = {
		"1_1775000": {
			"attributes": {
				"NOW": 1537561038171,
				"availabilityStartTime": 1537208106,
				"bandwidth": 1775000,
				"baseUrl": "",
				"baseUrls": [
					""
				],
				"clientOffset": 0,
				"codecs": "avc1.42001e",
				"duration": 60,
				"end": undefined,
				"height": 404,
				"id": "1_1775000",
				"maxSegmentDuration": 2.00533,
				"mimeType": "video/mp4",
				"minBufferTime": 2.00533,
				"minimumUpdatePeriod": 5.5,
				"periodDuration": 60,
				"profiles": "urn:mpeg:dash:profile:isoff-live:2011",
				"publishTime": "2018-09-21T20:08:19Z",
				"role": {},
				"sar": "1:1",
				"scanType": "progressive",
				"segmentAlignment": "true",
				"segmentInfo": {
					"template": {
						"duration": 180181,
            "initialization": {
              "sourceURL": "$RepresentationID$/$Bandwidth$/init.m4v"
            },
						"media": "$RepresentationID$/$Bandwidth$/$Number$.m4f",
						"presentationTimeOffset": "31708800000",
						"startNumber": 175984,
						"timescale": 90000
					}
				},
				"sourceDuration": 0,
				"start": 352320,
				"startNumber": 175984,
				"startWithSAP": "1",
				"timeShiftBufferDepth": 50.13333,
				"type": "dynamic",
				"width": 536,
				"xmlns": "urn:mpeg:dash:schema:mpd:2011",
				"xmlns:cenc": "urn:mpeg:cenc:2013",
				"xmlns:mspr": "urn:microsoft:playready",
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xsi:schemaLocation": "urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
			},
			"id": "1_1775000",
			"index": 0,
			"segments": []
		},
		"2_900000": {
			"attributes": {
				"NOW": 1537561038171,
				"availabilityStartTime": 1537208106,
				"bandwidth": 900000,
				"baseUrl": "",
				"baseUrls": [
					""
				],
				"clientOffset": 0,
				"codecs": "avc1.42001e",
				"duration": 60,
				"end": undefined,
				"height": 360,
				"id": "2_900000",
				"maxSegmentDuration": 2.00533,
				"mimeType": "video/mp4",
				"minBufferTime": 2.00533,
				"minimumUpdatePeriod": 5.5,
				"periodDuration": 60,
				"profiles": "urn:mpeg:dash:profile:isoff-live:2011",
				"publishTime": "2018-09-21T20:08:19Z",
				"role": {},
				"sar": "1:1",
				"scanType": "progressive",
				"segmentAlignment": "true",
				"segmentInfo": {
					"template": {
						"duration": 180181,
            "initialization": {
              "sourceURL": "$RepresentationID$/$Bandwidth$/init.m4v"
            },
						"media": "$RepresentationID$/$Bandwidth$/$Number$.m4f",
						"presentationTimeOffset": "31708800000",
						"startNumber": 175984,
						"timescale": 90000
					}
				},
				"sourceDuration": 0,
				"start": 352320,
				"startNumber": 175984,
				"startWithSAP": "1",
				"timeShiftBufferDepth": 50.13333,
				"type": "dynamic",
				"width": 480,
				"xmlns": "urn:mpeg:dash:schema:mpd:2011",
				"xmlns:cenc": "urn:mpeg:cenc:2013",
				"xmlns:mspr": "urn:microsoft:playready",
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xsi:schemaLocation": "urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
			},
			"id": "2_900000",
			"index": 1,
			"segments": []
		},
		"3_400000": {
			"attributes": {
				"NOW": 1537561038171,
				"availabilityStartTime": 1537208106,
				"bandwidth": 400000,
				"baseUrl": "",
				"baseUrls": [
					""
				],
				"clientOffset": 0,
				"codecs": "avc1.42001e",
				"duration": 60,
				"end": undefined,
				"height": 360,
				"id": "3_400000",
				"maxSegmentDuration": 2.00533,
				"mimeType": "video/mp4",
				"minBufferTime": 2.00533,
				"minimumUpdatePeriod": 5.5,
				"periodDuration": 60,
				"profiles": "urn:mpeg:dash:profile:isoff-live:2011",
				"publishTime": "2018-09-21T20:08:19Z",
				"role": {},
				"sar": "1:1",
				"scanType": "progressive",
				"segmentAlignment": "true",
				"segmentInfo": {
					"template": {
						"duration": 180181,
            "initialization": {
              "sourceURL": "$RepresentationID$/$Bandwidth$/init.m4v"
            },
						"media": "$RepresentationID$/$Bandwidth$/$Number$.m4f",
						"presentationTimeOffset": "31708800000",
						"startNumber": 175984,
						"timescale": 90000
					}
				},
				"sourceDuration": 0,
				"start": 352320,
				"startNumber": 175984,
				"startWithSAP": "1",
				"timeShiftBufferDepth": 50.13333,
				"type": "dynamic",
				"width": 480,
				"xmlns": "urn:mpeg:dash:schema:mpd:2011",
				"xmlns:cenc": "urn:mpeg:cenc:2013",
				"xmlns:mspr": "urn:microsoft:playready",
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xsi:schemaLocation": "urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
			},
			"id": "3_400000",
			"index": 2,
			"segments": []
		},
		"4_200000": {
			"attributes": {
				"NOW": 1537561038171,
				"availabilityStartTime": 1537208106,
				"bandwidth": 200000,
				"baseUrl": "",
				"baseUrls": [
					""
				],
				"clientOffset": 0,
				"codecs": "avc1.42000d",
				"duration": 60,
				"end": undefined,
				"height": 232,
				"id": "4_200000",
				"maxSegmentDuration": 2.00533,
				"mimeType": "video/mp4",
				"minBufferTime": 2.00533,
				"minimumUpdatePeriod": 5.5,
				"periodDuration": 60,
				"profiles": "urn:mpeg:dash:profile:isoff-live:2011",
				"publishTime": "2018-09-21T20:08:19Z",
				"role": {},
				"sar": "1:1",
				"scanType": "progressive",
				"segmentAlignment": "true",
				"segmentInfo": {
					"template": {
						"duration": 180181,
            "initialization": {
              "sourceURL": "$RepresentationID$/$Bandwidth$/init.m4v"
            },
						"media": "$RepresentationID$/$Bandwidth$/$Number$.m4f",
						"presentationTimeOffset": "31708800000",
						"startNumber": 175984,
						"timescale": 90000
					}
				},
				"sourceDuration": 0,
				"start": 352320,
				"startNumber": 175984,
				"startWithSAP": "1",
				"timeShiftBufferDepth": 50.13333,
				"type": "dynamic",
				"width": 304,
				"xmlns": "urn:mpeg:dash:schema:mpd:2011",
				"xmlns:cenc": "urn:mpeg:cenc:2013",
				"xmlns:mspr": "urn:microsoft:playready",
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xsi:schemaLocation": "urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
			},
			"id": "4_200000",
			"index": 3,
			"segments": []
		},
		"5_70000": {
			"attributes": {
				"NOW": 1537561038171,
				"availabilityStartTime": 1537208106,
				"bandwidth": 70000,
				"baseUrl": "",
				"baseUrls": [
					""
				],
				"clientOffset": 0,
				"codecs": "avc1.42000d",
				"duration": 60,
				"end": undefined,
				"height": 232,
				"id": "5_70000",
				"maxSegmentDuration": 2.00533,
				"mimeType": "video/mp4",
				"minBufferTime": 2.00533,
				"minimumUpdatePeriod": 5.5,
				"periodDuration": 60,
				"profiles": "urn:mpeg:dash:profile:isoff-live:2011",
				"publishTime": "2018-09-21T20:08:19Z",
				"role": {},
				"sar": "1:1",
				"scanType": "progressive",
				"segmentAlignment": "true",
				"segmentInfo": {
					"template": {
						"duration": 180181,
            "initialization": {
              "sourceURL": "$RepresentationID$/$Bandwidth$/init.m4v"
            },
						"media": "$RepresentationID$/$Bandwidth$/$Number$.m4f",
						"presentationTimeOffset": "31708800000",
						"startNumber": 175984,
						"timescale": 90000
					}
				},
				"sourceDuration": 0,
				"start": 352320,
				"startNumber": 175984,
				"startWithSAP": "1",
				"timeShiftBufferDepth": 50.13333,
				"type": "dynamic",
				"width": 304,
				"xmlns": "urn:mpeg:dash:schema:mpd:2011",
				"xmlns:cenc": "urn:mpeg:cenc:2013",
				"xmlns:mspr": "urn:microsoft:playready",
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xsi:schemaLocation": "urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
			},
			"id": "5_70000",
			"index": 4,
			"segments": []
		}
	};

	const audioRepresentations1 = {
		"English_24000": {
			"attributes": {
				"NOW": 1537561038171,
				"audioSamplingRate": "48000",
				"availabilityStartTime": 1537208106,
				"bandwidth": 24000,
				"baseUrl": "",
				"baseUrls": [
					""
				],
				"clientOffset": 0,
				"codecs": "mp4a.40.2",
				"duration": 60,
				"end": undefined,
				"id": "English_24000",
				"label": "English",
				"lang": "eng",
				"maxSegmentDuration": 2.00533,
				"mimeType": "audio/mp4",
				"minBufferTime": 2.00533,
				"minimumUpdatePeriod": 5.5,
				"periodDuration": 60,
				"profiles": "urn:mpeg:dash:profile:isoff-live:2011",
				"publishTime": "2018-09-21T20:08:19Z",
				"role": {},
				"segmentAlignment": "true",
				"segmentInfo": {
					"template": {
						"duration": 96257,
            "initialization": {
              "sourceURL": "$RepresentationID$/$Bandwidth$/init.m4a"
            },
						"media": "$RepresentationID$/$Bandwidth$/$Number$.m4f",
						"presentationTimeOffset": "16911381919",
						"startNumber": 175691,
						"timescale": 48000
					}
				},
				"sourceDuration": 0,
				"start": 352320,
				"startNumber": 175691,
				"startWithSAP": "1",
				"timeShiftBufferDepth": 50.13333,
				"type": "dynamic",
				"xmlns": "urn:mpeg:dash:schema:mpd:2011",
				"xmlns:cenc": "urn:mpeg:cenc:2013",
				"xmlns:mspr": "urn:microsoft:playready",
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xsi:schemaLocation": "urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
			},
			"id": "English_24000",
			"index": 0,
			"segments": []
		},
		"English_64000": {
			"attributes": {
				"NOW": 1537561038171,
				"audioSamplingRate": "48000",
				"availabilityStartTime": 1537208106,
				"bandwidth": 64000,
				"baseUrl": "",
				"baseUrls": [
					""
				],
				"clientOffset": 0,
				"codecs": "mp4a.40.2",
				"duration": 60,
				"end": undefined,
				"id": "English_64000",
				"label": "English",
				"lang": "eng",
				"maxSegmentDuration": 2.00533,
				"mimeType": "audio/mp4",
				"minBufferTime": 2.00533,
				"minimumUpdatePeriod": 5.5,
				"periodDuration": 60,
				"profiles": "urn:mpeg:dash:profile:isoff-live:2011",
				"publishTime": "2018-09-21T20:08:19Z",
				"role": {},
				"segmentAlignment": "true",
				"segmentInfo": {
					"template": {
						"duration": 96257,
            "initialization": {
              "sourceURL": "$RepresentationID$/$Bandwidth$/init.m4a"
            },
						"media": "$RepresentationID$/$Bandwidth$/$Number$.m4f",
						"presentationTimeOffset": "16911381919",
						"startNumber": 175691,
						"timescale": 48000
					}
				},
				"sourceDuration": 0,
				"start": 352320,
				"startNumber": 175691,
				"startWithSAP": "1",
				"timeShiftBufferDepth": 50.13333,
				"type": "dynamic",
				"xmlns": "urn:mpeg:dash:schema:mpd:2011",
				"xmlns:cenc": "urn:mpeg:cenc:2013",
				"xmlns:mspr": "urn:microsoft:playready",
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xsi:schemaLocation": "urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
			},
			"id": "English_64000",
			"index": 1,
			"segments": []
		}
	};

	const audioRepresentations2 = {
		"French_24000": {
			"attributes": {
				"NOW": 1537561038171,
				"audioSamplingRate": "48000",
				"availabilityStartTime": 1537208106,
				"bandwidth": 24000,
				"baseUrl": "",
				"baseUrls": [
					""
				],
				"clientOffset": 0,
				"codecs": "mp4a.40.2",
				"duration": 60,
				"end": undefined,
				"id": "French_24000",
				"label": "French",
				"lang": "fre",
				"maxSegmentDuration": 2.00533,
				"mimeType": "audio/mp4",
				"minBufferTime": 2.00533,
				"minimumUpdatePeriod": 5.5,
				"periodDuration": 60,
				"profiles": "urn:mpeg:dash:profile:isoff-live:2011",
				"publishTime": "2018-09-21T20:08:19Z",
				"role": {},
				"segmentAlignment": "true",
				"segmentInfo": {
					"template": {
						"duration": 96257,
            "initialization": {
              "sourceURL": "$RepresentationID$/$Bandwidth$/init.m4a"
            },
						"media": "$RepresentationID$/$Bandwidth$/$Number$.m4f",
						"presentationTimeOffset": "16911381919",
						"startNumber": 175691,
						"timescale": 48000
					}
				},
				"sourceDuration": 0,
				"start": 352320,
				"startNumber": 175691,
				"startWithSAP": "1",
				"timeShiftBufferDepth": 50.13333,
				"type": "dynamic",
				"xmlns": "urn:mpeg:dash:schema:mpd:2011",
				"xmlns:cenc": "urn:mpeg:cenc:2013",
				"xmlns:mspr": "urn:microsoft:playready",
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xsi:schemaLocation": "urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
			},
			"id": "French_24000",
			"index": 0,
			"segments": []
		},
		"French_64000": {
			"attributes": {
				"NOW": 1537561038171,
				"audioSamplingRate": "48000",
				"availabilityStartTime": 1537208106,
				"bandwidth": 64000,
				"baseUrl": "",
				"baseUrls": [
					""
				],
				"clientOffset": 0,
				"codecs": "mp4a.40.2",
				"duration": 60,
				"end": undefined,
				"id": "French_64000",
				"label": "French",
				"lang": "fre",
				"maxSegmentDuration": 2.00533,
				"mimeType": "audio/mp4",
				"minBufferTime": 2.00533,
				"minimumUpdatePeriod": 5.5,
				"periodDuration": 60,
				"profiles": "urn:mpeg:dash:profile:isoff-live:2011",
				"publishTime": "2018-09-21T20:08:19Z",
				"role": {},
				"segmentAlignment": "true",
				"segmentInfo": {
					"template": {
						"duration": 96257,
            "initialization": {
              "sourceURL": "$RepresentationID$/$Bandwidth$/init.m4a"
            },
						"media": "$RepresentationID$/$Bandwidth$/$Number$.m4f",
						"presentationTimeOffset": "16911381919",
						"startNumber": 175691,
						"timescale": 48000
					}
				},
				"sourceDuration": 0,
				"start": 352320,
				"startNumber": 175691,
				"startWithSAP": "1",
				"timeShiftBufferDepth": 50.13333,
				"type": "dynamic",
				"xmlns": "urn:mpeg:dash:schema:mpd:2011",
				"xmlns:cenc": "urn:mpeg:cenc:2013",
				"xmlns:mspr": "urn:microsoft:playready",
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xsi:schemaLocation": "urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
			},
			"id": "French_64000",
			"index": 1,
			"segments": []
		}
	};

  Object.assign(mpd.periods, {
		"p5873": {
			"attributes": {
				"NOW": 1537561038171,
				"availabilityStartTime": 1537208106,
				"clientOffset": 0,
				"duration": 60,
				"end": undefined,
				"id": "p5873",
				"maxSegmentDuration": 2.00533,
				"minBufferTime": 2.00533,
				"minimumUpdatePeriod": 5.5,
				"periodDuration": 60,
				"profiles": "urn:mpeg:dash:profile:isoff-live:2011",
				"publishTime": "2018-09-21T20:08:19Z",
				"sourceDuration": 0,
				"start": 352320,
				"timeShiftBufferDepth": 50.13333,
				"type": "dynamic",
				"xmlns": "urn:mpeg:dash:schema:mpd:2011",
				"xmlns:cenc": "urn:mpeg:cenc:2013",
				"xmlns:mspr": "urn:microsoft:playready",
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xsi:schemaLocation": "urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
			},
			"id": "p5873",
			"index": 0,
      mpd,
		},
		"p5874": {
			"attributes": {
				"NOW": 1537561038171,
				"availabilityStartTime": 1537208106,
				"clientOffset": 0,
				"id": "p5874",
				"maxSegmentDuration": 2.00533,
				"minBufferTime": 2.00533,
				"minimumUpdatePeriod": 5.5,
				"periodDuration": undefined,
				"profiles": "urn:mpeg:dash:profile:isoff-live:2011",
				"publishTime": "2018-09-21T20:08:19Z",
				"sourceDuration": 0,
				"start": 352380,
				"timeShiftBufferDepth": 50.13333,
				"type": "dynamic",
				"xmlns": "urn:mpeg:dash:schema:mpd:2011",
				"xmlns:cenc": "urn:mpeg:cenc:2013",
				"xmlns:mspr": "urn:microsoft:playready",
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xsi:schemaLocation": "urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
			},
			"id": "p5874",
			"index": 1,
      mpd,
		}
	});

  mpd.periods['p5873'].adaptationSets = clone(adaptationSets);
  mpd.periods['p5874'].adaptationSets = clone(adaptationSets);

  Object.assign(mpd.periods['p5873'].adaptationSets[1], {
    representations: clone(audioRepresentations1),
    period: mpd.periods['p5873'],
  });
  mpd.periods['p5873'].adaptationSets[1].attributes.segmentInfo.template.startNumber = 175691;
  mpd.periods['p5873'].adaptationSets[1].attributes.segmentInfo.template.endNumber = 175721;
  Object.assign(mpd.periods['p5873'].adaptationSets[2], {
    representations: clone(audioRepresentations2),
    period: mpd.periods['p5873'],
  });
  mpd.periods['p5873'].adaptationSets[2].attributes.segmentInfo.template.startNumber = 175691;
  mpd.periods['p5873'].adaptationSets[2].attributes.segmentInfo.template.endNumber = 175721;
  Object.assign(mpd.periods['p5873'].adaptationSets[3], {
    representations: clone(videoRepresentations),
    period: mpd.periods['p5873'],
  });
  mpd.periods['p5873'].adaptationSets[3].attributes.segmentInfo.template.startNumber = 175984;
  mpd.periods['p5873'].adaptationSets[3].attributes.segmentInfo.template.endNumber = 176013;
  Object.assign(mpd.periods['p5874'].adaptationSets[1], {
    representations: clone(audioRepresentations1),
    period: mpd.periods['p5874'],
    continuesPeriod: 'p5873',
  });
  mpd.periods['p5874'].adaptationSets[1].attributes.segmentInfo.template.startNumber = 175721;
  mpd.periods['p5874'].adaptationSets[1].attributes.segmentInfo.template.presentationTimeOffset = "16914261919";
  Object.assign(mpd.periods['p5874'].adaptationSets[2], {
    representations: clone(audioRepresentations2),
    period: mpd.periods['p5874'],
    continuesPeriod: 'p5873',
  });
  mpd.periods['p5874'].adaptationSets[2].attributes.segmentInfo.template.startNumber = 175721;
  mpd.periods['p5874'].adaptationSets[2].attributes.segmentInfo.template.presentationTimeOffset = "16914261919";
  Object.assign(mpd.periods['p5874'].adaptationSets[3], {
    representations: clone(videoRepresentations),
    period: mpd.periods['p5874'],
    continuesPeriod: 'p5873',
  });
  mpd.periods['p5874'].adaptationSets[3].attributes.segmentInfo.template.startNumber = 176013;
  mpd.periods['p5874'].adaptationSets[3].attributes.segmentInfo.template.presentationTimeOffset = "31714200000";

  console.error(mpd.periods);
  for (let period in mpd.periods) {
    for (let adaptationSet in mpd.periods[period].adaptationSets) {
      for (let representation in mpd.periods[period].adaptationSets[adaptationSet].representations) {
        Object.assign(mpd.periods[period].adaptationSets[adaptationSet].representations[representation],
          {adaptationSet: mpd.periods[period].adaptationSets[adaptationSet]});
        mpd.periods[period].adaptationSets[adaptationSet].representations[representation].attributes.segmentInfo.template.startNumber = mpd.periods[period].adaptationSets[adaptationSet].attributes.segmentInfo.template.startNumber;
        mpd.periods[period].adaptationSets[adaptationSet].representations[representation].attributes.segmentInfo.template.endNumber = mpd.periods[period].adaptationSets[adaptationSet].attributes.segmentInfo.template.endNumber;
        mpd.periods[period].adaptationSets[adaptationSet].representations[representation].attributes.segmentInfo.template.presentationTimeOffset = mpd.periods[period].adaptationSets[adaptationSet].attributes.segmentInfo.template.presentationTimeOffset;
      }
    }
  }

  delete mpd.periods['p5873'].adaptationSets['1'].representations['English_64000'].adaptationSet;
  delete actual.periods['p5873'].adaptationSets['1'].representations['English_64000'].adaptationSet;

  QUnit.dump.maxDepth = 30;
  QUnit.dump.parse(actual);
  QUnit.dump.parse(mpd);
  assert.deepEqual(actual.periods['p5873'].adaptationSets['1'], mpd.periods['p5873'].adaptationSets['1']);
  //assert.deepEqual(actual, mpd);
  //assert.deepEqual(mpd.periods['p5873'].adaptationSets['1'].representations['English_64000'], actual.periods['p5873'].adaptationSets['1'].representations['English_64000'], 'adsf');

  this.clock.restore();
});


QUnit.skip('seg generation4', function(assert) {
  let now = 1538167191191;
  this.clock = useFakeTimers({now});
  now = now / 1000;
  const actual = parse(error3);

  let segments = [];

  for (let periodId in actual.periods) {
    for (let asId in actual.periods[periodId].adaptationSets) {
      for (let reprId in actual.periods[periodId].adaptationSets[asId].representations) {
        actual.periods[periodId].adaptationSets[asId].representations[reprId].segments.forEach(seg => {
          assert.ok(seg.time < now);
          segments.push(seg);
        });
      }
    }
  }
});

QUnit.test('seg generation5', function(assert) {
  let gapStart = 1538513097 + 14.615 + 28978.374; // 1538542089.989
  let gapEnd = 1538513097 + 29017.00533; // 1538542114.00533
  let parsed;
  let p1SegsActual;
  let p1SegsExpected;
  let p2SegsActual;
  let p2SegsExpected;

  this.clock = useFakeTimers({now: (gapStart + 6) * 1000});
  parsed = parse(multiPeriodWithGaps);

  p1SegsActual = parsed.periods['p320'].adaptationSets['3']
    .representations['1_1775000'].segments.map(seg => seg.number);
  //p1SegsExpected = '14477'.split(' ').map(num => Number(num));
  p1SegsExpected = range(14471, 14479);

  assert.deepEqual(p1SegsActual, p1SegsExpected, 'pre-gap is correct');

  //p2SegsActual = parsed.periods['p860'].adaptationSets['3']
    //.representations['1_1775000'].segments.map(seg => seg.number);
  //p2SegsExpected = '257442 257443 257444'.split(' ').map(num => Number(num));
  //QUnit.ok(true);

  this.clock.restore();
});

QUnit.test('seg generation6', function(assert) {
  let gapStart = 1538513097 + 20.473 + 78580.516; // 1538591697.989
  let gapEnd = 1538513097 + 78628.00533; // 1538591725.00533
  let parsed;
  let p1SegsActual;
  let p1SegsExpected;
  let p2SegsActual;
  let p2SegsExpected;

  p1SegsExpected = range(39243, 39254);
  p2SegsExpected = [];

  this.clock = useFakeTimers({now: (gapStart + 10) * 1000});
  parsed = parse(multiPeriodWithGaps2);
  p1SegsActual = parsed.periods['p868'].adaptationSets['3']
    .representations['1_1775000'].segments.map(seg => seg.number);
  p2SegsActual = parsed.periods['p869'].adaptationSets['3']
    .representations['1_1775000'].segments;
  assert.deepEqual(p1SegsActual, p1SegsExpected, 'pre-gap segments correct');
  assert.deepEqual(p2SegsActual, p2SegsExpected, 'post-gap segments correct');
  console.log(parsed.periods['p869'].adaptationSets['3'].representations['1_1775000'].attributes);

  this.clock = useFakeTimers({now: (gapStart + 25) * 1000});
  parsed = parse(multiPeriodWithGaps2);
  p1SegsActual = parsed.periods['p868'].adaptationSets['3']
    .representations['1_1775000'].segments.map(seg => seg.number);
  p2SegsActual = parsed.periods['p869'].adaptationSets['3']
    .representations['1_1775000'].segments;
  assert.deepEqual(p1SegsActual, p1SegsExpected, 'pre-gap segments correct');
  assert.deepEqual(p2SegsActual, p2SegsExpected, 'post-gap segments correct');

  this.clock = useFakeTimers({now: (gapEnd - 0.001) * 1000});
  parsed = parse(multiPeriodWithGaps2);
  p1SegsActual = parsed.periods['p868'].adaptationSets['3']
    .representations['1_1775000'].segments.map(seg => seg.number);
  p2SegsActual = parsed.periods['p869'].adaptationSets['3']
    .representations['1_1775000'].segments;
  assert.deepEqual(p1SegsActual, p1SegsExpected, 'pre-gap segments correct');
  assert.deepEqual(p2SegsActual, p2SegsExpected, 'post-gap segments correct');

  this.clock = useFakeTimers({now: (gapEnd + parsed.attributes.maxSegmentDuration) * 1000});
  parsed = parse(multiPeriodWithGaps2);
  p1SegsActual = parsed.periods['p868'].adaptationSets['3']
    .representations['1_1775000'].segments.map(seg => seg.number);
  p2SegsActual = parsed.periods['p869'].adaptationSets['3']
    .representations['1_1775000'].segments;
  assert.deepEqual(p1SegsActual, p1SegsExpected, 'pre-gap segments correct');
  assert.deepEqual(p2SegsActual, p2SegsExpected, 'post-gap segments correct');

  p1SegsExpected = range(39247, 39254);
  p2SegsExpected = range(39262, 39265);

  this.clock = useFakeTimers({now: (gapEnd + 10) * 1000});
  parsed = parse(multiPeriodWithGaps2);
  p1SegsActual = parsed.periods['p868'].adaptationSets['3']
    .representations['1_1775000'].segments.map(seg => seg.number);
  p2SegsActual = parsed.periods['p869'].adaptationSets['3']
    .representations['1_1775000'].segments.map(seg => seg.number);
  assert.deepEqual(p1SegsActual, p1SegsExpected, 'pre-gap segments correct');
  assert.deepEqual(p2SegsActual, p2SegsExpected, 'post-gap segments correct');

  //const p2SegsActual = actual.periods['p860'].adaptationSets['3']
    //.representations['1_1775000'].segments.map(seg => seg.number);
  //const p2SegsExpected = '257442 257443 257444'.split(' ').map(num => Number(num));
  //QUnit.ok(true);

  this.clock.restore();
});

QUnit.test('seg generation 7', function(assert) {
  this.clock = useFakeTimers({now: 1538625944509});
  const actual = parse(error5);

  const p1SegsActual = actual.periods['p1246'].adaptationSets['3']
    .representations['1_1775000'].segments.map(seg => seg.number);
  const p1SegsExpected = range(56323, 56337);

  const p2SegsActual = actual.periods['p1247'].adaptationSets['3']
    .representations['1_1775000'].segments.map(seg => seg.number);
  const p2SegsExpected = [];

  assert.deepEqual(p1SegsActual, p1SegsExpected, '1st period segs');
  assert.deepEqual(p2SegsActual, p2SegsExpected, '2nd period segs');

  this.clock.restore();

});

QUnit.test('seg generation 8', function(assert) {
  let p1Start = 1538513097 + 677507.342; // 1539190604.342
  let p1End = 1538513097 + 677535.416; // 1539190632.416
  let gapStart = 1538513097 + 20.572 + 677535.416; // 1539190652.988
  let gapEnd = 1538513097 + 677571.00533; // 1539190668.00533
  let parsed;
  let p1SegsActual;
  let p1SegsExpected;
  let p2SegsActual;
  let p2SegsExpected;
  let p3SegsActual;
  let p3SegsExpected;

  p1SegsExpected = range(338198, 338201);
  p2SegsExpected = range(338201, 338212);
  p3SegsExpected = range(338215, 338218);

  this.clock = useFakeTimers({now: 1539190676273});
  parsed = parse(error6);

  p1SegsActual = parsed.periods['p13433'].adaptationSets['3']
    .representations['1_1775000'].segments.map(seg => seg.number);
  p2SegsActual = parsed.periods['p13434'].adaptationSets['3']
    .representations['1_1775000'].segments.map(seg => seg.number);
  p3SegsActual = parsed.periods['p13435'].adaptationSets['3']
    .representations['1_1775000'].segments.map(seg => seg.number);
  assert.deepEqual(p1SegsActual, p1SegsExpected, 'good-period segments correct');
  assert.deepEqual(p2SegsActual, p2SegsExpected, 'pre-gap segments correct');
  assert.deepEqual(p3SegsActual, p3SegsExpected, 'post-gap segments correct');

  this.clock.restore();
});

QUnit.test('seg generation 9', function(assert) {
  let gapStart = 1538513097 + 56.644 + 712512.344; // 1539190652.988
  let gapEnd = 1538513097 + 712584.00533; // 1539190668.00533
  let parsed;
  let p1SegsActual;
  let p1SegsExpected;
  let p2SegsActual;
  let p2SegsExpected;

  p1SegsExpected = range(355013, 355028);
  p2SegsExpected = range(355031, 355032);

  this.clock = useFakeTimers({now: 1539225686596});
  parsed = parse(error7);

  p1SegsActual = parsed.periods['p14112'].adaptationSets['1']
    .representations['English_64000'].segments.map(seg => seg.number);
  p2SegsActual = parsed.periods['p14113'].adaptationSets['1']
    .representations['English_64000'].segments.map(seg => seg.number);
  assert.deepEqual(p1SegsActual, p1SegsExpected, 'pre-gap segments correct');
  assert.deepEqual(p2SegsActual, p2SegsExpected, 'post-gap segments correct');

  this.clock.restore();
});

QUnit.test('seg generation 10', function(assert) {
  let p1Start = 1538513097 + 677507.342; // 1539190604.342
  let p1End = 1538513097 + 677535.416; // 1539190632.416
  let gapStart = 1538513097 + 20.572 + 677535.416; // 1539190652.988
  let gapEnd = 1538513097 + 677571.00533; // 1539190668.00533
  let parsed;
  let p1SegsActual;
  let p1SegsExpected;
  let p2SegsActual;
  let p2SegsExpected;
  let p3SegsActual;
  let p3SegsExpected;

  p1SegsExpected = range(355977, 355980);
  p2SegsExpected = range(355980, 355993);
  p3SegsExpected = range(355996, 355997);

  this.clock = useFakeTimers({now: 1539227626217});
  parsed = parse(error8);

  console.log(parsed.periods);
  p1SegsActual = parsed.periods['p14153'].adaptationSets['1']
    .representations['English_64000'].segments.map(seg => seg.number);
  p2SegsActual = parsed.periods['p14154'].adaptationSets['1']
    .representations['English_64000'].segments.map(seg => seg.number);
  p3SegsActual = parsed.periods['p14155'].adaptationSets['1']
    .representations['English_64000'].segments.map(seg => seg.number);
  assert.deepEqual(p1SegsActual, p1SegsExpected, 'good-period segments correct');
  assert.deepEqual(p2SegsActual, p2SegsExpected, 'pre-gap segments correct');
  assert.deepEqual(p3SegsActual, p3SegsExpected, 'post-gap segments correct');

  this.clock.restore();
});

QUnit.test('seg generation 11', function(assert) {
  let p1Start = 1538513097 + 677507.342; // 1539190604.342
  let p1End = 1538513097 + 677535.416; // 1539190632.416
  let gapStart = 1538513097 + 58.3 + 715165.688; // 1539228320.988
  let gapEnd = 1538513097 + 715238.00533; // 1539228335.00533
  let parsed;
  let p1SegsActual;
  let p1SegsExpected;
  let p2SegsActual;
  let p2SegsExpected;
  let p3SegsActual;
  let p3SegsExpected;

  p1SegsExpected = range(356331, 356346);
  p2SegsExpected = range(356348, 356350);

  this.clock = useFakeTimers({now: 1539228341068});
  parsed = parse(error9);

  console.log(parsed.periods);
  p1SegsActual = parsed.periods['p14169'].adaptationSets['1']
    .representations['English_64000'].segments.map(seg => seg.number);
  p2SegsActual = parsed.periods['p14170'].adaptationSets['1']
    .representations['English_64000'].segments.map(seg => seg.number);
  assert.deepEqual(p1SegsActual, p1SegsExpected, 'pre-gap segments correct');
  assert.deepEqual(p2SegsActual, p2SegsExpected, 'post-gap segments correct');

  this.clock.restore();
});

QUnit.test('seg generation 12', function(assert) {
  let attrs1 = {
    NOW: 1536857988940,
    availabilityStartTime: 1535471778,
    clientOffset: -2,
    duration: 96256,
    end: undefined,
    //endNumber: 691261,
    id: "1",
    label: "English",
    maxSegmentDuration: 2.00533,
    minBufferTime: 2.00533,
    minimumUpdatePeriod: 5.5,
    periodDuration: undefined,
    presentationTimeOffset: "66533316928",
    profiles: "urn:mpeg:dash:profile:isoff-live:2011",
    publishTime: "2018-09-13T16:59:46Z",
    sourceDuration: 0,
    start: 1386110.76933,
    startNumber: 691213,
    timescale: 48000,
    timeShiftBufferDepth: 50.13333,
    type: "dynamic",
  };
  let attrs2 = {
    NOW: 1536857988940,
    availabilityStartTime: 1535471778,
    clientOffset: -2,
    duration: 96256,
    end: undefined,
    endNumber: undefined,
    id: "1",
    label: "English",
    maxSegmentDuration: 2.00533,
    minBufferTime: 2.00533,
    minimumUpdatePeriod: 5.5,
    periodDuration: undefined,
    presentationTimeOffset: "66537927456",
    profiles: "urn:mpeg:dash:profile:isoff-live:2011",
    publishTime: "2018-09-13T16:59:46Z",
    sourceDuration: 0,
    start: 1386206.822,
    startNumber: 691261,
    timescale: 48000,
    timeShiftBufferDepth: 50.13333,
    type: "dynamic",
  };
  let nums1 = segmentRange.dynamic(attrs1);
  let nums2 = segmentRange.dynamic(attrs2);

  assert.deepEqual(nums1, {start: 691238, end: 691261}, 'old period success');
  assert.deepEqual(nums2, {start: 691261, end: 691262}, 'new period success');
});

