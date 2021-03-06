apos.define('apostrophe-doc-type-manager', {
  extend: 'apostrophe-context',

  afterConstruct: function(self) {
    apos.docs.setManager(self.name, self);
  },

  beforeConstruct: function(self, options) {
    self.options = options;
  },

  construct: function(self, options) {

    self.name = self.options.name;

    self.getTool = function(name, options, callback) {
      var _options = _.clone(self.options);
      _.assign(_options, options);
      _options.manager = self;
      var type = self.getToolType(name);
      if (!type) {
        return false;
      }
      if (!callback) {
        return apos.create(self.getToolType(name), _options);
      }
      return apos.create(self.getToolType(name), _options, callback);
    };

    // Figure out the moog type name for a related tool such as the chooser, manager-modal
    // or editor for this type.

    self.getToolType = function(name) {
      return self.__meta.name + '-' + name;
    };

  }
});