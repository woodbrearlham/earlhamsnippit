module.exports = {
  construct: function(self, options) {
    require('./lib/routes.js')(self, options);
  }
};