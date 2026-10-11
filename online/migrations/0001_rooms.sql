CREATE TABLE rooms (
 code TEXT PRIMARY KEY CHECK(length(code)=6),
 created INTEGER NOT NULL,
 expires INTEGER NOT NULL,
 word_version TEXT NOT NULL,
 target TEXT NOT NULL,
 length INTEGER NOT NULL CHECK(length BETWEEN 4 AND 7),
 host_hash TEXT NOT NULL UNIQUE,
 guest_hash TEXT UNIQUE,
 host_state TEXT NOT NULL DEFAULT '{"revision":0,"guesses":[],"status":"playing"}',
 guest_state TEXT NOT NULL DEFAULT '{"revision":0,"guesses":[],"status":"playing"}'
);
CREATE INDEX rooms_expiry ON rooms(expires);
CREATE TABLE rate_limits (
 key TEXT PRIMARY KEY,
 count INTEGER NOT NULL,
 expires INTEGER NOT NULL
);
CREATE INDEX rates_expiry ON rate_limits(expires);
