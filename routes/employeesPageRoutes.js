const createSingletonRouter = require('./singletonRouter');
module.exports = createSingletonRouter({
  Model: require('../models/EmployeesPage'),
  fields: [
    'pageTitle', 'heroImage',
    'inspiredHeading', 'inspiredBody', 'circleLeftLabel', 'circleRightLabel',
    'diverseHeading', 'diverseBody', 'hubLogo', 'subsidiaries',
    'psHeading', 'psIntro1', 'psIntro2', 'psBanner', 'pillars', 'divCards',
    'interviewHeading', 'interviewSubtitle', 'interviewButtonText', 'interviewButtonUrl',
    'interviewSpeed', 'interviews',
  ],
  folder: 'employees_page',
});
