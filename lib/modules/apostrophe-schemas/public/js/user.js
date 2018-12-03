// The browser-side singleton corresponding to the [apostrophe-schemas](index.html) module.

apos.define('apostrophe-schemas', {

  construct: function (self, options) {
    self.addFieldType({
      name: 'joinByOneCustom',
      populate: function (data, name, $field, $el, field, callback) {
        var manager;
        var $fieldset = self.findFieldset($el, name);
        var chooser = $fieldset.data('aposChooser');
        var chooserGetter;
        if (!chooser) {
          if (Array.isArray(field.withType)) {
            manager = apos.docs.getManager('apostrophe-polymorphic');
            chooserGetter = _.partial(manager.getTool, 'chooser');
          } else {
            manager = apos.docs.getManager(field.withType);
            chooserGetter = _.partial(manager.getTool, 'chooser');
          }
          return chooserGetter({
            field: field,
            $el: $fieldset.find('[data-chooser]')
          }, function (err, _chooser) {
            if (err) {
              return callback(err);
            }
            chooser = _chooser;

            var choices = [];
            if (data[field.idField]) {
              choices.push({
                value: data[field.idField]
              });
            }
            chooser.set(choices);
            $fieldset.data('aposChooser', chooser);
            return callback(null);
          });
        }
      },
      convert: function (data, name, $field, $el, field, callback) {
        var $fieldset = self.findFieldset($el, name);
        var chooser = $fieldset.data('aposChooser');
        return chooser.getFinal(function (err, choices) {
          if (err) {
            return callback(err);
          }
          data[field.idField] = null;
          if (choices[0]) {
            data[field.idField] = choices[0].value;
          }
          if ((field.required) && (!data[field.idField])) {
            return callback('required');
          }
          return callback(null);
        });
      }
    });
  }
});