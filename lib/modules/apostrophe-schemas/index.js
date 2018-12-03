// This module provides schemas, a flexible and fast way to create new data types
// by specifying the fields that should make them up. Schemas power
// [apostrophe-pieces](../apostrophe-pieces/index.html),
// [apostrophe-widgets](../apostrophe-widgets/index.html), custom field
// types in page settings for [apostrophe-custom-pages](../apostrophe-custom-pages/index.html)
// and more.
//
// A schema is simply an array of "plain old objects." Each object describes one field in the schema
// via `type`, `name`, `label` and other properties.
//
// See the [schema guide](../../tutorials/getting-started/schema-guide.html) for a complete
// overview and list of schema field types. The methods documented here on this page are most often
// used when you choose to work independently with schemas, such as in a custom project
// that requires forms.

var joinr = require('joinr');
var _ = require('@sailshq/lodash');
var async = require('async');
var moment = require('moment');
var tinycolor = require('tinycolor2');

module.exports = {
  construct: function (self, options) {

    function joinFilterLaunder(v) {
      if (Array.isArray(v)) {
        return self.apos.launder.ids(v);
      } else if ((typeof (v) === 'string') && (v.length)) {
        return [self.apos.launder.id(v)];
      } else if (v === 'none') {
        return 'none';
      }
      return undefined;
    };
    
    self.addFieldType({
      name: 'joinByOneCustom',
      converters: {
        string: function (req, data, name, object, field, callback) {
          var manager = self.apos.docs.getManager(field.withType);
          if (!manager) {
            return callback(new Error('join with type ' + field.withType + ' unrecognized'));
          }
          var titleOrId = self.apos.launder.string(data[name]);
          var criteria = {
            $or: [{
              titleSortified: self.apos.utils.sortify(titleOrId)
            }, {
              _id: titleOrId
            }]
          };
          return manager.find(req, criteria, {
            _id: 1
          }).sort(false).joins(false).published(null).toObject(function (err, result) {
            if (err) {
              return callback(err);
            }
            if (result) {
              object[field.idField] = result._id;
            } else {
              delete object[field.idField];
            }
            return callback(null);
          });
        },
        form: function (req, data, name, object, field, callback) {
          object[field.idField] = self.apos.launder.id(data[field.idField]);
          return setImmediate(callback);
        }
      },
      bless: function (req, field) {
        self.apos.utils.bless(req, _.omit(field, 'hints'), 'join');
      },
      join: function (req, field, objects, options, callback) {
        return self.joinDriver(req, joinr.byOne, false, objects, field.idField, undefined, field.name, options, callback);
      },
      addFilter: function (field, cursor) {
        // for joinByOne only the "OR" case makes sense
        cursor.addFilter(field.name, {
          finalize: function () {
            if (!self.cursorFilterInterested(cursor, field.name)) {
              return;
            }
            var value = cursor.get(field.name);
            var criteria = {};
            // Even programmers appreciate shortcuts, so it's not enough that the
            // sanitizer (which doesn't apply to programmatic use) accepts these
            if (Array.isArray(value)) {
              criteria[field.idField] = {
                $in: value
              };
            } else if (value === 'none') {
              criteria.$or = [];
              var clause = {};
              clause[field.idField] = null;
              criteria.$or.push(clause);
              clause = {};
              clause[field.idField] = {
                $exists: 0
              };
              criteria.$or.push(clause);
            } else {
              criteria[field.idField] = value;
            }
            cursor.and(criteria);
          },
          choices: self.joinFilterChoices(field, cursor, '_id'),
          safeFor: 'manage',
          launder: joinFilterLaunder
        });

        self.addJoinSlugFilter(field, cursor, '');
      },
      validate: function (field, options, warn, fail) {
        if (!field.name.match(/^_/)) {
          warn('Name of join field does not start with _. This is permitted for bc but it will fill your database with duplicate outdated data. Please fix it.');
        }
        if (!field.idField) {
          if (field.idsField) {
            fail('joinByOne takes idField, not idsField. You can also omit it, in which case a reasonable value is supplied.');
          }
          // Supply reasonable value
          field.idField = field.name.replace(/^_/, '') + 'Id';
        }
        if (!field.withType) {
          // Try to supply reasonable value based on join name
          var withType = field.name.replace(/^_/, '');
          if (!_.find(self.apos.docs.managers, {
              name: withType
            })) {
            fail('withType property is missing. Hint: it must match the "name" property of a doc type. If you are defining only one join, you can omit withType and give your join the same name as the other type, with a leading _.');
          }
          field.withType = withType;
        }
        if (Array.isArray(field.withType)) {
          _.each(field.withType, function (type) {
            if (!_.find(self.apos.docs.managers, {
                name: type
              })) {
              fail('withType property, ' + type + ', does not match the "name" property of any doc type. Hint: this is not the same thing as a module name. Usually singular.');
            }
          });
        } else {
          if (!_.find(self.apos.docs.managers, {
              name: field.withType
            })) {
            fail('withType property, ' + field.withType + ', does not match the "name" property of any doc type. Hint: this is not the same thing as a module name. Usually singular.');
          }
        }
      }
    });


  }
};