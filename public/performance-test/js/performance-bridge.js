/**
 * Injected into KITABOO Authoring (same origin). Reports to opener + parent.
 */
(function () {
  'use strict';

  if (window.__KITABOO_PERF_BRIDGE__) {
    return;
  }
  window.__KITABOO_PERF_BRIDGE__ = true;

  var state = {
    startedAt: performance.now(),
    pageLoadMs: null,
    requests: [],
    requestIndex: {},
    consoleLines: []
  };

  function notifyDashboard(type, payload) {
    var msg = {
      source: 'kitaboo-perf-bridge',
      type: type,
      payload: payload || {},
      ts: performance.now()
    };
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(msg, '*');
      }
    } catch (e1) { /* ignore */ }
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(msg, '*');
      }
    } catch (e2) { /* ignore */ }
  }

  function classifyUrl(url) {
    if (!url || typeof url !== 'string') {
      return 'other';
    }
    var u = url.toLowerCase();
    if (u.indexOf('fetchassets') !== -1) {
      return 'fetchAssets';
    }
    if (u.indexOf('glossary/term') !== -1) {
      return 'glossaryTerm';
    }
    if (u.indexOf('tod_tags') !== -1 || u.indexOf('todtags') !== -1) {
      return 'lodCriteria';
    }
    if (u.indexOf('lod') !== -1 && (u.indexOf('setting') !== -1 || u.indexOf('settings') !== -1)) {
      return 'lodSettings';
    }
    if (u.indexOf('fetchcontent') !== -1 || u.indexOf('fetchpage') !== -1) {
      return 'pageJson';
    }
    if (u.indexOf('fetchtoc') !== -1) {
      return 'toc';
    }
    if (u.indexOf('.mp3') !== -1 || u.indexOf('audios') !== -1) {
      return 'audio';
    }
    return 'other';
  }

  function recordRequest(entry) {
    var key = entry.method + ' ' + entry.url;
    var bucket = state.requestIndex[key];
    if (!bucket) {
      bucket = state.requestIndex[key] = {
        method: entry.method,
        url: entry.url,
        category: entry.category,
        count: 0,
        totalDurationMs: 0,
        errors: 0
      };
      state.requests.push(bucket);
    }
    bucket.count += 1;
    bucket.totalDurationMs += entry.durationMs || 0;
    if (entry.error) {
      bucket.errors += 1;
    }
  }

  var origLog = console.log;
  console.log = function () {
    var args = Array.prototype.slice.call(arguments);
    var line = args
      .map(function (a) {
        try {
          return typeof a === 'object' ? JSON.stringify(a) : String(a);
        } catch (e) {
          return String(a);
        }
      })
      .join(' ');
    state.consoleLines.push({ ts: performance.now(), line: line });
    var match = line.match(/\[KITABOO Authoring\] Page loaded in (\d+) ms/);
    if (match) {
      state.pageLoadMs = parseInt(match[1], 10);
      notifyDashboard('pageLoad', { ms: state.pageLoadMs });
    }
    if (state.consoleLines.length > 200) {
      state.consoleLines.shift();
    }
    return origLog.apply(console, args);
  };

  function wrapFetch() {
    if (!window.fetch) {
      return;
    }
    var nativeFetch = window.fetch;
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var method = (init && init.method) || 'GET';
      var start = performance.now();
      return nativeFetch.apply(this, arguments).then(
        function (res) {
          recordRequest({
            method: method,
            url: url,
            category: classifyUrl(url),
            durationMs: performance.now() - start,
            error: !res.ok
          });
          return res;
        },
        function (err) {
          recordRequest({
            method: method,
            url: url,
            category: classifyUrl(url),
            durationMs: performance.now() - start,
            error: true
          });
          throw err;
        }
      );
    };
  }

  function wrapXhr() {
    var XHR = window.XMLHttpRequest;
    if (!XHR) {
      return;
    }
    var open = XHR.prototype.open;
    var send = XHR.prototype.send;
    XHR.prototype.open = function (method, url) {
      this.__perfMethod = method;
      this.__perfUrl = url;
      return open.apply(this, arguments);
    };
    XHR.prototype.send = function () {
      var self = this;
      var start = performance.now();
      self.addEventListener('loadend', function () {
        recordRequest({
          method: self.__perfMethod || 'GET',
          url: self.__perfUrl || '',
          category: classifyUrl(self.__perfUrl || ''),
          durationMs: performance.now() - start,
          error: self.status >= 400
        });
      });
      return send.apply(this, arguments);
    };
  }

  function analyzePageObject(pageObj) {
    if (window.KitabooPerfAnalyze) {
      var s = window.KitabooPerfAnalyze.analyzePageObject(pageObj);
      return {
        topLevelComponents: s.topLevel,
        layoutChildren: s.layoutChildren,
        lodBlocks: s.lod,
        lodTopLevel: s.lodTopLevel,
        lodInNestedJson: s.lodInNestedJson,
        cues: s.cues,
        uniqueGlossaryIds: s.uniqueGlossaryIds,
        audioSrcInJson: s.audioRefs,
        byType: s.types,
        jsonCharSize: s.jsonKb * 1024
      };
    }
    return {
      topLevelComponents: 0,
      layoutChildren: 0,
      lodBlocks: 0,
      byType: {},
      jsonCharSize: 0
    };
  }

  function buildReport() {
    var scope = null;
    try {
      if (window.angular) {
        var el = document.querySelector('[ng-controller]') || document.body;
        scope = window.angular.element(el).scope();
      }
    } catch (e) {
      scope = null;
    }
    var savedJson = scope && scope.savedJson;
    var tocEl = document.querySelector('[new-toc]');
    var pageIndex = tocEl ? parseInt(tocEl.getAttribute('pagesequence'), 10) : 0;
    if (isNaN(pageIndex)) {
      pageIndex = 0;
    }
    var pageObj = savedJson && savedJson[pageIndex];
    var analyzed = analyzePageObject(pageObj);
    var jsonStats = {
      topLevelComponents: analyzed.topLevelComponents,
      layoutChildren: analyzed.layoutChildren,
      lodBlocks: analyzed.lodBlocks,
      lodTopLevel: analyzed.lodTopLevel,
      lodInNestedJson: analyzed.lodInNestedJson,
      byType: analyzed.byType,
      jsonCharSize: analyzed.jsonCharSize,
      uniqueGlossaryIds: analyzed.uniqueGlossaryIds,
      audioSrcInJson: analyzed.audioSrcInJson
    };
    var root = document.getElementById('desktop_view') || document.body;
    var dom = {
      lodDom: root.querySelectorAll('[data-type="lod"]').length,
      cuesDom: root.querySelectorAll('section[data-type="annotation-cue"]').length,
      audioEagerFetchAssets: root.querySelectorAll('audio[src*="fetchAssets"]').length,
      audioLazyDataSrc: root.querySelectorAll('audio[data-audiosrc*="fetchAssets"]').length,
      glossaryDomNodes: root.querySelectorAll('[data-group-glossary-term-id]').length,
      sessionExpiredVisible: !!document.querySelector('#Session-Expired-Modal.in, #Session-Expired-Modal.show')
    };
    var byCategory = {};
    state.requests.forEach(function (r) {
      byCategory[r.category] = (byCategory[r.category] || 0) + r.count;
    });
    return {
      at: new Date().toISOString(),
      elapsedMs: Math.round(performance.now() - state.startedAt),
      pageLoadMs: state.pageLoadMs,
      courseId: scope && scope.courseId,
      pageSequence: pageIndex,
      activityType:
        scope &&
        scope.textEpubMetadata &&
        scope.textEpubMetadata.type,
      dom: dom,
      jsonStats: jsonStats,
      network: {
        totalTracked: state.requests.reduce(function (n, r) {
          return n + r.count;
        }, 0),
        byCategory: byCategory,
        topRequests: state.requests
          .slice()
          .sort(function (a, b) {
            return b.count - a.count;
          })
          .slice(0, 30)
      },
      lodCache: window._lodApiCache
        ? {
            criteriaCached: Object.keys(window._lodApiCache.criteriaByCourse || {}).length,
            settingsCached: Object.keys(window._lodApiCache.settingsByKey || {}).length
          }
        : null
    };
  }

  window.__KITABOO_PERF__ = {
    snapshot: buildReport,
    reset: function () {
      state.requests = [];
      state.requestIndex = {};
      state.consoleLines = [];
      state.pageLoadMs = null;
      state.startedAt = performance.now();
    }
  };

  wrapFetch();
  wrapXhr();

  window.addEventListener('message', function (ev) {
    if (!ev.data || ev.data.target !== 'kitaboo-perf-bridge') {
      return;
    }
    if (ev.data.cmd === 'snapshot') {
      notifyDashboard('snapshot', buildReport());
    }
  });

  notifyDashboard('ready', { href: location.href });
})();
