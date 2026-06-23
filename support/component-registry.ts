/// <reference types="cypress" />
import registry from '../fixtures/test-registry.json';

export interface RegistrySuite {
  id: string;
  name: string;
  dataType: string;
  section: string;
  category: string;
  description?: string;
  automationStatus: string;
  specFile: string;
  deepSpecFile?: string | null;
}

export interface BasicComponent {
  name: string;
  dataType: string;
  section?: string;
  category?: string;
}

export function getRegistrySuites(): RegistrySuite[] {
  return (registry.suites || []) as RegistrySuite[];
}

/** Components for basic spec files (06, 07, 08) — excludes planned-only entries. */
export function getBasicComponents(specFile: string): BasicComponent[] {
  return getRegistrySuites()
    .filter(s => s.specFile === specFile && s.automationStatus !== 'planned')
    .map(s => ({
      name: s.name,
      dataType: s.dataType,
      section: s.section,
      category: s.category,
    }));
}

export function getComponentNames(specFile: string): string[] {
  return getBasicComponents(specFile).map(c => c.name);
}

/** All automatable components for dashboard / deep-test name validation. */
export function getAutomatableComponents(): BasicComponent[] {
  return getRegistrySuites()
    .filter(s => s.automationStatus !== 'planned' && s.specFile)
    .map(s => ({
      name: s.name,
      dataType: s.dataType,
      section: s.section,
      category: s.category,
    }));
}

export function getRegistryMeta() {
  return registry._meta || {};
}

/** Map dataType → registry suite entry (for cross-referencing spec vs JSON names). */
export function getRegistryByDataType(): Record<string, RegistrySuite> {
  const map: Record<string, RegistrySuite> = {};
  for (const s of getRegistrySuites()) {
    if (s.automationStatus !== 'planned') map[s.dataType] = s;
  }
  return map;
}

/**
 * Resolve dashboard picker names (from test-registry.json) to dataTypes.
 * Handles name mismatches between JSON labels and authoring panel widget names.
 */
export function resolvePickerNamesToDataTypes(names: string[]): string[] {
  const wanted = names.map(n => n.toLowerCase());
  const dataTypes: string[] = [];
  for (const s of getRegistrySuites()) {
    if (
      wanted.includes(s.name.toLowerCase()) ||
      wanted.includes(s.id.toLowerCase()) ||
      wanted.includes(s.dataType.toLowerCase())
    ) {
      dataTypes.push(s.dataType);
    }
  }
  return dataTypes;
}

/**
 * Load components for a spec file — registry is primary, local fallback fills gaps.
 * Keeps tests stable when test-registry.json is not yet complete for every component.
 */
export function loadComponentsForSpec(
  specFile: string,
  fallback: BasicComponent[],
): BasicComponent[] {
  const fromRegistry = getBasicComponents(specFile);
  if (fromRegistry.length === 0) return fallback;

  const seen = new Set(fromRegistry.map(c => c.dataType));
  const extras = fallback.filter(c => !seen.has(c.dataType));
  return [...fromRegistry, ...extras];
}
