const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Visit = require('../models/Visit');
const Message = require('../models/Message');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');

// "Today" is measured in this timezone (Zambia = Africa/Lusaka). Override with ANALYTICS_TZ in .env
const TZ = process.env.ANALYTICS_TZ || 'Africa/Lusaka';
const DAY_MS = 24 * 60 * 60 * 1000;

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

// YYYY-MM-DD for a Date, as seen in the analytics timezone
const dayKey = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: TZ });

// The last N day keys, oldest -> newest (the last one is today)
const lastDayKeys = (n) => {
  const keys = [];
  for (let i = n - 1; i >= 0; i--) {
    const k = dayKey(Date.now() - i * DAY_MS);
    if (!keys.includes(k)) keys.push(k);
  }
  return keys;
};

const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pingdom|uptime|monitor|preview|facebookexternalhit|whatsapp|curl|wget|python-requests|axios|postman/i;

const parseUA = (ua = '') => {
  let device = 'Desktop';
  if (/ipad|tablet|kindle|silk|(android(?!.*mobile))/i.test(ua)) device = 'Tablet';
  else if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) device = 'Mobile';

  let browser = 'Other';
  if (/edg(e|a|ios)?\//i.test(ua)) browser = 'Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua)) browser = 'Safari';

  let os = 'Other';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/mac os x|macintosh/i.test(ua)) os = 'macOS';
  else if (/cros/i.test(ua)) os = 'ChromeOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  return { device, browser, os };
};

// Best-effort country: use a CDN header if one exists, otherwise guess from the browser's timezone
const TZ_COUNTRY = {
  'Africa/Lusaka': 'ZM', 'Africa/Harare': 'ZW', 'Africa/Johannesburg': 'ZA', 'Africa/Nairobi': 'KE',
  'Africa/Lagos': 'NG', 'Africa/Accra': 'GH', 'Africa/Cairo': 'EG', 'Africa/Dar_es_Salaam': 'TZ',
  'Africa/Kampala': 'UG', 'Africa/Kinshasa': 'CD', 'Africa/Lubumbashi': 'CD', 'Africa/Maputo': 'MZ',
  'Africa/Gaborone': 'BW', 'Africa/Windhoek': 'NA', 'Africa/Luanda': 'AO', 'Africa/Blantyre': 'MW',
  'Africa/Addis_Ababa': 'ET', 'Africa/Kigali': 'RW', 'Africa/Casablanca': 'MA', 'Africa/Algiers': 'DZ',
  'Africa/Tunis': 'TN', 'Africa/Abidjan': 'CI', 'Africa/Dakar': 'SN', 'Africa/Douala': 'CM',
  'Africa/Bujumbura': 'BI', 'Africa/Mbabazane': 'ZW', 'Africa/Maseru': 'LS', 'Africa/Mbabane': 'SZ',
  'Europe/London': 'GB', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL', 'America/New_York': 'US', 'America/Chicago': 'US',
  'America/Los_Angeles': 'US', 'America/Denver': 'US', 'America/Toronto': 'CA', 'Asia/Dubai': 'AE',
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Shanghai': 'CN', 'Asia/Singapore': 'SG',
  'Asia/Tokyo': 'JP', 'Australia/Sydney': 'AU',
};

const getCountry = (req, timezone) => {
  const h = req.headers;
  const fromHeader = h['cf-ipcountry'] || h['x-vercel-ip-country'] || h['cloudfront-viewer-country'] || h['x-country-code'];
  if (fromHeader && /^[A-Za-z]{2}$/.test(fromHeader) && fromHeader.toUpperCase() !== 'XX') return fromHeader.toUpperCase();
  return TZ_COUNTRY[timezone] || '';
};

const hostOf = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
};

// Tiny in-memory rate limiter so nobody can flood the collector (per IP, per minute)
const hits = new Map();
const rateLimit = (max) => (req, res, next) => {
  const now = Date.now();
  const rec = hits.get(req.ip);
  if (!rec || now - rec.start > 60000) hits.set(req.ip, { start: now, n: 1 });
  else if (++rec.n > max) return res.status(429).json({ error: 'Too many requests' });
  next();
};
setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (now - v.start > 60000) hits.delete(k); }, 5 * 60000).unref();

const clip = (v, max) => String(v == null ? '' : v).slice(0, max);
const ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

/* ------------------------------------------------------------------ */
/* PUBLIC: called by the website                                       */
/* ------------------------------------------------------------------ */

