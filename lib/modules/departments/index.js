
module.exports = {
  name: 'departments',
  extend: 'apostrophe-pieces',
  label: 'Program',
  pluralLabel: 'Programs',
  contextual: true,
  beforeConstruct: function(self, options) {
    options.addFields = [
      {
        type: 'joinByOne',
        name: '_title',
        label: 'Division',
        withType: 'divisions',
        filters: {
          // Fetch just enough information
          projection: {
            title: 1,
          }
        }
      },
      {
        type: 'joinByArray',
        name: '_majors',
        label: 'Majors',
        withType: 'majors',
        filters: {
          // Fetch just enough information
          projection: {
            title: 1,
            slug: 1
          }
        }
      },
    ].concat(options.addFields || []);
    options.removeFields = [
      'departmentTitle'
    ].concat(options.removeFields || []);
    options.arrangeFields = [
      {
        name: 'Details',
        label: 'details',
        fields: [ '_title','_majors']
      }
    ].concat(options.arrangeFields || []);



  },
  construct: function(self, options) {
      self.beforeSave = function(req, piece, options, callback) {
        if(piece._title){
          piece.departmentTitle = piece._title.title;
        }
        return callback();
      };
    }
};
