/**
 * Associates each video playlist with an audio group, trying to weight based
 * on video bandwidth.
 */
export const mapAudioGroups = (master) => {
  let videoRates = master.playlists.filter((playlist) => playlist.attributes.RESOLUTION);
  let audioRates = Object.keys(master.mediaGroups.AUDIO);
  let numAudioRates = Object.keys(master.mediaGroups.AUDIO).length;
  let normalizeFactor = videoRates.reduce((a, b) => Math.max(a, b.attributes.BANDWIDTH),
    videoRates[0].attributes.BANDWIDTH);
  let audioMapper = videoRates.map((rate) => {
    return Math.round((rate.attributes.BANDWIDTH / normalizeFactor) * (numAudioRates - 1));
  });

  if (audioMapper[audioMapper.length - 1] !== 0) {
    audioMapper[audioMapper.length - 1] = 0;
  }
  if (audioMapper[0] !== audioRates.length - 1) {
    audioMapper[0] = audioRates.length - 1;
  }

  audioMapper.forEach((audioGroupIndex, videoRateIndex) => {
    master.playlists[videoRates[videoRateIndex].uri].attributes.AUDIO = audioRates[audioGroupIndex];
  });
};

let longTermVars = [];

/**
 * Associates each video playlist with the highest-bandwidth audio group.
 */
export const mapHighestAudioGroup = (master) => {
};

export const formatVttPlaylist = ({ attributes, segments }) => {
  if (typeof segments === 'undefined') {
    // vtt tracks may use single file in BaseURL
    segments = [{
      uri: attributes.baseUrl,
      timeline: attributes.periodIndex,
      resolvedUri: attributes.baseUrl || '',
      duration: attributes.sourceDuration,
      number: 0
    }];
    // targetDuration should be the same duration as the only segment
    attributes.duration = attributes.sourceDuration;
  }
  return {
    attributes: {
      NAME: attributes.id,
      BANDWIDTH: attributes.bandwidth,
      ['PROGRAM-ID']: 1
    },
    uri: '',
    endList: (attributes.type || 'static') === 'static',
    timeline: attributes.periodIndex,
    resolvedUri: attributes.baseUrl || '',
    targetDuration: attributes.duration,
    segments,
    mediaSequence: segments.length ? segments[0].number : 1
  };
};

