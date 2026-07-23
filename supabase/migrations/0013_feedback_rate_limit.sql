-- FR-FEEDBACK: the feedback endpoint accepts inserts from anon + authenticated
-- with no rate limiting at all. Store the submitter's IP so the server action
-- can cap submissions per IP per hour (see submitFeedback in
-- src/app/feedback-actions.ts) — the count query runs via the service-role
-- client, since regular callers have no select policy on this table.
alter table public.feedback add column ip text;
