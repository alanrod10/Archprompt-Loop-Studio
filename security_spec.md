# Security Specification: ARCHPROMPT LOOP STUDIO

## 1. Data Invariants
- Each user's data (Prompts, PromptVersions, Techniques, Investigations, Evaluations, EngineVersions, EngineProposals, UserSettings) is strictly segregated by `ownerId == request.auth.uid`.
- Unauthenticated access is completely blocked across all collections.
- `ownerId` is immutable upon creation.
- Document IDs must conform to `isValidId()`.
- Unbounded array injections are rejected; all text fields have strict size limits (`.size() <= limit`).
- Status values must strictly match the permitted lifecycle states.

## 2. The Dirty Dozen Payloads (Targeting Firestore Rules)
1. **Unauthenticated Read/Write**: Request without `request.auth` -> `PERMISSION_DENIED`.
2. **Owner Impersonation on Create**: `incoming().ownerId = 'victim_uid'` while `request.auth.uid = 'attacker_uid'` -> `PERMISSION_DENIED`.
3. **Owner Hijack on Update**: Modifying `existing().ownerId` -> `PERMISSION_DENIED`.
4. **Cross-Tenant Document Read**: Attacker reads victim's prompt `get /prompts/{victimDoc}` -> `PERMISSION_DENIED`.
5. **Cross-Tenant Collection Scraping**: Attacker lists `/prompts` without filtering by their own `ownerId` -> `PERMISSION_DENIED`.
6. **ID Injection Attack**: Document ID with directory traversal or 10KB junk -> `PERMISSION_DENIED`.
7. **Gigabyte Payload DOS**: String field exceeding max characters (e.g., content > 100,000 chars) -> `PERMISSION_DENIED`.
8. **Invalid Status Injection**: Status set to 'super_admin_bypass' -> `PERMISSION_DENIED`.
9. **Ghost / Shadow Field Injection**: Inserting arbitrary fields `__isAdmin: true` -> `PERMISSION_DENIED`.
10. **PromptVersion Cross-Reference Tampering**: Creating a version with `ownerId != request.auth.uid` -> `PERMISSION_DENIED`.
11. **Engine Proposal Tampering**: Updating an approved proposal -> `PERMISSION_DENIED`.
12. **UserSettings Read by Another User**: Reading another user's API settings or preferences -> `PERMISSION_DENIED`.