// POST /api/analytics/visit  -> records one page view, returns its id
router.post('/visit', rateLimit(120), async (req, res) => {
  try {
    const ua = req.headers['user-agent'] || '';
    if (!ua || BOT_RE.test(ua)) return res.json({ id: null, ignored: true });

    const { visitorId, sessionId, isNew, path, referrer, timezone, language } = req.body || {};
    if (!ID_RE.test(String(visitorId)) || !ID_RE.test(String(sessionId))) {
      return res.status(400).json({ error: 'Invalid visitor data' });
    }

    const ref = hostOf(referrer);
    const ownHost = hostOf(req.headers.origin || '');
    const tz = clip(timezone, 60);

    const visit = await Visit.create({
      visitorId,
      sessionId,
      newVisitor: !!isNew,
      path: clip(path || '/', 200).split('?')[0].split('#')[0] || '/',
      referrerHost: ref && ref !== ownHost ? clip(ref, 120) : '',
      ...parseUA(ua),
      country: getCountry(req, tz),
      timezone: tz,
      language: clip(language, 20),
    });

    res.json({ id: visit._id });
  } catch (err) {
    console.error('Analytics visit error:', err.message);
    res.status(500).json({ error: 'Could not record visit' });
  }
});

// POST /api/analytics/ping  -> updates time-on-page and scroll depth for a page view
router.post('/ping', rateLimit(240), async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const seconds = Math.max(0, Math.min(Number(req.body.seconds) || 0, 4 * 3600));
    const scroll = Math.max(0, Math.min(Number(req.body.scroll) || 0, 100));

    await Visit.updateOne({ _id: id }, { $max: { duration: Math.round(seconds), maxScroll: Math.round(scroll) } });
    await Visit.updateOne(
      { _id: id, engaged: false, $or: [{ duration: { $gte: 10 } }, { maxScroll: { $gte: 50 } }] },
      { $set: { engaged: true } }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not update visit' });
  }
});

/* ------------------------------------------------------------------ */
/* ADMIN: called by the admin panel                                    */
/* ------------------------------------------------------------------ */

