/**
 * API hosts aligned with config/services_stag.js and config/services_prod.js
 */
(function (global) {
  'use strict';

  var PLATFORMS = {
    stag: {
      id: 'stag',
      label: 'Staging (QA)',
      apiHost: 'https://qacreate1.kitaboo.com/author',
      servicesFile: 'config/services_stag.js'
    },
    prod: {
      id: 'prod',
      label: 'Production',
      apiHost: 'https://create.kitaboo.com/CAPS',
      servicesFile: 'config/services_prod.js'
    }
  };

  var PATHS = {
    courseDetails: '/services/htmlEditorServices/courseDetails/',
    fetchTOC: '/services/tocServices/v1/fetchTOC',
    fetchTOCLegacy: '/services/htmlEditorServices/fetchTOC/',
    fetchContent: '/services/tocServices/v1/fetchContent/'
  };

  function legacyTocPath(courseId, userToken) {
    return PATHS.fetchTOCLegacy + encodeURIComponent(courseId) + '/' + userToken;
  }

  function flattenTocPages(tocData) {
    var pages = [];
    if (!tocData) {
      return pages;
    }
    if (Array.isArray(tocData)) {
      return tocData.map(function (p) {
        return {
          id: p.pageId || p.id || p.pageIdDb,
          pageSequence: p.pageSequence != null ? p.pageSequence : p.pagesequence,
          title: p.pageTitle || p.title || 'Page ' + (p.pageSequence != null ? p.pageSequence : '')
        };
      });
    }
    if (tocData.toc && tocData.toc.pages) {
      pages = tocData.toc.pages;
    } else if (tocData.htmlToc && tocData.htmlToc.unitInfo) {
      tocData.htmlToc.unitInfo.forEach(function (unit) {
        (unit.chapterInfo || []).forEach(function (ch) {
          (ch.pageInfo || []).forEach(function (pg) {
            pages.push(pg);
          });
        });
      });
    }
    return pages.map(function (p) {
      return {
        id: p.id || p.pageId || p.pageIdDb,
        pageSequence: p.pageSequence != null ? p.pageSequence : p.pagesequence,
        title: p.title || p.pageTitle || 'Page ' + (p.pageSequence != null ? p.pageSequence : '')
      };
    });
  }

  function tocV1Usable(body) {
    return flattenTocPages(body).length > 0 && apiBodyOk(body);
  }

  function guessPlatformFromToken(userToken) {
    if (!userToken) {
      return null;
    }
    try {
      var decoded = atob(userToken.replace(/-/g, '+').replace(/_/g, '/'));
      if (/\.prod@|prod@/i.test(decoded)) {
        return 'prod';
      }
      if (/\.stag@|stag@|qa@|yopmail/i.test(decoded) && decoded.indexOf('.prod@') === -1) {
        return 'stag';
      }
    } catch (e) {
      /* ignore */
    }
    return null;
  }

  function apiBodyOk(body) {
    if (!body || body._parseError) {
      return false;
    }
    if (Array.isArray(body)) {
      return body.length > 0;
    }
    if (body.responseCode == null) {
      return true;
    }
    return Number(body.responseCode) === 200;
  }

  function apiGet(apiHost, path, token, courseId) {
    var headers = { usertoken: token };
    if (courseId != null) {
      headers.courseId = String(courseId);
    }
    var t0 = performance.now();
    return fetch(apiHost + path, { method: 'GET', headers: headers }).then(function (res) {
      return res.text().then(function (text) {
        var body = {};
        try {
          body = text ? JSON.parse(text) : {};
        } catch (e) {
          body = { _parseError: true, _preview: text.slice(0, 120) };
        }
        return {
          ok: res.ok,
          status: res.status,
          body: body,
          durationMs: Math.round(performance.now() - t0),
          apiHost: apiHost
        };
      });
    });
  }

  function probeCourse(platformId, courseId, userToken) {
    var platform = PLATFORMS[platformId];
    if (!platform) {
      return Promise.reject(new Error('Unknown platform: ' + platformId));
    }
    var path = PATHS.courseDetails + encodeURIComponent(courseId);
    return apiGet(platform.apiHost, path, userToken).then(function (res) {
      var businessOk = res.ok && apiBodyOk(res.body);
      return {
        platformId: platformId,
        label: platform.label,
        apiHost: platform.apiHost,
        ok: businessOk,
        httpOk: res.ok,
        status: res.status,
        durationMs: res.durationMs,
        responseCode: res.body && res.body.responseCode,
        responseMsg: res.body && res.body.responseMsg,
        courseName:
          businessOk && res.body
            ? res.body.courseName || res.body.bookName || null
            : null,
        body: res.body
      };
    });
  }

  /**
   * @param {string} mode - auto | stag | prod
   */
  function resolvePlatform(mode, courseId, userToken) {
    var order = [];
    if (mode === 'stag') {
      order = ['stag'];
    } else if (mode === 'prod') {
      order = ['prod'];
    } else {
      var guess = guessPlatformFromToken(userToken);
      if (guess === 'prod') {
        order = ['prod', 'stag'];
      } else if (guess === 'stag') {
        order = ['stag', 'prod'];
      } else {
        order = ['prod', 'stag'];
      }
    }

    var attempts = [];

    function tryAt(index) {
      if (index >= order.length) {
        return Promise.resolve({
          success: false,
          attempts: attempts,
          message:
            'Token/course not valid on staging or production. Use matching platform token and ensure config/services.js matches your environment.'
        });
      }
      var pid = order[index];
      return probeCourse(pid, courseId, userToken).then(function (result) {
        attempts.push(result);
        if (result.ok && result.courseName != null) {
          return {
            success: true,
            platformId: result.platformId,
            label: result.label,
            apiHost: result.apiHost,
            attempts: attempts,
            courseName: result.courseName
          };
        }
        if (result.ok) {
          return {
            success: true,
            platformId: result.platformId,
            label: result.label,
            apiHost: result.apiHost,
            attempts: attempts,
            courseName: 'OK'
          };
        }
        return tryAt(index + 1);
      });
    }

    return tryAt(0);
  }

  function fetchToc(apiHost, courseId, userToken) {
    var v1Ms = 0;
    return apiGet(apiHost, PATHS.fetchTOC, userToken, courseId).then(function (v1) {
      v1Ms = v1.durationMs;
      if (v1.ok && tocV1Usable(v1.body)) {
        return {
          ok: true,
          source: 'v1',
          status: v1.status,
          durationMs: v1Ms,
          body: v1.body,
          pages: flattenTocPages(v1.body)
        };
      }
      return apiGet(apiHost, legacyTocPath(courseId, userToken), userToken, courseId).then(
        function (legacy) {
          var pages = flattenTocPages(legacy.body);
          var ok = legacy.ok && pages.length > 0;
          return {
            ok: ok,
            source: ok ? 'legacy' : 'none',
            status: legacy.status,
            v1Status: v1.status,
            durationMs: v1Ms + legacy.durationMs,
            body: legacy.body,
            pages: pages
          };
        }
      );
    });
  }

  function probeToc(platformId, courseId, userToken) {
    var platform = PLATFORMS[platformId];
    if (!platform) {
      return Promise.reject(new Error('Unknown platform: ' + platformId));
    }
    return fetchToc(platform.apiHost, courseId, userToken).then(function (res) {
      return {
        ok: res.ok,
        httpOk: res.ok,
        status: res.status,
        durationMs: res.durationMs,
        pageCount: res.pages ? res.pages.length : 0,
        source: res.source,
        v1Status: res.v1Status
      };
    });
  }

  function validateBothPlatforms(courseId, userToken) {
    return Promise.all([
      probeCourse('stag', courseId, userToken),
      probeCourse('prod', courseId, userToken)
    ]).then(function (results) {
      var suggested = results[0].ok ? 'stag' : results[1].ok ? 'prod' : null;
      if (!suggested) {
        return {
          stag: results[0],
          prod: results[1],
          stagToc: null,
          prodToc: null,
          suggested: null
        };
      }
      return probeToc(suggested, courseId, userToken).then(function (tocProbe) {
        var out = {
          stag: results[0],
          prod: results[1],
          stagToc: suggested === 'stag' ? tocProbe : null,
          prodToc: suggested === 'prod' ? tocProbe : null,
          suggested: suggested,
          tocOk: tocProbe.ok,
          tocStatus: tocProbe.status
        };
        if (!tocProbe.ok) {
          out.tocWarning =
            'courseDetails OK but TOC could not be loaded (v1 HTTP ' +
            (tocProbe.v1Status || tocProbe.status) +
            ', legacy HTTP ' +
            tocProbe.status +
            ') on ' +
            PLATFORMS[suggested].label;
        } else if (tocProbe.source === 'legacy') {
          out.tocNote =
            'Using legacy TOC API (v1 fetchTOC unavailable for this course).';
        }
        return out;
      });
    });
  }

  global.KitabooPerfPlatforms = {
    PLATFORMS: PLATFORMS,
    PATHS: PATHS,
    apiBodyOk: apiBodyOk,
    flattenTocPages: flattenTocPages,
    fetchToc: fetchToc,
    guessPlatformFromToken: guessPlatformFromToken,
    apiGet: apiGet,
    probeCourse: probeCourse,
    resolvePlatform: resolvePlatform,
    validateBothPlatforms: validateBothPlatforms
  };
})(typeof window !== 'undefined' ? window : this);