export const formatAudioPlaylist = (representation, newTimeline) => {
  const role = representation.attributes.role &&
    representation.attributes.role.value || 'main';
  const language = representation.attributes.lang || '';
  let presentationTimeOffset = representation.adaptationSet.pto;

  //['base', 'list', 'timeline', 'template'].forEach(type => {
    //if (representation.adaptationSet.attributes.segmentInfo[type] &&
        //representation.adaptationSet.attributes.segmentInfo[type].presentationTimeOffset) {
      //presentationTimeOffset = representation.adaptationSet.attributes.segmentInfo[type].presentationTimeOffset / representation.adaptationSet.attributes.segmentInfo[type].timescale;
    //}
  //});

  //const startTime = representation.attributes.availabilityStartTime +
    //representation.attributes.start +
    //(
      //(representation.segments[0].number - representation.attributes.startNumber) *
      //representation.segments[0].duration
    //) +
    //presentationTimeOffset;
  //const playlistStart = new Date(startTime * 1000);

  let label = 'main';

  if (language) {
    label = `${representation.attributes.lang} (${role})`;
  }
  const playlist = {
    attributes: {
      NAME: representation.attributes.id,
      BANDWIDTH: representation.attributes.bandwidth,
      CODECS: representation.attributes.codecs,
      ['PROGRAM-ID']: 1
    },
    id: representation.attributes.id,
    uri: '',
    endList: (representation.attributes.type || 'static') === 'static',
    //timeline: representation.timeline || globalCurrentTimeline + 1,
    //timeline: representation.adaptationSet.period.id,
    timeline: representation.timeline,
    period: representation.adaptationSet.period.id,
    resolvedUri: '',
    targetDuration: representation.segments[0].duration,
    //segments: representation.segments,
    segments: representation.segments.map(seg => {
      //seg.period = seg.timeline;
      seg.periodStart = representation.adaptationSet.period.attributes.start;
      seg.presentationTimeOffset = presentationTimeOffset;
      //seg.timeline = representation.timeline;
      return seg;
    }),
    //mediaSequence: representation.adaptationSet.startNumber,
    startTime: representation.adaptationSet.period.attributes.start,
    //dateTimeString: playlistStart.toISOString(),
    //dateTimeObject: playlistStart,
    presentationTimeOffset: presentationTimeOffset,
    mediaSequence: representation.segments.length ?
      representation.segments[0].number : 1,
    continuesTimeline: representation.continuesPeriod,
    playlistType: 'dash',
    contentProtection: representation.contentProtection
  };

  //console.log(representation.contentProtection);

  //playlist.segments[0].dateTimeString = playlistStart.toISOString();
  //playlist.segments[0].dateTimeObject = playlistStart;

  playlist.discontinuitySequence = representation.timeline;
  if (newTimeline) {
    //playlist.discontinuityStarts = [0];
    //playlist.segments[0].discontinuity = true;
  }

  //console.log(`seg timeline is ${playlist.segments[0].timeline}`);
    //playlist.segments[0].discontinuity = true;
  //if (representation.adaptationSet.contentProtection) {
    ////console.log('audio contentProtection', representation.adaptationSet.contentProtection);
    //playlist.contentProtection = representation.adaptationSet.contentProtection;
  //}

  let segNumber = playlist.segments[0].number;
  for (let i = 0; i < playlist.segments.length; i++, segNumber++) {
    if (playlist.segments[i].number !== segNumber) {
      longTermVars.push(representation.adaptationSet.period.mpd);
      //console.error('segment number disco!', longTermVars[longTermVars.length - 1]);
      //console.error(playlist.segments.map(seg => seg.number).join(' '));
      //throw new Error('segment number disco!');
    }
  }

  //console.log('segments', playlist.segments);
  return {
    language,
    autoselect: true,
    default: role === 'main',
    playlists: [playlist],
    uri: '',
  }
};

export const organizeVttPlaylists = playlists => {
  return playlists.reduce((a, playlist) => {
    const label = playlist.attributes.lang || 'text';

    // skip if we already have subtitles
    if (a[label]) {
      return a;
    }

    a[label] = {
      language: label,
      default: false,
      autoselect: false,
      playlists: [formatVttPlaylist(playlist)],
      uri: ''
    };

    return a;
  }, {});
};

