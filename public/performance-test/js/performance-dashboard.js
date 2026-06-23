/**
 * KITABOO Author EPUB — performance analyzer
 */
(function () {
  'use strict';

  var activeApiHost = null;
  var activePlatform = null;

  var TH = {
    pageLoadWarn: 5000,
    pageLoadError: 12000,
    lodWarn: 150,
    lodError: 250,
    topWarn: 70,
    topError: 100,
    jsonKbWarn: 1500,
    glossaryWarn: 25,
    audioWarn: 20
  };

  var els = {};
  var authorWindow = null;
  var epubReport = null;
  var liveSnapshot = null;

  function $(id) {
    return document.getElementById(id);
  }

  function initEls() {
    els.authorUrl = $('pt-authorUrl');
    els.platform = $('pt-platform');
    els.platformStatus = $('pt-platform-status');
    els.runStatus = $('pt-run-status');
    els.emptyState = $('pt-empty-state');
    els.loader = $('pt-loader');
    els.courseBar = $('pt-course-bar');
    els.totalsGrid = $('pt-totals-grid');
    els.metrics = $('pt-metrics');
    els.issues = $('pt-issues');
    els.pagesBody = $('pt-pages-body');
    els.networkBody = $('pt-network-body');
    els.liveDetails = $('pt-live-details');
    els.log = $('pt-log');
    els.automation = $('pt-automation');
  }

  function log(msg) {
    els.log.textContent += '[' + new Date().toLocaleTimeString() + '] ' + msg + '\n';
    els.log.scrollTop = els.log.scrollHeight;
  }

  function setRunStatus(state, text) {
    els.runStatus.setAttribute('data-state', state);
    els.runStatus.textContent = text;
  }

  function setLoader(active, text) {
    if (!els.loader) {
      return;
    }
    els.loader.hidden = !active;
    if (active) {
      if (text) {
        var label = els.loader.querySelector('.pt-loader-text');
        if (label) {
          label.textContent = text;
        }
      }
      if (els.emptyState) {
        els.emptyState.hidden = true;
      }
    }
  }

  function esc(s) {
    if (s == null) {
      return '';
    }
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function parseAuthorUrl(input) {
    var raw = (input || '').trim();
    if (!raw) {
      return null;
    }
    if (!/^https?:\/\//i.test(raw)) {
      raw =
        'https://stagingauthor.kitaboo.com/html_authoring2_carnegie/index.html?' +
        raw.replace(/^\?/, '');
    }
    var q = raw.indexOf('?');
    var base = q >= 0 ? raw.slice(0, q) : raw;
    var parts = (q >= 0 ? raw.slice(q + 1) : '').split('&');
    var courseId = null;
    var userToken = null;
    var i;
    for (i = 0; i < parts.length; i++) {
      if (parts[i].indexOf('courseId=') === 0) {
        courseId = decodeURIComponent(parts[i].slice(9));
      } else if (parts[i].indexOf('userToken=') === 0) {
        userToken = decodeURIComponent(parts[i].slice(10));
      }
    }
    return { base: base, courseId: courseId, userToken: userToken };
  }

  function buildAuthorUrl(parsed) {
    var url =
      parsed.base +
      '?courseId=' +
      encodeURIComponent(parsed.courseId) +
      '&userToken=' +
      parsed.userToken;
    if (els.automation.checked && url.indexOf('automation=') < 0) {
      url += '&automation=true';
    }
    return url;
  }

  function getPlatformMode() {
    return els.platform ? els.platform.value : 'auto';
  }

  function apiGet(path, token, courseId, apiHost) {
    var host = apiHost || activeApiHost;
    if (!host) {
      return Promise.reject(new Error('No API host — run Validate URL or Analyze first'));
    }
    return window.KitabooPerfPlatforms.apiGet(host, path, token, courseId);
  }

  function showPlatformStatus(html, state) {
    els.platformStatus.hidden = false;
    els.platformStatus.className = 'pt-platform-status ' + (state || '');
    els.platformStatus.innerHTML = html;
  }

  function formatProbeFail(probe) {
    if (probe.httpOk && probe.responseCode != null && Number(probe.responseCode) !== 200) {
      return (
        'HTTP ' +
        probe.status +
        ' but API responseCode ' +
        probe.responseCode +
        (probe.responseMsg ? ' — ' + esc(probe.responseMsg) : '')
      );
    }
    return 'Failed HTTP ' + probe.status;
  }

  function formatValidationHtml(validation) {
    var lines = [
      '<strong>Staging</strong>: ' +
        (validation.stag.ok
          ? 'OK — ' + esc(validation.stag.courseName || 'connected') + ' (' + validation.stag.durationMs + ' ms)'
          : formatProbeFail(validation.stag)),
      '<strong>Production</strong>: ' +
        (validation.prod.ok
          ? 'OK — ' + esc(validation.prod.courseName || 'connected') + ' (' + validation.prod.durationMs + ' ms)'
          : formatProbeFail(validation.prod))
    ];
    if (validation.suggested) {
      lines.push(
        '<strong>Use:</strong> ' + window.KitabooPerfPlatforms.PLATFORMS[validation.suggested].label
      );
      if (validation.tocOk === true) {
        var tocProbe = validation.stagToc || validation.prodToc;
        lines.push(
          '<strong>TOC:</strong> OK (' +
            tocProbe.pageCount +
            ' page(s)' +
            (tocProbe.source === 'legacy' ? ', legacy API' : '') +
            ')'
        );
        if (validation.tocNote) {
          lines.push(esc(validation.tocNote));
        }
      } else if (validation.tocWarning) {
        lines.push('<strong>TOC:</strong> ' + esc(validation.tocWarning));
      }
    } else {
      lines.push('Neither environment accepted this token/course.');
    }
    return '<ul><li>' + lines.join('</li><li>') + '</li></ul>';
  }

  function validateUrl() {
    if (window.location.protocol === 'file:') {
      alert('Open via Live Server (http://127.0.0.1:5500/...)');
      return;
    }
    var parsed = parseAuthorUrl(els.authorUrl.value);
    if (!parsed || !parsed.courseId || !parsed.userToken) {
      alert('Paste full authoring URL with courseId and userToken.');
      return;
    }
    setRunStatus('run', 'Validating…');
    log('Validating on staging + production…');
    var guess = window.KitabooPerfPlatforms.guessPlatformFromToken(parsed.userToken);
    if (guess) {
      log('Token hint: ' + guess + ' (from email in token)');
    }

    window.KitabooPerfPlatforms.validateBothPlatforms(parsed.courseId, parsed.userToken).then(
      function (validation) {
        var state = validation.suggested && validation.tocOk !== false ? 'ok' : validation.suggested ? 'warn' : 'fail';
        showPlatformStatus(formatValidationHtml(validation), state);
        if (validation.suggested) {
          activeApiHost = window.KitabooPerfPlatforms.PLATFORMS[validation.suggested].apiHost;
          activePlatform = validation.suggested;
          if (getPlatformMode() === 'auto') {
            els.platform.value = validation.suggested;
          }
          setRunStatus('ok', validation.suggested === 'prod' ? 'Production OK' : 'Staging OK');
          log('Validated: ' + activePlatform + ' → ' + activeApiHost);
        } else {
          activeApiHost = null;
          activePlatform = null;
          setRunStatus('fail', 'Both failed');
          log('Staging HTTP ' + validation.stag.status + ', Production HTTP ' + validation.prod.status);
        }
      }
    );
  }

  function ensurePlatform(parsed) {
    var mode = getPlatformMode();
    return window.KitabooPerfPlatforms.resolvePlatform(mode, parsed.courseId, parsed.userToken).then(
      function (resolved) {
        if (!resolved.success) {
          showPlatformStatus(
            '<p>' +
              esc(resolved.message) +
              '</p><ul>' +
              resolved.attempts
                .map(function (a) {
                  return (
                    '<li>' +
                    esc(a.label) +
                    ': HTTP ' +
                    a.status +
                    (a.courseName ? ' — ' + esc(a.courseName) : '') +
                    '</li>'
                  );
                })
                .join('') +
              '</ul>',
            'fail'
          );
          throw new Error(resolved.message);
        }
        activeApiHost = resolved.apiHost;
        activePlatform = resolved.platformId;
        showPlatformStatus(
          '<strong>Using ' +
            esc(resolved.label) +
            '</strong><br><code>' +
            esc(resolved.apiHost) +
            '</code>',
          'ok'
        );
        log('API environment: ' + resolved.label + ' (' + resolved.apiHost + ')');
        return resolved;
      }
    );
  }

  function parseSavedJson(raw) {
    return window.KitabooPerfAnalyze.parseSavedJson(raw);
  }

  function analyzePageObject(pageObj) {
    return window.KitabooPerfAnalyze.analyzePageObject(pageObj);
  }

  function gradePage(s) {
    var score = 0;
    if (s.topLevel >= TH.topError) {
      score += 3;
    } else if (s.topLevel >= TH.topWarn) {
      score += 1;
    }
    // LoD and page-JSON size are no longer scored toward the page grade.
    // Post scroll-virtualization optimization these no longer drive runtime
    // cost, so they are surfaced as informational warnings only (see buildIssues).
    if (s.uniqueGlossaryIds >= TH.glossaryWarn) {
      score += 1;
    }
    if (score >= 4) {
      return { label: 'Critical', cls: 'bad' };
    }
    if (score >= 2) {
      return { label: 'Heavy', cls: 'warn' };
    }
    if (score >= 1) {
      return { label: 'Moderate', cls: 'warn' };
    }
    return { label: 'OK', cls: 'ok' };
  }

  function analyzeEpub() {
    if (window.location.protocol === 'file:') {
      alert('Open via the app server, not file://:\nhttp://localhost:4321/performance-test/index.html');
      return;
    }
    var parsed = parseAuthorUrl(els.authorUrl.value);
    if (!parsed || !parsed.courseId || !parsed.userToken) {
      alert('Paste a full authoring URL with courseId and userToken.');
      return;
    }

    setRunStatus('run', 'Analyzing…');
    setLoader(true, 'Analyzing EPUB… fetching course, TOC and pages');
    log('Starting EPUB analysis for course ' + parsed.courseId);
    epubReport = {
      courseId: parsed.courseId,
      platform: null,
      apiHost: null,
      startedAt: new Date().toISOString(),
      course: null,
      pages: [],
      totals: {},
      apiTimingMs: {},
      issues: []
    };

    var PATHS = window.KitabooPerfPlatforms.PATHS;

    ensurePlatform(parsed)
      .then(function (resolved) {
        epubReport.platform = resolved.platformId;
        epubReport.apiHost = resolved.apiHost;
        return apiGet(
          PATHS.courseDetails + encodeURIComponent(parsed.courseId),
          parsed.userToken,
          null,
          resolved.apiHost
        );
      })
      .then(function (courseRes) {
        epubReport.apiTimingMs.courseDetails = courseRes.durationMs;
        if (!courseRes.ok || !window.KitabooPerfPlatforms.apiBodyOk(courseRes.body)) {
          var rc = courseRes.body && courseRes.body.responseCode;
          throw new Error(
            'courseDetails failed (HTTP ' +
              courseRes.status +
              (rc != null ? ', responseCode ' + rc : '') +
              '). Use Staging for stag@ tokens and ensure config/services.js is staging.'
          );
        }
        var meta = courseRes.body.activityMetadata || {};
        epubReport.course = {
          name: courseRes.body.courseName || courseRes.body.bookName || '—',
          type: meta.type || meta.assetType || courseRes.body.assetType || 'unknown',
          author: courseRes.body.authorName || '—'
        };
        log('Course: ' + epubReport.course.name + ' (' + epubReport.course.type + ')');
        return window.KitabooPerfPlatforms.fetchToc(
          epubReport.apiHost,
          parsed.courseId,
          parsed.userToken
        );
      })
      .then(function (tocRes) {
        epubReport.apiTimingMs.fetchTOC = tocRes.durationMs;
        epubReport.tocSource = tocRes.source;
        if (!tocRes.ok || !tocRes.pages.length) {
          throw new Error(
            'Could not load TOC (v1 HTTP ' +
              (tocRes.v1Status || '?') +
              ', legacy HTTP ' +
              tocRes.status +
              '). Refresh userToken or try hosted QA authoring.'
          );
        }
        if (tocRes.source === 'legacy') {
          log('TOC: using legacy fetchTOC API (v1 returned HTTP ' + tocRes.v1Status + ')');
        }
        var tocPages = tocRes.pages;
        log('TOC: ' + tocPages.length + ' page(s)');
        if (!tocPages.length) {
          throw new Error('No pages in TOC');
        }
        return tocPages.reduce(function (chain, pageMeta) {
          return chain.then(function () {
            var path = PATHS.fetchContent + encodeURIComponent(pageMeta.id);
            return apiGet(path, parsed.userToken, parsed.courseId, epubReport.apiHost).then(
              function (contentRes) {
              var pageObj = {};
              if (contentRes.ok && contentRes.body && contentRes.body.page) {
                pageObj = parseSavedJson(contentRes.body.page.savedJson);
              }
              var stats = analyzePageObject(pageObj);
              var row = {
                id: pageMeta.id,
                sequence: pageMeta.pageSequence,
                title: pageMeta.title,
                fetchMs: contentRes.durationMs,
                fetchOk: contentRes.ok,
                stats: stats,
                grade: gradePage(stats)
              };
              epubReport.pages.push(row);
              log(
                'Page ' +
                  (pageMeta.pageSequence != null ? pageMeta.pageSequence : '?') +
                  ': all=' +
                  stats.topLevel +
                  ', LoD=' +
                  stats.lod +
                  ', para=' +
                  stats.paragraphs +
                  ', annot=' +
                  stats.annotations +
                  ', glossary=' +
                  stats.glossaryLinks
              );
            });
          });
        }, Promise.resolve());
      })
      .then(function () {
        epubReport.pages.sort(function (a, b) {
          return (b.stats.topLevel || 0) - (a.stats.topLevel || 0);
        });
        computeTotals();
        buildIssues();
        renderReport();
        setLoader(false);
        setRunStatus('ok', 'Done');
        log('Analysis complete. See report above.');
      })
      .catch(function (err) {
        setLoader(false);
        setRunStatus('fail', 'Failed');
        log('ERROR: ' + err.message);
        alert(
          err.message +
            '\n\nTips: select Staging in API environment; match config/services.js; refresh userToken from QA if expired.'
        );
      });
  }

  function computeTotals() {
    var t = {
      pageCount: epubReport.pages.length,
      totalTopLevel: 0,
      totalLod: 0,
      totalParagraphs: 0,
      totalAnnotations: 0,
      totalChildren: 0,
      totalGlossaryIds: 0,
      totalGlossaryLinks: 0,
      totalAudioRefs: 0,
      totalJsonKb: 0,
      heaviestPage: null
    };
    epubReport.pages.forEach(function (p) {
      var s = p.stats;
      t.totalTopLevel += s.topLevel;
      t.totalLod += s.lod;
      t.totalParagraphs += s.paragraphs;
      t.totalAnnotations += s.annotations;
      t.totalChildren += s.layoutChildren;
      t.totalGlossaryIds += s.uniqueGlossaryIds;
      t.totalGlossaryLinks += s.glossaryLinks;
      t.totalAudioRefs += s.audioRefs;
      t.totalJsonKb += s.jsonKb;
    });
    if (epubReport.pages[0]) {
      t.heaviestPage = epubReport.pages[0];
    }
    epubReport.totals = t;
  }

  function buildIssues() {
    var issues = [];
    var t = epubReport.totals;
    var c = epubReport.course;

    if (c && c.type !== 'authorEPub') {
      issues.push({
        level: 'warn',
        title: 'Activity type',
        detail: 'type=' + c.type + ' (expected authorEPub for automation perf work)'
      });
    }

    if (t.heaviestPage) {
      var h = t.heaviestPage.stats;
      if (h.topLevel >= TH.topError) {
        issues.push({
          level: 'error',
          title: 'Very large page (showPageData)',
          detail:
            'Page seq ' +
            t.heaviestPage.sequence +
            ': ' +
            h.topLevel +
            ' top-level components — synchronous $compile blocks UI'
        });
      }
      if (h.lod >= TH.lodError) {
        issues.push({
          level: 'warn',
          title: 'Too many LoD blocks',
          detail:
            'Page seq ' +
            t.heaviestPage.sequence +
            ': ' +
            h.lod +
            ' LoD — consolidate in automation pipeline (P1)'
        });
      }
      if (h.uniqueGlossaryIds >= TH.glossaryWarn) {
        issues.push({
          level: 'warn',
          title: 'Glossary term API load',
          detail:
            'Page seq ' +
            t.heaviestPage.sequence +
            ': ~' +
            h.uniqueGlossaryIds +
            ' unique term IDs → many /glossary/term XHRs on open'
        });
      }
      if (h.audioRefs >= TH.audioWarn) {
        issues.push({
          level: 'warn',
          title: 'Audio / fetchAssets references',
          detail:
            h.audioRefs +
            ' fetchAssets refs in JSON — ensure lazy preload on author canvas (P0)'
        });
      }
      if (h.jsonKb >= TH.jsonKbWarn) {
        issues.push({
          level: 'warn',
          title: 'Large page JSON',
          detail: t.heaviestPage.sequence + ': ' + h.jsonKb + ' KB parse cost'
        });
      }
    }

    if (!issues.length) {
      issues.push({
        level: 'ok',
        title: 'No critical EPUB structure issues',
        detail: 'Pages are within moderate thresholds; check live tab metrics for runtime network.'
      });
    }
    if (liveSnapshot) {
      evaluateLiveIssues(liveSnapshot).forEach(function (li) {
        issues.push(li);
      });
    }
    epubReport.issues = issues;
  }

  function renderReport() {
    els.emptyState.hidden = true;
    els.courseBar.hidden = false;
    els.totalsGrid.hidden = false;

    var t = epubReport.totals;
    var c = epubReport.course || {};
    var h = t.heaviestPage;

    var plat =
      epubReport.platform && window.KitabooPerfPlatforms.PLATFORMS[epubReport.platform]
        ? window.KitabooPerfPlatforms.PLATFORMS[epubReport.platform].label
        : '—';

    els.courseBar.innerHTML =
      '<span class="pt-course-item"><strong>Environment</strong> ' +
      esc(plat) +
      '</span>' +
      '<span class="pt-course-item"><strong>Course</strong> ' +
      esc(c.name) +
      '</span>' +
      '<span class="pt-course-item"><strong>Type</strong> ' +
      esc(c.type) +
      '</span>' +
      '<span class="pt-course-item"><strong>Pages</strong> ' +
      t.pageCount +
      '</span>' +
      '<span class="pt-course-item"><strong>Heaviest</strong> #' +
      (h ? h.sequence : '—') +
      ' · ' +
      (h ? h.stats.topLevel : 0) +
      ' widgets</span>';

    var totalsCards = [
      { key: 'lod', label: 'LoD', value: t.totalLod, hint: 'Level of Support blocks' },
      { key: 'paragraph', label: 'Paragraph (text)', value: t.totalParagraphs, hint: 'Text / paragraph widgets' },
      { key: 'annotation', label: 'Annotation / cue', value: t.totalAnnotations, hint: 'Cues + annotation widgets' },
      { key: 'glossary', label: 'Glossary', value: t.totalGlossaryLinks, hint: t.totalGlossaryIds + ' unique term IDs' },
      { key: 'all', label: 'All components', value: t.totalTopLevel, hint: 'Top-level widgets (excl. layout children)' },
      { key: 'children', label: 'Layout children', value: t.totalChildren, hint: 'Nested under layouts / LoD' }
    ];
    els.totalsGrid.innerHTML = totalsCards
      .map(function (card) {
        return (
          '<article class="pt-total-card pt-total-' +
          card.key +
          '">' +
          '<div class="pt-total-value">' +
          esc(String(card.value)) +
          '</div>' +
          '<div class="pt-total-label">' +
          esc(card.label) +
          '</div>' +
          '<div class="pt-total-hint">' +
          esc(card.hint) +
          '</div></article>'
        );
      })
      .join('');

    var live = liveSnapshot || {};
    var metrics = [
      { label: 'JSON size (sum)', value: t.totalJsonKb + ' KB' },
      { label: 'Audio refs', value: String(t.totalAudioRefs) },
      { label: 'Glossary unique IDs', value: String(t.totalGlossaryIds) },
      { label: 'Live page load', value: live.pageLoadMs != null ? live.pageLoadMs + ' ms' : '—' },
      {
        label: 'Live fetchAssets',
        value:
          live.network && live.network.byCategory
            ? String(live.network.byCategory.fetchAssets || 0)
            : '—'
      },
      {
        label: 'Live glossary API',
        value:
          live.network && live.network.byCategory
            ? String(live.network.byCategory.glossaryTerm || 0)
            : '—'
      }
    ];
    els.metrics.innerHTML = metrics
      .map(function (m) {
        return (
          '<div class="pt-metric"><div class="value">' +
          esc(m.value) +
          '</div><div class="label">' +
          esc(m.label) +
          '</div></div>'
        );
      })
      .join('');

    els.issues.innerHTML = epubReport.issues
      .map(function (i) {
        return (
          '<div class="pt-issue ' +
          i.level +
          '"><h4>' +
          esc(i.title) +
          '</h4><p>' +
          esc(i.detail) +
          '</p></div>'
        );
      })
      .join('');

    els.pagesBody.innerHTML = epubReport.pages
      .map(function (p) {
        var s = p.stats;
        return (
          '<tr class="' +
          p.grade.cls +
          '"><td class="pt-cell-title">' +
          esc(p.title) +
          '</td><td>' +
          (p.sequence != null ? p.sequence : '—') +
          '</td><td>' +
          s.topLevel +
          '</td><td>' +
          s.lod +
          '</td><td>' +
          s.paragraphs +
          '</td><td>' +
          s.annotations +
          '</td><td>' +
          s.glossaryLinks +
          '</td><td>' +
          s.layoutChildren +
          '</td><td>' +
          s.jsonKb +
          '</td><td><span class="pt-grade ' +
          p.grade.cls +
          '">' +
          p.grade.label +
          '</span></td></tr>'
        );
      })
      .join('');

    if (live.network) {
      els.liveDetails.hidden = false;
      var rows = live.network.topRequests || [];
      els.networkBody.innerHTML = rows
        .map(function (r) {
          return (
            '<tr><td>' +
            esc(r.category) +
            '</td><td>' +
            r.count +
            '</td><td>' +
            Math.round(r.totalDurationMs / Math.max(r.count, 1)) +
            ' ms</td></tr>'
          );
        })
        .join('');
    }
  }

  function injectBridge(win) {
    if (!win || win.closed) {
      return false;
    }
    var doc = win.document;
    if (!doc || !doc.head) {
      return false;
    }
    function appendScript(id, file, onload) {
      if (doc.getElementById(id)) {
        if (onload) {
          onload();
        }
        return;
      }
      var s = doc.createElement('script');
      s.id = id;
      s.src = new URL(file, window.location.href).href + '?t=' + Date.now();
      if (onload) {
        s.onload = onload;
      }
      doc.head.appendChild(s);
    }
    if (doc.getElementById('kitaboo-perf-bridge-script')) {
      return true;
    }
    appendScript('kitaboo-perf-utils-script', 'js/perf-analyze-utils.js', function () {
      appendScript('kitaboo-perf-bridge-script', 'js/performance-bridge.js', function () {
        log('Bridge scripts loaded in authoring tab.');
      });
    });
    return true;
  }

  function collectFromTab() {
    var win = authorWindow;
    if (!win || win.closed) {
      alert('Click "Open authoring tab" first and wait for the page to load.');
      return;
    }
    if (!injectBridge(win)) {
      alert('Authoring tab not ready — wait for load and try again.');
      return;
    }
    setRunStatus('run', 'Collecting…');
    log('Collecting live metrics…');

    function tryDirect(n) {
      try {
        if (win.__KITABOO_PERF__ && win.__KITABOO_PERF__.snapshot) {
          liveSnapshot = win.__KITABOO_PERF__.snapshot();
          if (epubReport) {
            renderReport();
          } else {
            renderLiveOnly(liveSnapshot);
          }
          setRunStatus('ok', 'Collected');
          log(
            'Live: pageLoad=' +
              (liveSnapshot.pageLoadMs != null ? liveSnapshot.pageLoadMs + 'ms' : 'n/a') +
              ', requests=' +
              (liveSnapshot.network ? liveSnapshot.network.totalTracked : 0)
          );
          return;
        }
      } catch (e) {
        log('Direct collect error: ' + e.message);
      }
      if (n < 12) {
        setTimeout(function () {
          tryDirect(n + 1);
        }, 400);
      } else {
        win.postMessage({ target: 'kitaboo-perf-bridge', cmd: 'snapshot' }, '*');
        log('Waiting for postMessage snapshot…');
        setTimeout(function () {
          if (!liveSnapshot) {
            setRunStatus('fail', 'No data');
            log('No metrics — ensure page finished loading in authoring tab.');
          }
        }, 3000);
      }
    }
    tryDirect(0);
  }

  function renderLiveOnly(snap) {
    els.emptyState.hidden = true;
    liveSnapshot = snap;
    if (!epubReport) {
      epubReport = {
        courseId: snap.courseId || '—',
        course: { name: 'Live tab only', type: snap.activityType || '—' },
        pages: [],
        totals: { pageCount: 0, totalTopLevel: 0, totalLod: 0, totalGlossaryIds: 0, totalAudioRefs: 0, totalJsonKb: 0 },
        issues: evaluateLiveIssues(snap)
      };
    }
    renderReport();
  }

  function evaluateLiveIssues(snap) {
    var issues = [];
    if (snap.dom && snap.dom.sessionExpiredVisible) {
      issues.push({
        level: 'error',
        title: 'Session Expired visible',
        detail: 'Authoring modal is open — refresh token / URL'
      });
    }
    if (snap.pageLoadMs >= TH.pageLoadError) {
      issues.push({ level: 'error', title: 'Slow page load', detail: snap.pageLoadMs + ' ms' });
    } else if (snap.pageLoadMs >= TH.pageLoadWarn) {
      issues.push({ level: 'warn', title: 'Page load', detail: snap.pageLoadMs + ' ms' });
    }
    return issues;
  }

  function openTab() {
    var parsed = parseAuthorUrl(els.authorUrl.value);
    if (!parsed) {
      return;
    }
    var url = buildAuthorUrl(parsed);
    authorWindow = window.open(url, 'kitaboo_author_' + parsed.courseId);
    if (!authorWindow) {
      alert('Allow popups for 127.0.0.1');
      return;
    }
    log('Opened authoring tab. After load, use Collect.');
    setTimeout(function () {
      injectBridge(authorWindow);
    }, 3000);
    setTimeout(function () {
      injectBridge(authorWindow);
    }, 8000);
  }

  function exportReport() {
    var blob = new Blob(
      [
        JSON.stringify(
          { epubReport: epubReport, liveSnapshot: liveSnapshot, exportedAt: new Date().toISOString() },
          null,
          2
        )
      ],
      { type: 'application/json' }
    );
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'epub-perf-' + (epubReport && epubReport.courseId ? epubReport.courseId : 'report') + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function onMessage(ev) {
    if (!ev.data || ev.data.source !== 'kitaboo-perf-bridge') {
      return;
    }
    if (ev.data.type === 'snapshot') {
      liveSnapshot = ev.data.payload;
      if (epubReport) {
        renderReport();
      } else {
        renderLiveOnly(liveSnapshot);
      }
      setRunStatus('ok', 'Collected');
      log('Received snapshot via postMessage.');
    }
    if (ev.data.type === 'pageLoad') {
      log('Authoring page load: ' + ev.data.payload.ms + ' ms');
    }
  }

  function init() {
    initEls();
    var q = new URLSearchParams(location.search);
    if (q.get('authorUrl')) {
      els.authorUrl.value = q.get('authorUrl');
    } else if (q.get('courseId') && q.get('userToken')) {
      els.authorUrl.value =
        'https://stagingauthor.kitaboo.com/html_authoring2_carnegie/index.html?courseId=' +
        encodeURIComponent(q.get('courseId')) +
        '&userToken=' +
        q.get('userToken');
    }
    $('pt-validate-url').addEventListener('click', validateUrl);
    $('pt-analyze-epub').addEventListener('click', analyzeEpub);
    $('pt-open-tab').addEventListener('click', openTab);
    $('pt-collect').addEventListener('click', collectFromTab);
    $('pt-export').addEventListener('click', exportReport);
    window.addEventListener('message', onMessage);
    log('Ready — Validate URL (staging + prod), then Analyze EPUB.');
    log('Local authoring must use matching config/services.js (prod vs services_stag.js).');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
