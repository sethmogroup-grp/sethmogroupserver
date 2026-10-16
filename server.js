const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const cloudinary = require('cloudinary').v2;
const accessPolicy = require('./middleware/accessPolicy');
const { verifyMailer } = require('./utils/mailer');
const { migrateLegacyUsers } = require('./utils/bootstrapUsers');

// Load Config
dotenv.config();

// Connect to Database, then upgrade any pre-RBAC admin account to Super Admin (see utils/bootstrapUsers.js)
connectDB().then(migrateLegacyUsers);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.set('trust proxy', 1); // behind Render's proxy, so req.ip is the real visitor

// =========================================
// MIDDLEWARE & CORS CONFIGURATION
// =========================================
const allowedOrigins = [
  'http://localhost:3000', // Local Frontend
  'http://localhost:3001', // Local Admin
  'https://admin.sethmogroup.com', // Live Admin Dashboard
  'https://sethmogroup.com', // Replace with your actual Live Main Website URL
  'https://www.sethmogroup.com' // Replace with your actual Live Main Website URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // Very important if you ever use cookies or secure sessions for login
}));

app.use(express.json({ limit: '100mb' })); // Support for base64 image uploads
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Basic Route to test server is running
app.get('/', (req, res) => {
  res.send('Sethmo Group API is running...');
});

/* =========================================
   ACCESS CONTROL (RBAC)
   Every /api request passes through this first. It decides, per route and HTTP method, whether the
   caller must be logged in and which permission their role needs. See middleware/accessPolicy.js.
   =========================================
*/
app.use('/api', accessPolicy);

/* =========================================
   IMPORT & REGISTER ROUTES
   =========================================
*/
app.use('/api/hero', require('./routes/heroRoutes'));
app.use('/api/about', require('./routes/aboutRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));
app.use('/api/sectors', require('./routes/sectorRoutes')); // Registered Sectors route
app.use('/api/pillars', require('./routes/pillarRoutes'));
app.use('/api/sustainability', require('./routes/sustainabilityRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/community-settings', require('./routes/communityRoutes'));
app.use('/api/careers', require('./routes/careerRoutes')); // Registered Careers route

app.use('/api/dashboard', require('./routes/dashboardRoutes')); // Dashboard route for combined data

app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/home-business', require('./routes/homeBusinessRoutes'));
app.use('/api/expertise', require('./routes/expertiseRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes')); // Website visits & engagement
app.use('/api/promises', require('./routes/promiseRoutes'));
app.use('/api/full-bleed', require('./routes/fullBleedRoutes'));
app.use('/api/news-banner', require('./routes/newsBannerRoutes'));

// Home page sections (footprint/vision/mission tabs, customer-centric, business focus, subsidiaries)
app.use('/api/footprint-tabs', require('./routes/footprintTabsRoutes'));
app.use('/api/customer-centric', require('./routes/customerCentricRoutes'));
app.use('/api/business-focus', require('./routes/businessFocusRoutes'));
app.use('/api/subsidiaries-section', require('./routes/subsidiariesSectionRoutes'));
app.use('/api/highlights', require('./routes/highlightsRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));
app.use('/api/newsletter-subscribers', require('./routes/newsletterSubscribersRoutes'));
app.use('/api/about-page', require('./routes/aboutPageRoutes'));
app.use('/api/sustainability-page', require('./routes/sustainabilityPageRoutes'));
app.use('/api/employees-page', require('./routes/employeesPageRoutes'));
app.use('/api/careers-page', require('./routes/careersPageRoutes'));
app.use('/api/agenda-banner', require('./routes/agendaBannerRoutes'));
app.use('/api/footer-settings', require('./routes/footerSettingsRoutes'));
app.use('/api/social-impact', require('./routes/socialImpactRoutes')); // Social Impact -> The Goodness Programme page

// Accounts, roles & email
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/newsletter-campaigns', require('./routes/newsletterCampaignRoutes'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  verifyMailer(); // logs whether the SMTP (Nodemailer) settings work
  
  // TEST: Check Cloudinary Connection on Startup
  cloudinary.api.ping((error, result) => {
    if (error) {
      console.error("Cloudinary Connection Failed:", error.message);
      console.log("Check your .env file for typos!");
    } else {
      console.log(`Cloudinary Connection Successful: ${result.status}`);
    }
  });
});

