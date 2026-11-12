# Settings and voices implementation

## Interfaces

GET /api/settings and PUT /api/settings return AppSettings:

    {revision:number, model:{provider:string,model:string,baseUrl:string,protocol:'openai'|'anthropic',apiKeyConfigured:boolean},speech:{volcengine:{apiKeyConfigured:boolean,voice:string,resourceId:string},elevenlabs:{apiKeyConfigured:boolean,voice:string}}}

PUT accepts SettingsUpdate:

    {revision:number,model?:{provider?,model?,baseUrl?,protocol?,apiKey?:string|null},speech?:{volcengine?:{apiKey?:string|null,voice?,resourceId?},elevenlabs?:{apiKey?:string|null,voice?}}}

Blank/omitted apiKey preserves; null clears including environment fallback. Stale revision: 409 SETTINGS_CONFLICT. Secret never in responses. URL auth/query/fragment prohibited.

GET /api/settings/voices returns {source:'official-preset',sourceUrl:string,voices:VoiceDefinition[]}.
VoiceDefinition={id:string,name:string,gender:'male'|'female',language:'zh'|'en',resourceId:string}.
POST /api/settings/voices/preview accepts {voice:string,text?:string} and returns audio/mpeg. Text at most120characters. Uses saved server key, safe errors.

Export AppSettings, SettingsUpdate, VoiceDefinition, VOLCENGINE_VOICES, VOLCENGINE_VOICES_SOURCE from contracts.

## Task 1 backend (delegate)
- [ ] Failing tests: redaction/blank preservation/explicit clearing, revision conflict, atomic persistence, dynamic capabilities and runtime env snapshots, Origin validation, preview boundary.
- [ ] Implement LocalSettingsStore in storage package, contracts, settings routes, API/Worker wiring using shared .data/config/settings.json.
- [ ] ProductionService accepts static capabilities or async loader; worker snapshots settings per job while preserving third-argument model injection. Speech FilmInput supports env snapshot and resource-aware cache.
- [ ] Official preset catalog24Chinese+3English, preview server uses mock fetch in tests. Run covering tests and build.

## Task 2 frontend (primary)
- [ ] Browser tests first for settings save/masked reload/error preservation, voice search/select/custom ID/preview.
- [ ] App #settings route; scoped SettingsPage with model/voice tabs and empty password fields, explicit clearing.
- [ ] Shared VoicePicker in settings and project BriefFields; official preset label, searchable names+IDs, selected voice preview and custom ID.
- [ ] Missing config links to settings, same original palette, return refreshes capabilities.

## Task 3 validation
- [ ] Build/typecheck/unit/affected integration/Chrome desktop+mobile; screenshots; independent review.
- [ ] No paid calls, no public deploy, no commits; preserve existing changes.
