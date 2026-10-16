/**
 * Single source of truth for role-based access control (RBAC).
 *
 * Roles are fixed; each role is a list of permissions. The server enforces them
 * (middleware/accessPolicy.js) and sends the list to the admin panel at login so the
 * UI can hide what a user cannot use. Hiding is cosmetic - the server is what blocks.
 */
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  CONTENT_MANAGER: 'content_manager',
  SUPPORT_AGENT: 'support_agent',
};

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  content_manager: 'Content Manager',
  support_agent: 'Support Agent',
};

const ROLE_DESCRIPTIONS = {
  super_admin: 'Absolute control: all content, settings, system logs, and creating or deleting user accounts.',
  content_manager: 'News, media and community content, reading client emails and sending newsletters.',
  support_agent: 'Reading and replying to client emails and sending newsletters to subscribers.',
};

const ALL_PERMISSIONS = [
  'users:manage',      // create / edit / delete accounts, view staff ID images
  'settings:manage',   // global settings, footer & contact details
  'logs:view',         // activity log / system logs on the dashboard
  'site:manage',       // layout & pages: home sections, about, careers, sectors, sustainability...
  'news:manage',       // News & Blog feed, Press & News banner, Sethmo Highlights
  'media:manage',      // media sections: Hero (images/video) and Full-Width Banner
  'community:manage',  // Community page banner & impact
  'analytics:view',    // website visit analytics
  'inbox:read',        // read client messages, mark read / unread
  'inbox:reply',       // reply to client messages by email
  'inbox:delete',      // permanently delete messages
  'newsletter:send',   // compose & send newsletters, see subscribers
];

const ROLE_PERMISSIONS = {
  super_admin: [...ALL_PERMISSIONS],
  content_manager: [
    'news:manage',
    'media:manage',
    'community:manage',
    'analytics:view',
    'inbox:read',
    'newsletter:send',
  ],
  support_agent: [
    'inbox:read',
    'inbox:reply',
    'newsletter:send',
  ],
};

const isValidRole = (r) => Object.values(ROLES).includes(r);
const permissionsFor = (role) => ROLE_PERMISSIONS[role] || [];
const roleHas = (role, permission) => permissionsFor(role).includes(permission);

module.exports = {
  ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, ALL_PERMISSIONS, ROLE_PERMISSIONS,
  isValidRole, permissionsFor, roleHas,
};