// GET /api/analytics/summary?days=14
router.get('/summary', async (req, res) => {
  try {
    const days = Math.max(1, Math.min(parseInt(req.query.days, 10) || 14, 90));
    const keys = lastDayKeys(days);
    const today = keys[keys.length - 1];
    const yesterday = dayKey(Date.now() - DAY_MS);
    const since = new Date(Date.now() - (days + 1) * DAY_MS);

    const topN = (field, n = 8) => [
      { $group: { _id: field, views: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
      { $project: { _id: 0, name: '$_id', views: 1, visitors: { $size: '$visitors' } } },
      { $sort: { views: -1 } },
      { $limit: n },
    ];

    const [agg] = await Visit.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $addFields: {
          day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TZ } },
          hour: { $hour: { date: '$createdAt', timezone: TZ } },
        },
      },
      { $match: { day: { $in: keys } } },
      {
        $facet: {
          daily: [
            {
              $group: {
                _id: '$day',
                views: { $sum: 1 },
                visitors: { $addToSet: '$visitorId' },
                sessions: { $addToSet: '$sessionId' },
                seconds: { $sum: '$duration' },
                engaged: { $sum: { $cond: ['$engaged', 1, 0] } },
                newVisitors: { $sum: { $cond: ['$newVisitor', 1, 0] } },
              },
            },
            {
              $project: {
                _id: 0, date: '$_id', views: 1, seconds: 1, engaged: 1, newVisitors: 1,
                visitors: { $size: '$visitors' }, sessions: { $size: '$sessions' },
              },
            },
          ],
          hourly: [
            { $match: { day: today } },
            { $group: { _id: '$hour', views: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
            { $project: { _id: 0, hour: '$_id', views: 1, visitors: { $size: '$visitors' } } },
          ],
          pages: [
            {
              $group: {
                _id: '$path',
                views: { $sum: 1 },
                visitors: { $addToSet: '$visitorId' },
                seconds: { $sum: '$duration' },
              },
            },
            {
              $project: {
                _id: 0, name: '$_id', views: 1, visitors: { $size: '$visitors' },
                avgSeconds: { $cond: [{ $gt: ['$views', 0] }, { $round: [{ $divide: ['$seconds', '$views'] }, 0] }, 0] },
              },
            },
            { $sort: { views: -1 } },
            { $limit: 8 },
          ],
          devices: topN('$device', 5),
          browsers: topN('$browser', 6),
          systems: topN('$os', 6),
          countries: topN({ $ifNull: ['$country', ''] }, 8),
          referrers: topN('$referrerHost', 8),
          newVsReturning: [{ $group: { _id: '$newVisitor', visitors: { $addToSet: '$visitorId' } } }, { $project: { _id: 0, isNew: '$_id', visitors: { $size: '$visitors' } } }],
          totals: [
            {
              $group: {
                _id: null,
                views: { $sum: 1 },
                visitors: { $addToSet: '$visitorId' },
                sessions: { $addToSet: '$sessionId' },
                seconds: { $sum: '$duration' },
                engaged: { $sum: { $cond: ['$engaged', 1, 0] } },
              },
            },
            { $project: { _id: 0, views: 1, seconds: 1, engaged: 1, visitors: { $size: '$visitors' }, sessions: { $size: '$sessions' } } },
          ],
        },
      },
    ]);

    // Messages & newsletter sign-ups per day (same timezone/day keys)
    const perDay = (Model) =>
      Model.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TZ } }, n: { $sum: 1 } } },
      ]);
    const [msgDays, subDays, unreadMessages, totalMessages, totalSubscribers] = await Promise.all([
      Message.aggregate([
        { $match: { createdAt: { $gte: since }, type: 'contact' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TZ } }, n: { $sum: 1 } } },
      ]),
      perDay(NewsletterSubscriber),
      Message.countDocuments({ isRead: false }),
      Message.countDocuments({ type: 'contact' }),
      NewsletterSubscriber.countDocuments(),
    ]);
    const msgMap = Object.fromEntries(msgDays.map((d) => [d._id, d.n]));
    const subMap = Object.fromEntries(subDays.map((d) => [d._id, d.n]));
    const dailyMap = Object.fromEntries(agg.daily.map((d) => [d.date, d]));

    // Always return every day in the range (zeros where nothing happened) so graphs have no gaps
    const daily = keys.map((k) => {
      const d = dailyMap[k] || {};
      return {
        date: k,
        views: d.views || 0,
        visitors: d.visitors || 0,
        sessions: d.sessions || 0,
        newVisitors: d.newVisitors || 0,
        messages: msgMap[k] || 0,
        subscribers: subMap[k] || 0,
        avgSeconds: d.sessions ? Math.round((d.seconds || 0) / d.sessions) : 0,
      };
    });

    const hourlyMap = Object.fromEntries(agg.hourly.map((h) => [h.hour, h]));
    const hourly = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      views: (hourlyMap[h] || {}).views || 0,
      visitors: (hourlyMap[h] || {}).visitors || 0,
    }));

    const t = daily[daily.length - 1];
    const y = daily.find((d) => d.date === yesterday) || { views: 0, visitors: 0, messages: 0 };
    const totals = agg.totals[0] || { views: 0, visitors: 0, sessions: 0, seconds: 0, engaged: 0 };
    const nvr = Object.fromEntries(agg.newVsReturning.map((r) => [r.isNew ? 'new' : 'returning', r.visitors]));

    res.json({
      timezone: TZ,
      days,
      today: {
        date: today,
        views: t.views,
        visitors: t.visitors,
        sessions: t.sessions,
        avgSeconds: t.avgSeconds,
        messages: t.messages,
        subscribers: t.subscribers,
      },
      yesterday: { views: y.views, visitors: y.visitors, messages: y.messages },
      period: {
        views: totals.views,
        visitors: totals.visitors,
        sessions: totals.sessions,
        avgSeconds: totals.sessions ? Math.round(totals.seconds / totals.sessions) : 0,
        engagementRate: totals.views ? Math.round((totals.engaged / totals.views) * 100) : 0,
        messages: daily.reduce((a, d) => a + d.messages, 0),
        subscribers: daily.reduce((a, d) => a + d.subscribers, 0),
      },
      daily,
      hourly,
      topPages: agg.pages,
      devices: agg.devices,
      browsers: agg.browsers,
      systems: agg.systems,
      countries: agg.countries.map((c) => ({ ...c, name: c.name || 'Unknown' })),
      referrers: agg.referrers.map((r) => ({ ...r, name: r.name || 'Direct / none' })),
      visitorTypes: { new: nvr.new || 0, returning: nvr.returning || 0 },
      inbox: { unread: unreadMessages, totalMessages, totalSubscribers },
    });
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ error: 'Failed to build analytics summary' });
  }
});

// GET /api/analytics/recent?limit=25  -> the latest individual visits ("their details")
router.get('/recent', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 25, 100));
    const rows = await Visit.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('path device browser os country timezone referrerHost duration maxScroll engaged newVisitor createdAt');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent visits' });
  }
});

module.exports = router;
