/**
 * Shared EPUB / page JSON analysis.
 * LoD saved identifier is "LoD"; DOM data-type is "lod".
 */
(function (global) {
  'use strict';

  function parseSavedJson(raw) {
    if (!raw) {
      return {};
    }
    if (typeof raw === 'object') {
      return raw;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }

  function componentType(item) {
    if (!item || typeof item !== 'object') {
      return '';
    }
    return String(item.identifier || item.dataType || '').toLowerCase();
  }

  function isLodComponent(item) {
    if (!item || typeof item !== 'object') {
      return false;
    }
    var type = componentType(item);
    if (type === 'lod') {
      return true;
    }
    if (item.settings) {
      if (item.settings.lodUniqueId || item.settings.LoDSSettingData) {
        return true;
      }
      if (item.settings.displayCritaria && item.settings.displayCritaria.length) {
        return true;
      }
    }
    if (item.custom && item.custom.css) {
      var css = JSON.stringify(item.custom.css).toLowerCase();
      if (css.indexOf('lod-template') !== -1) {
        return true;
      }
    }
    return false;
  }

  function isParagraphComponent(item) {
    if (!item || typeof item !== 'object') {
      return false;
    }
    var type = componentType(item);
    return type === 'paragraph' || type === 'text-block' || type.indexOf('paragraph') !== -1;
  }

  function isAnnotationComponent(item) {
    if (!item || typeof item !== 'object') {
      return false;
    }
    var type = componentType(item);
    return (
      type === 'annotation-cue' ||
      type === 'annotation' ||
      type === 'annotationcuehighlightoutline' ||
      type === 'annotationhighlightoutline' ||
      (type.indexOf('annotation') !== -1 && type.indexOf('paragraph') === -1)
    );
  }

  function isCueComponent(item) {
    return isAnnotationComponent(item);
  }

  function countInText(jsonText, patterns) {
    var max = 0;
    patterns.forEach(function (re) {
      var m = jsonText.match(re);
      if (m && m.length > max) {
        max = m.length;
      }
    });
    return max;
  }

  function analyzePageObject(pageObj) {
    var stats = {
      topLevel: 0,
      layoutChildren: 0,
      lod: 0,
      lodTopLevel: 0,
      paragraphs: 0,
      paragraphsTopLevel: 0,
      annotations: 0,
      annotationsTopLevel: 0,
      cues: 0,
      glossaryLinks: 0,
      uniqueGlossaryIds: 0,
      glossaryHits: 0,
      audioRefs: 0,
      types: {},
      jsonKb: 0
    };
    if (!pageObj || typeof pageObj !== 'object') {
      return stats;
    }
    var jsonText = JSON.stringify(pageObj);
    stats.jsonKb = Math.round(jsonText.length / 1024);

    var lodInJson = countInText(jsonText, [
      /"identifier"\s*:\s*"LoD"/gi,
      /"lodUniqueId"\s*:\s*"lod-/gi,
      /data-type\s*=\s*["']lod["']/gi
    ]);
    var paragraphsInJson = countInText(jsonText, [/\"identifier\"\s*:\s*\"paragraph\"/gi]);
    var annotationsInJson = countInText(jsonText, [
      /\"identifier\"\s*:\s*\"annotation-cue\"/gi,
      /\"identifier\"\s*:\s*\"annotationCueHighlightOutline\"/gi,
      /\"identifier\"\s*:\s*\"annotationHighlightOutline\"/gi,
      /\"identifier\"\s*:\s*\"annotation\"/gi
    ]);
    var glossaryLinksInJson =
      (jsonText.match(/data-group-glossary-term-id/gi) || []).length +
      (jsonText.match(/groupGlossaryTermId/gi) || []).length;

    var glossaryIds = {};
    Object.keys(pageObj).forEach(function (key) {
      if (key === 'backgroundColor' || key === 'colorBullet' || key === 'pagecount') {
        return;
      }
      var item = pageObj[key];
      if (!item || typeof item !== 'object') {
        return;
      }
      if (item.layoutChildren) {
        stats.layoutChildren += 1;
        if (isCueComponent(item)) {
          stats.cues += 1;
          stats.annotations += 1;
        }
        return;
      }
      stats.topLevel += 1;
      var type = componentType(item) || 'unknown';
      stats.types[type] = (stats.types[type] || 0) + 1;
      if (isLodComponent(item)) {
        stats.lodTopLevel += 1;
      }
      if (isParagraphComponent(item)) {
        stats.paragraphsTopLevel += 1;
      }
      if (isAnnotationComponent(item)) {
        stats.annotationsTopLevel += 1;
      }
      var blob = JSON.stringify(item);
      if (blob.indexOf('fetchAssets') !== -1) {
        stats.audioRefs += (blob.match(/fetchAssets/g) || []).length;
      }
      var gm = blob.match(/groupGlossaryTermId["\s:]+(\d+)/g);
      if (gm) {
        gm.forEach(function (g) {
          var id = g.replace(/\D/g, '');
          if (id) {
            glossaryIds[id] = (glossaryIds[id] || 0) + 1;
            stats.glossaryHits += 1;
          }
        });
      }
      var htmlGm = blob.match(/data-group-glossary-term-id\s*=\s*["'](\d+)["']/gi);
      if (htmlGm) {
        htmlGm.forEach(function (g) {
          var id = g.replace(/\D/g, '');
          if (id) {
            glossaryIds[id] = (glossaryIds[id] || 0) + 1;
            stats.glossaryHits += 1;
          }
        });
      }
    });

    stats.paragraphs = Math.max(stats.paragraphsTopLevel, paragraphsInJson);
    stats.annotations = Math.max(
      stats.annotationsTopLevel + stats.cues,
      annotationsInJson
    );
    stats.lod = Math.max(stats.lodTopLevel, lodInJson);
    stats.uniqueGlossaryIds = Object.keys(glossaryIds).length;
    stats.glossaryLinks = Math.max(stats.glossaryHits, Math.ceil(glossaryLinksInJson / 2));
    return stats;
  }

  global.KitabooPerfAnalyze = {
    parseSavedJson: parseSavedJson,
    analyzePageObject: analyzePageObject,
    isLodComponent: isLodComponent
  };
})(typeof window !== 'undefined' ? window : this);
