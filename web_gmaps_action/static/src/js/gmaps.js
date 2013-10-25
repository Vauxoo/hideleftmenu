openerp.web_gmaps_action = function (instance) {
    var _t = instance.web._t,
       _lt = instance.web._lt;
    instance.web.form.widgets.add('gmaps_sector', 'instance.web_gmaps_action.GmapsSector');
    instance.web_gmaps_action.GmapsSector = instance.web.form.FieldOne2Many.extend({

        init: function (field_manager, node) {
            this._super.apply(this, arguments);
        },

        start: function () {
            this._super.apply(this, arguments);
        },
    });

    instance.web_gmaps_action.Map = instance.web.Widget.extend({
        template: 'web_gmaps_action.Map',
        init: function(parent, action) {
            if (action.params.qweb_action_template){
                this.template = action.params.qweb_action_template
            }
            this.action = _.clone(action);
            //Take the "res_model" Field and become part of the widget.
            this.res_model = this.action.res_model; 
            //Take the "params[options]" part of Field and become part of the widget.
            this.options = this.action.params.options || {}; 
            //Take the "params[domain]" part of Field and become part of the widget.
            this.options.domain = this.action.params.domain; 
            //Take the "params[context]" part of Field and become part of the widget.
            //B care about the _.extend of underscore read the specific documentation to
            //understand why it is being used.
            this.options.context = _.extend(this.action.params.context || {}, this.action.context || {});
            this.defaults = {};
			this._super(parent);
		},
        writeArea: function () {
            Polygon = this.polygon.getPath();
            //this.elements.add_point_list(this.elements, Polygon);
            this.area = google.maps.geometry.spherical.computeArea(this.polygon.getPath());
            $("#shape_area").html(this.area + " m<sup>2</sup>");
            
            $("#paths").html("");
            for (var i = 0; i < this.path.length; ++i)
            {
                $("#paths").html($("#paths").html() + "<br />" + this.path.getAt(i)); 
            }
        },
        /**
         * Callback for marker, every point added will trigger this method.
         */
        changePoint: function(where){
        },
        addPoint: function(event, parent){
            self = this;
            parent.path.insertAt(this.path.length, event.latLng);

            var marker = new google.maps.Marker({
                position: event.latLng,
                map: this.map,
                draggable: true,
                changed: function(){self.changePoint(self)},
                animation: "BOUNCE"
            });
            point = {'gmaps_lat': marker.position.lb,
                     'gmaps_lon': marker.position.mb}
            this.elements.add_point_list(this.elements, point);
            parent.markers.push(marker);
            marker.setTitle("#" + this.path.length);

            google.maps.event.addListener(marker, 'click', function() {
                marker.setMap(null);
                var i = 0;
                for (var I = self.markers.length; i < I && self.markers[i] != marker; ++i); 
                self.markers.splice(i, 1);
                self.path.removeAt(i);
                self.writeArea();
            });
            
            google.maps.event.addListener(marker, 'dragend', function() {
                var i = 0;
                for (var I = parent.markers.length; i < I && parent.markers[i] != marker; ++i);
                parent.path.setAt(i, marker.getPosition());
                
                parent.writeArea();
            });
            this.writeArea();
        },

        startShape: function() {
            self = this;
            this.polygon.setPath(new google.maps.MVCArray([this.path]));
            this.event_click_map = google.maps.event.addListener(this.map, 'click', function(e){
                self.addPoint(e, self)
            });
        },

        endShape: function() {
            google.maps.event.removeListener(this.event_click_map);
        },

        loadMap: function(self){
            self.map, this.polygon;
            self.markers = [];
            self.path = new google.maps.MVCArray;
            self.event_click_map;

            $.fn.clicktoggle = function(a, b) {
                return this.each(function() {
                    var clicked = false;
                    $(this).click(function() {
                        if (clicked) {
                            clicked = false;
                            return b.apply(this, arguments);
                        }
                        clicked = true;
                        return a.apply(this, arguments);
                    });
                });
            };
			
            var mapCoords = new google.maps.LatLng(21.150975, -101.645336);
            var mapOptions = { 
				center: mapCoords, 
				zoom:17, 
				mapTypeId: google.maps.MapTypeId.ROADMAP 
			}
            var torender = this.$el.find('#map_canvas');

            this.map = new google.maps.Map(torender[0], mapOptions);
            
            var polygonOptions = { 
				strokeColor: "#AB0000",//color,
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: "#DFDFDE",//color,
				fillOpacity: 0.8 
			}
			this.polygon = new google.maps.Polygon(polygonOptions);
			this.polygon.setMap(this.map);

			$(".shape_b").clicktoggle(
				function () {
					$(this).addClass("btn-success");
                    $(this).text('Deactivate Map Controls');
					self.startShape();
				},
				function () {
					$(this).removeClass("btn-success");
                    $(this).text('Activate Map Controls');
					self.endShape();
				}
			);
        },

        /**
         * Load the mail.message search view
         * @param {Object} defaults ??
         */
        load_searchview: function (defaults) {
            var self = this;
            var ds_model = new instance.web.DataSetSearch(this, this.res_model);
            this.searchview = new instance.web.SearchView(this, ds_model, false, defaults || {}, false);
            this.searchview.appendTo(this.$('.oe_view_manager_view_search'))
                .then(function () { self.searchview.on('search_data', self, self.do_searchview_search); });
            if (this.searchview.has_defaults) {
                this.searchview.ready.then(this.searchview.do_search);
            }
            return this.searchview
        },
        /**
         * Get the domains, contexts and groupbys in parameter from search
         * view, then render the filtered threads.
         * @param {Array} domains
         * @param {Array} contexts
         * @param {Array} groupbys
         */
        do_searchview_search: function (domains, contexts, groupbys) {
            var self = this;
            instance.web.pyeval.eval_domains_and_contexts({
                domains: domains || [],
                contexts: contexts || [],
                group_by_seq: groupbys || []
            }).then(function (results) {
                if (self.elements) {
                    self.elements.destroy();
                }
                if (self.ListObjectRecords){
                    self.ListObjectRecords.destroy();
                }
                self.ListObjectRecords = new instance.web_gmaps_action.ListRecords(self, results); 
                self.ListObjectRecords.appendTo(self.$('.list_records_placeholder'));
                /**
                if(self.root) {
                    $('<span class="oe_mail-placeholder"/>').insertAfter(self.root.$el);
                    self.root.destroy();
                }
                */
                return true; 
            });
        },

        start: function() {
            var self = this;
			this._super.apply(this, arguments);
            //We instanciate the widget with data, see the parameter passed is "Self" to be sure
            //both objects are connected and retreive informatios from parent in the child.
            //If you dont pass the self object, then you will need to be care of a lot of not
            //necesary thing already in the framework.
            //Just adding the help windows in buttons (read dat-* on template to see how to get the
            //information to show.
            this.$('.helpbutton').popover();
            this.$('.shape_b').popover();
            this.$('.oe_section_map').fadeIn(400);
            var searchview_loaded = this.load_searchview(this.defaults);
            this.$('.oe_load_points').on('click', function(){
                if (self.elements) {
                    self.elements.destroy();
                }
                self.elements = new instance.web_gmaps_action.ListElements(self, {'res_id': self.$('.oe_input_search')[0].value});
                self.elements.appendTo(self.$('.oe_list_placeholder'));
                self.loadMap(self);
                self.$('.information').fadeOut(400);
                self.$('a.oe_load_map').addClass('disabled');
            });
        }

    });

    instance.web_gmaps_action.ListRecords = instance.web.Widget.extend({
        template: 'web_gmaps_action.ListObjectRecords',
        init: function(parent, result){
            if (parent.action.params.qweb_list_template){
                this.template = parent.action.params.qweb_list_template
            }
            this.parent = parent
            this.options = parent.options;
            this.model = parent.res_model;
            this.context = parent.options.context;
            //Wired domain to search, it doesn't matter for this PoC how get the domain the search
            //widget will do that for us.
            this.domain = result.domain 
            this.options.domain = this.domain;
            this.obj_model_search = new instance.web.DataSetSearch( this, this.model, this.domain,
                                                                    this.context);
            this._super(parent);
        },
        start: function(){
            this._super.apply(this, arguments);
            this.render_list(this, this.parent);
        },
        render_list: function(self, windows){
            //parent is the "Parent View"
            self = this;
            this.obj_model_search.read_slice(['name'], self.options) .done(function(results){
                    _.each(results, function(res){
                        $('<tr><td>'+res.name+'</td></tr>').appendTo(self.$('tbody.records_placeholder'));
                    });
                })
        }
    });

    instance.web_gmaps_action.ListElements = instance.web.Widget.extend({
        template: 'web_gmaps_action.ListElements',
        init: function(parent, res_id){
            if (res_id.res_id){
                this.res_id = res_id.res_id
            }
            if (parent.action.params.qweb_list_template){
                this.template = parent.action.params.qweb_list_template
            }
            this.parent = parent
            this.options = parent.options;
            this.model = parent.res_model;
            this.context = parent.options.context;
            //Wired domain to search, it doesn't matter for this PoC how get the domain the search
            //widget will do that for us.
            this.domain = [['model', 'ilike', this.model], ['res_id', '=', parseInt(this.res_id)]];
            this.options.domain = this.domain;
            this.obj_model_search = new instance.web.DataSetSearch( this, 'gmaps.point', this.domain,
                                                                    this.context);
            this._super(parent);
        },

        start: function(){
            this._super.apply(this, arguments);
            this.render_list(this, this.parent);
        },
        add_point_list: function(list, result){
           act = instance.web.qweb.render('Gmaps.action_buttons', {'widget': list, 'result': result}) 
           row_ = $(instance.web.qweb.render('Gmaps.data_row', {'widget': list, 'result': result, 'act': act})); 
           row_.appendTo(list.$('tbody'));
        },
        /**
         * list: Object list instanciated.
         * result: Element with data to show.
         */
        add_points_list: function(list, results){
            _.each(results, function(result){
                list.add_point_list(list, result);
            });
        },
        render_list: function(self, windows){
            //parent is the "Parent View"
            self = this;
            this.obj_model_search.read_slice(['name', 'gmaps_lat', 'gmaps_lon', 'description', 'res_id', 'sequence'], self.options)
                .done(function(results){
                self.add_points_list(self, results);
                self.$('.oe_save_btn').on('click', function(ev){
                    //The correct way to get this information is reading the object .map
                    //But the concept is only push information in the database, not amanipulate
                    //map information
                    PATHS = windows.$('#paths').text();
                    AREA = windows.$('#shape_area').text();
                    self.save_result(self, PATHS, AREA, ev.currentTarget.dataset.id, windows);
                });
                 
            });
        },

        save_result: function(parent, paths, area, id, windows){
            self = this; 
            this.ds_model = new instance.web.DataSet(self, this.model, this.options.context)
            TextToSave = '<p><b>Area  :</b><br/>' +
                         area + '</p>' +
                         '<p><b>Puntos :</b></p>' +
                         paths
            this.ds_model.write(parseInt(id),
                    {'comment': TextToSave},
                    self.options).done(function(res){
                        self.$('#cell'+id).html(TextToSave); 
                        windows.$('.oe_warning_bs3').fadeIn(400); 
                    })
        },
    });
    instance.web.client_actions.add('gmaps.example','instance.web_gmaps_action.Map');
};
