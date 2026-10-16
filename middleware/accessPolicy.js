const { authenticate, requirePermission } = require('./auth');

/**
 * ONE place that decides who may call what. Mounted once in server.js as app.use('/api', accessPolicy).
 *
 * How it works
 *  - The public website only READS content (GET), so GET stays open unless a rule below says otherwise.
 *  - Every write (POST / PUT / PATCH / DELETE) needs a logged-in user whose role has the permission.
 *  - DEFAULT-DENY: a write route that matches no rule below needs `site:manage` (Super Admin only),
 *    so a route added in future is locked down until you deliberately open it here.
 *
 * Rules are checked top to bottom; the first match wins.
 *   perm: null        -> public, no login needed
 *   perm: 'self'      -> any logged-in role (the route itself may trim what each role sees)
 *   perm: '<name>'    -> logged in AND role holds that permission
 */
const READ = ['GET', 'HEAD', 'OPTIONS'];
const WRITE = ['POST', 'PUT', 'PATCH', 'DELETE'];
const ANY = [...READ, ...WRITE];

const RULES = [
  // ---- Public (the website itself) ----
  { methods: ['POST'], re: /^\/auth\/(login|forgot-password|reset-password)$/, perm: null },
  { methods: ['POST'], re: /^\/messages\/?$/, perm: null },                           // Contact Us form
  { methods: ['POST'], re: /^\/newsletter-subscribers\/?$/, perm: null },              // subscribe box
  { methods: ['GET', 'POST'], re: /^\/newsletter-subscribers\/unsubscribe\/?$/, perm: null }, // link inside emails
  { methods: ['POST'], re: /^\/analytics\/(visit|ping)$/, perm: null },                // visit tracking

  // ---- Accounts ----
  { methods: ANY, re: /^\/auth\//, perm: 'self' },
  { methods: ANY, re: /^\/users(\/|$)/, perm: 'users:manage' },

  // ---- Inbox (client emails) ----
  { methods: ['DELETE'], re: /^\/messages\//, perm: 'inbox:delete' },
  { methods: ['POST'],   re: /^\/messages\/[^/]+\/reply\/?$/, perm: 'inbox:reply' },
  { methods: ANY,        re: /^\/messages(\/|$)/, perm: 'inbox:read' },

  // ---- Newsletters ----
  { methods: ANY, re: /^\/newsletter-campaigns(\/|$)/, perm: 'newsletter:send' },
  { methods: ['GET'], re: /^\/newsletter-subscribers\/?$/, perm: 'newsletter:send' },

  // ---- Dashboard & analytics (reads) ----
  { methods: ['GET'], re: /^\/dashboard(\/|$)/, perm: 'self' }, // route trims what each role may see
  { methods: ['GET'], re: /^\/analytics(\/|$)/, perm: 'analytics:view' },

  // ---- Content writes ----
  { methods: WRITE, re: /^\/(news|news-banner|highlights)(\/|$)/, perm: 'news:manage' },
  { methods: WRITE, re: /^\/(hero|full-bleed)(\/|$)/, perm: 'media:manage' },
  { methods: WRITE, re: /^\/(community-settings|social-impact)(\/|$)/, perm: 'community:manage' },
  { methods: WRITE, re: /^\/(settings|footer-settings)(\/|$)/, perm: 'settings:manage' },
];

// Everything else that writes: Super Admin only.
const DEFAULT_WRITE_PERM = 'site:manage';

function accessPolicy(req, res, next) {
  const rule = RULES.find((r) => r.methods.includes(req.method) && r.re.test(req.path));

  let perm;
  if (rule) perm = rule.perm;
  else if (WRITE.includes(req.method)) perm = DEFAULT_WRITE_PERM;
  else perm = null; // unlisted reads are public content for the website

  if (req.method === 'OPTIONS' || perm === null) return next();

  authenticate(req, res, (err) => {
    if (err) return next(err);
    if (perm === 'self') return next();
    requirePermission(perm)(req, res, next);
  });
}

module.exports = accessPolicy;
module.exports.RULES = RULES;
