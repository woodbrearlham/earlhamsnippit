var _ = require('@sailshq/lodash');

module.exports = {
   name: 'person',
   label: 'Person',
   pluralLabel: 'People',
      contextual: true,
  beforeConstruct: function(self, options) {
     
    options.addFilters = [
        {
          name: 'departments',
          label: 'Departments',
          multiple: true
        }
      ].concat(options.addFilters || []);
    options.arrangeFields = [
      {
        name: 'basics',
        label: 'Basics',
        fields: [ 'bio', 'published','slug', 'title' ]
      },
      {
        name: 'contact',
        label: 'Contact',
        fields: [ 'contact', '_ec-tour' ]
      }
    ].concat(options.arrangeFields || []);

    options.addFields =  [
      {
        name: 'bio',
        label: 'Bio',
        type: 'object',
        schema: [
          {
            type: 'string',
            name: 'fname',
            label: 'First Name',
            required: true
          },
          {
            type: 'string',
            name: 'lname',
            label: 'Last Name',
            required: true
          }
        ]
      },
        {
         name: 'thumbnail',
         label: 'Headshot',
         type: 'singleton',
         widgetType: 'apostrophe-images',
         options: {
           minSize: [ 300, 300 ],
           limit: [ 1 ],
           focalPoint: true
         }
       },
       {
         name: 'role',
         label: 'Role',
         type: 'string'
       },
      {
         name: 'code',
         label: 'Code',
         type: 'string',
         contextual: true
       },
       {
       	name: 'degrees',
       	label: 'Degrees',
       	type: 'array'
       },
        {
            name: '_departments',
            withType: 'departments',
            type: 'joinByOneCustom',
            showFields: [{
                forType: "Admissions",
                fields: ['customcode']
            }]
        },
        {
            name: 'customcode',
            type: 'tags',
            label: 'Custom Codes'
        },
       {
        type: 'object',
        name: 'contact',
        titleField: 'contact',
        listItemTemplate: 'people:contactItem.html',
        schema: [
          {
            type: 'string',
            name: 'phone',
            label: 'Phone'
          },
          {
            type: 'string',
            name: 'email',
            label: 'Email'
          },
          {
            type: 'string',
            name: 'office_number',
            label: 'Office Number'
          }
        ]
      },
      {
      name: '_ec-tour',
      label: 'Building',
      idField: 'buildingId',
      type: 'joinByOne',
      withType: 'ec-tour',
     filters: {
        // Fetch just enough information
          projection: {
              title: 1,
              slug: 1
          }
        }
     },
     {
		  name: '_departments',
		  label: 'Department',
		  idsField: 'departmentsId',
	  	withType: 'departments',
	  	type: 'joinByArray',
	  	filters: {
	    // Fetch just enough information
	    projection: {
	      title: 1,
	      slug: 1,
	      tags: 1
	    }
	  }
     },
     {
       name: 'description',
       label: 'Description',
       type: 'string',
       textarea: true
     }
   ].concat(options.addFields || []);
    self.beforeSave = function(req, piece, options, callback){
     
     
       piece.title = piece.bio.fname+" "+piece.bio.lname; // is unique, but not a permanent solution
        _.each(piece._departments, function(dept){
        console.log(piece.showCode, dept.title.toLowerCase());

            if(dept.title.toLowerCase() == "admissions"){
              piece.code.contextual = 'false';
            }
          });
       return callback();
     };
     self.beforeUpdate = function(req, piece, options, callback){
      

     piece.title = piece.bio.fname+" "+piece.bio.lname; // is unique, but not a permanent solution
      _.each(piece._departments, function(dept){
        console.log(piece.showCode, dept.title.toLowerCase());

            if(dept.title.toLowerCase() == "admissions"){
              piece.code.contextual = 'false';
            }
          });
       return callback();
     };
 },
 construct: function(self, options) {
  console.log(self.composeFilters());
  self.enableSlug = function($title, $slug, title, slug) {
      if (!$title.length || !$slug.length) {
        return;
      }
      // Watch the title for changes, update the slug - but only if
      // the slug was in sync with the title to start with
      var originalTitle = $title.val();
      var currentSlug = $slug.val();
      var components = currentSlug.split('/');
      var currentSlugTitle = components.pop();
      var prefix = '';
      if ($slug.data('prefix')) {
        prefix = $slug.data('prefix') + '-';
      }
      if ((originalTitle === '') || (currentSlugTitle === apos.utils.slugify(prefix + originalTitle))) {
        $title.on('textchange', function(e) {
          $slug.val($slug.val().replace(/[^/]*$/, apos.utils.slugify(prefix + $title.val())));
        });
      }
    };
    
  }
};
