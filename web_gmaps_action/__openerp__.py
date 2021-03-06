# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-2009 Tiny SPRL (<http://tiny.be>). All Rights Reserved
#    Financed and Planified by Vauxoo
#    developed by: nhomar@vauxoo.com
#    developed by: oscar@vauxoo.com
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
{
    'name':"Web Action with Google Maps.",
    'category':'Hidden',
    'author': 'Vauxoo',
    'description': '''
Gmaps view:
===========

With this module we will be able to create some extra fields in our models with some specific names
and use a simple action client "Ala Message" to show in maps this information.

Retrieve this points to the model itself and see them graphically.

- It is specially usefull to manage zones and make reports see the freight project to see an
  example of usage.

To configure be sure you have an "API Key" from google.

Information: https://developers.google.com/console/help/#generatingdevkeys

And add the url key in the config file with gmaps_api_key.

TODO: write an step by step to do that.

code::

    gmaps_api_key = https://maps.googleapis.com/maps/api/js?key=YOURKEYISALONGWIERDCHARACTERS&sensor=true
    ''',
    'depends':[
        'web',
        'contacts',
        'web_allow_custom_root',
        'web_bootstrap3',
        'decimal_precision',
        ],
    'data':[
        'data/gmaps_data.xml',
        'res_partner_view.xml',
        'gmaps_point_view.xml',
        ],
    'demo':[
        #'web_gmaps_demo.xml'
        ],
    'js':[
        'static/src/js/gmaps.js',
        ],
    'css':[
        'static/src/css/gmaps.css'
        ],
    'qweb':[
        'static/src/xml/gmaps.xml'
        ],
}