export const formatVideoPlaylist = (representation, newTimeline) => {
  let presentationTimeOffset = representation.adaptationSet.pto;

  //['base', 'list', 'timeline', 'template'].forEach(type => {
    //if (representation.adaptationSet.attributes.segmentInfo[type] &&
        //representation.adaptationSet.attributes.segmentInfo[type].presentationTimeOffset) {
      //presentationTimeOffset = representation.adaptationSet.attributes.segmentInfo[type].presentationTimeOffset / representation.adaptationSet.attributes.segmentInfo[type].timescale;
    //}
  //});

  //const startTime = representation.attributes.availabilityStartTime +
    //representation.attributes.start +
    //(
      //(representation.segments[0].number - representation.attributes.startNumber) *
      //representation.segments[0].duration
    //) +
    //presentationTimeOffset;
  //const playlistStart = new Date(startTime * 1000);

  const playlist = {
    attributes: {
      NAME: representation.id,
      AUDIO: representation.attributes.AUDIO,
      SUBTITLES: representation.attributes.SUBTITLES,
      RESOLUTION: {
        width: representation.attributes.width,
        height: representation.attributes.height
      },
      CODECS: representation.attributes.codecs,
      BANDWIDTH: representation.attributes.bandwidth,
      ['PROGRAM-ID']: 1
    },
    id: representation.id,
    uri: '',
    endList: (representation.attributes.type || 'static') === 'static',
    //timeline: representation.timeline || globalCurrentTimeline + 1,
    //timeline: representation.adaptationSet.period.id,
    timeline: representation.timeline,
    period: representation.adaptationSet.period.id,
    resolvedUri: '',
    targetDuration: representation.segments[0].duration,
    segments: representation.segments.map(seg => {
      //seg.period = seg.timeline;
      seg.periodStart = representation.adaptationSet.period.attributes.start;
      seg.presentationTimeOffset = presentationTimeOffset;
      //seg.timeline = representation.timeline;
      return seg;
    }),
    //mediaSequence: representation.adaptationSet.attributes.startNumber,
    mediaSequence: representation.segments.length ?
      representation.segments[0].number : 1,
    startTime: representation.adaptationSet.period.attributes.start,
    //dateTimeString: playlistStart.toISOString(),
    //dateTimeObject: playlistStart,
    presentationTimeOffset: presentationTimeOffset,
    continuesTimeline: representation.continuesPeriod,
    playlistType: 'dash',
    contentProtection: representation.contentProtection
  };

  //playlist.segments[0].dateTimeString = playlistStart.toISOString();
  //playlist.segments[0].dateTimeObject = playlistStart;

  //console.log(representation.contentProtection);
  playlist.discontinuitySequence = representation.timeline;
  if (newTimeline) {
    //playlist.discontinuityStarts = [0];
    //playlist.segments[0].discontinuity = true;
  }

  let segNumber = playlist.segments[0].number;
  for (let i = 0; i < playlist.segments.length; i++, segNumber++) {
    if (playlist.segments[i].number !== segNumber) {
      //console.error('segment number disco!', representation.adaptationSet.period.mpd);
      //console.error(playlist.segments.map(seg => seg.number).join(' '));
      //throw new Error('segment number disco!');
    }
  }

  //console.log('segments', playlist.segments);

  //console.log(`seg timeline is ${playlist.segments[0].timeline}`);
  //if (representation.adaptationSet.contentProtection) {
    ////console.log('video contentProtection', representation.adaptationSet.contentProtection);
    //playlist.contentProtection = representation.adaptationSet.contentProtection;
  //}

  return playlist;
};

//let globalCurrentTimeline;

