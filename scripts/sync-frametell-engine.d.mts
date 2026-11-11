export interface EngineManifestFile {
  path: string;
  sha256: string;
  adapter?: boolean;
  targetSha256?: string;
  note?: string;
}

export interface EngineManifest {
  schemaVersion: number;
  source: string;
  revision: string;
  include: string[];
  files: EngineManifestFile[];
  additions?: EngineManifestFile[];
}

export interface EngineAuditEntry {
  path: string;
  expected?: string;
  actual?: string;
  adapter: boolean;
  reason: string;
}

export interface EngineAudit {
  revision: string;
  expectedRevision: string;
  missing: string[];
  unexpected: string[];
  changed: EngineAuditEntry[];
}

export function auditEngine(options: {
  sourceRoot: string | URL;
  targetRoot: string | URL;
  manifest: EngineManifest;
}): Promise<EngineAudit>;