export const toM3u8 = (mpdObj, currentTimeline = 0, currentPeriod, periodTimelineMap) => {
  if (!mpdObj.periods) {
    return {};
  }

  const ast = mpdObj.attributes.availabilityStartTime;
  const tsb = mpdObj.attributes.timeShiftBufferDepth;
  const now = mpdObj.attributes.NOW;
  const minimumUpdatePeriod = mpdObj.attributes.minimumUpdatePeriod !== undefined ?
    mpdObj.attributes.minimumUpdatePeriod : 0;
  let mainPlaylists = [];
  let videoPlaylists = [];
  let audioPlaylists = [];
  let videoPlaylistsTemp = {};
  let audioPlaylistsTemp = {};
  let vttPlaylists = [];
  let periodTimeline = currentTimeline;
  let lastPeriod = undefined;
  let playlists = {};
  let ptos = {};

  for (let p in periodTimelineMap) {
    if (mpdObj.periods[p] === undefined) {
      delete periodTimelineMap[p];
    }
  }

  // TODO: filter out periods which haven't started yet
  for (let periodId in mpdObj.periods) {
    const period = mpdObj.periods[periodId];

    for (let asId in period.adaptationSets) {
      const adaptationSet = period.adaptationSets[asId];

      ['base', 'list', 'timeline', 'template'].forEach(type => {
        if (adaptationSet.attributes.segmentInfo[type] &&
            adaptationSet.attributes.segmentInfo[type].presentationTimeOffset) {
          ptos[asId] = adaptationSet.attributes.segmentInfo[type].presentationTimeOffset /
            adaptationSet.attributes.segmentInfo[type].timescale;
        }
      });
      if (!ptos[asId]) {
        ptos[asId] = 0;
      }
    }

    let maxPto = 0;
    for (let asId in ptos) {
      maxPto = Math.max(ptos[asId], maxPto);
    }
    for (let asId in ptos) {
      ptos[asId] = maxPto - ptos[asId];
    }
    for (let asId in period.adaptationSets) {
      const adaptationSet = period.adaptationSets[asId];

      adaptationSet.pto = ptos[asId];
      // timeline --> period mapping logic
      if (adaptationSet.continuesPeriod !== undefined) {
        if (periodTimelineMap[adaptationSet.continuesPeriod] !== undefined) {
          if (periodTimelineMap[periodId] === undefined) {
            // this period should use the same timeline as the period it continues
            periodTimelineMap[periodId] = periodTimelineMap[adaptationSet.continuesPeriod];
          }
        } else {
          // what will this do?
          //console.error('fell into this clause');
          periodTimelineMap[periodId] = currentTimeline;
        }
      } else if (currentPeriod === periodId) {
        periodTimelineMap[periodId] = currentTimeline;
      } else if (periodTimelineMap[periodId] === undefined) {
        console.debug(`Setting timeline for ${periodId} to be ${currentTimeline + 1}`);
        periodTimelineMap[periodId] = currentTimeline + 1;
      }

      let representations = Object.keys(adaptationSet.representations)
        .map((key) => adaptationSet.representations[key]);

      // sort representations by bandwidth so that we can do a 1-to-1 mapping
      // of video rates --> audio rates later on
      representations.sort((a, b) => {
        if (a.attributes.bandwidth === b.attributes.bandwidth) {
          return 0;
        } else if (a.attributes.bandwidth < b.attributes.bandwidth) {
          return 1;
        } else {
          return -1;
        }
      });

      // TODO: Maybe we should actually do a for loop here to use representation
      // ids for mapping, rather than simply an index into an array.
      representations.forEach((representation, repIndex) => {
        if (!representation.segments.length) {
          return;
        }

        representation.continuesPeriod = adaptationSet.continuesPeriod;
        representation.timeline = periodTimelineMap[periodId];
        if (adaptationSet.continuesPeriod && periodTimelineMap[adaptationSet.continuesPeriod] &&
            representation.timeline !== periodTimelineMap[adaptationSet.continuesPeriod]) {
          console.error('GOT A DISCO', adaptationSet.continuesPeriod, representation.timeline, periodTimelineMap[adaptationSet.continuesPeriod]);
        }
        // annotate each segment with its respective period and timeline
        representation.segments.forEach(seg => {
          seg.period = periodId;
          seg.timeline = representation.timeline;
        });
        // contentProtection should be an array for when we merge contiguous
        // representations later on
        representation.contentProtection = [];
        if (adaptationSet.contentProtection) {
          representation.contentProtection.push(adaptationSet.contentProtection);
        }
        const attrs = representation.attributes;
        const playlistType = attrs.contentType ||
          attrs.mimeType.substring(0, attrs.mimeType.indexOf('/'));

        if (!playlists[playlistType]) {
          playlists[playlistType] = {};
        }

        // TODO: Rename variable
        // This is where contiguous representations are merged
        const asdf = playlists[playlistType];
        // if we have a playlist of the same type with the same adaptationSet id
        // and same representation index, then we should merge their contents
        // (specifically their segments and contentProtection arrays)
        if (asdf[asId] && asdf[asId][repIndex]) {
          representation.segments = asdf[asId][repIndex]
            .segments.concat(representation.segments);
          representation.contentProtection = representation.contentProtection
            .concat(asdf[asId][repIndex].contentProtection);
          // delete the old representation
          delete asdf[asId][repIndex];
          if (Object.keys(asdf[asId]).length === 0) {
            console.error("NEVER THOUGHT I'D GET HERE");
            delete asdf[asId];
          }
        }
        if (!asdf[asId]) {
          asdf[asId] = {};
        }
        asdf[asId][repIndex] = representation;
      });
    }
    lastPeriod = periodId;
  }

  let audioGroups = {};
  let ccGroups = {};
  let subsGroups = {};

  videoPlaylistsTemp = playlists['video'];

  const firstVideoAS = Object.keys(videoPlaylistsTemp)[0];
  const normalizeFactor = Object.values(playlists['video'][firstVideoAS])
    .reduce((a, b) => Math.max(a, b.attributes.bandwidth),
      Object.values(playlists['video'][firstVideoAS])[0].attributes.bandwidth);

  audioPlaylistsTemp = playlists['audio'];
  for (let adaptationSetId in audioPlaylistsTemp) {
    let numAudioRates = Object.keys(audioPlaylistsTemp[adaptationSetId]).length;
    let audioMapper = Object.values(videoPlaylistsTemp[firstVideoAS]).map((rate) => {
      return Math.round((rate.attributes.bandwidth / normalizeFactor) * (numAudioRates - 1));
    });

    if (audioMapper[audioMapper.length - 1] !== 0) {
      audioMapper[audioMapper.length - 1] = 0;
    }
    if (audioMapper[0] !== numAudioRates - 1) {
      audioMapper[0] = numAudioRates - 1;
    }
    audioMapper.reverse();

    for (let reprId in audioPlaylistsTemp[adaptationSetId]) {
      const rateName = `audio_${reprId}`;
      if (!audioGroups[rateName]) {
        audioGroups[rateName] = {};
      }
      audioGroups[rateName][audioPlaylistsTemp[adaptationSetId][reprId].adaptationSet.attributes.lang] =
        formatAudioPlaylist(
          audioPlaylistsTemp[adaptationSetId][reprId],
          audioPlaylistsTemp[adaptationSetId][reprId].timeline !== currentTimeline
        );
    }
    let reprMapper = Object.keys(audioPlaylistsTemp[adaptationSetId]);

    audioMapper.forEach((audioGroupIndex, videoRateIndex) => {
      //const rateName = `audio_${videoRateIndex}`;
      const rateName = `audio_${reprMapper[audioGroupIndex]}`;
      //if (!audioGroups[rateName]) {
        //audioGroups[rateName] = {};
      //}
      //audioGroups[rateName][audioPlaylistsTemp[adaptationSetId][audioGroupIndex].adaptationSet.attributes.lang] =
        //formatAudioPlaylist(
          //audioPlaylistsTemp[adaptationSetId][audioGroupIndex],
          //audioPlaylistsTemp[adaptationSetId][audioGroupIndex].timeline !== currentTimeline
        //);
      videoPlaylistsTemp[firstVideoAS][videoRateIndex].attributes.AUDIO = rateName;
    });
  }
  Object.values(videoPlaylistsTemp).forEach((adaptationSet) => {
    Object.values(adaptationSet).forEach((playlist) => {
      mainPlaylists.push(formatVideoPlaylist(playlist, playlist.timeline !== currentTimeline));
    });
  });
  for (let instreamId in videoPlaylistsTemp[firstVideoAS][0].adaptationSet.closedCaptions) {
    const language = videoPlaylistsTemp[firstVideoAS][0].adaptationSet.closedCaptions[instreamId];
    ccGroups[language] = {instreamId, language};
  }

  const master = {
    allowCache: true,
    discontinuityStarts: [],
    segments: [],
    endList: true,
    mediaGroups: {
      AUDIO: audioGroups,
      VIDEO: {},
      ['CLOSED-CAPTIONS']: {captions: ccGroups},
      SUBTITLES: {}
    },
    uri: '',
    duration: mpdObj.attributes.mediaPresentationDuration,
    playlists: mainPlaylists,
    minimumUpdatePeriod: minimumUpdatePeriod * 1000,
    playlistType: 'dash'
  };

  return master;
};

