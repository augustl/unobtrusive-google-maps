/*

  Copyright (c) 2009 August Lilleaas, http://august.lilleaas.net

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  

*/
(function($){
  // Handles the loading of the Google Maps scripts
  var GoogleMapsScripts = {
    whenLoaded: function(callback){
      if (this.isLoaded) {
        callback.call()
      } else {
        // Without the callback, we get a nasty document.write which we don't want. Pick
        // any global function. parseInt works.
        $.getScript("http://maps.google.com/maps/api/js?sensor=false&callback=parseInt");
        this.monitorScriptLoading(callback)
      }
    },
    
    // The reason that the google maps callback isn't used is that we want to persist our
    // own local callback from the UnobtrusiveGoogleMap instance.
    monitorScriptLoading: function(callback){
      if (window["google"] && window["google"]["maps"] && window["google"]["maps"]["LatLng"]) {
        this.isLoaded = true;
        callback();
      } else {
        setTimeout(function() { GoogleMapsScripts.monitorScriptLoading(callback) }, 100)
      }
    }
  }
  
  var UnobtrusiveGoogleMap = function(targetElement){
    var self = this;
    
    this.targetElement = $(targetElement);
    this.targetElement.click(function(){
      self.loadInteractiveMap();
      return false;
    });
  }
  
  UnobtrusiveGoogleMap.prototype = {
    loadInteractiveMap: function(){
      var self = this;
      
      this.options = this.getOptionsFromQueryParameters();
      GoogleMapsScripts.whenLoaded(function(){
        self.loadMap();
      })
    },
    
    getOptionsFromQueryParameters: function(){
      var src = this.targetElement.attr("src");
      var options = {}
      var queryParameters = {};
      $.each(/\?(.+)/.exec(src)[1].split("&"), function(i, x) {
        var r = x.split("="); queryParameters[r[0]] = r[1];
      });
      
      options.zoom = parseInt(queryParameters["zoom"]);

      var sizes = queryParameters["size"].split("x");
      options.width = parseInt(sizes[0]);
      options.height = parseInt(sizes[1]);

      var latLong = queryParameters["center"].split(",");
      options.latitude = parseFloat(latLong[0]);
      options.longitude = parseFloat(latLong[1]);
      
      return options;
    },
    
    loadMap: function(){
      var newTarget = $(document.createElement("div"));
      newTarget.css({width: this.options.width, height: this.options.height});
      this.targetElement.replaceWith(newTarget)
      
      var point = new google.maps.LatLng(this.options.latitude, this.options.longitude);
      var map = new google.maps.Map(newTarget[0], {
        zoom: this.options.zoom, center: point,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      new google.maps.Marker({position: point, map: map });
    },
  }
  
  // Hooks the click event that loads a interactive map. The element(s)
  // you are refering to has to be the actual <img /> tags.
  // 
  //   $("img.google_map").unobtrusiveGoogleMap();
  $.fn.unobtrusiveGoogleMaps = function(){
    this.each(function(i, element) { new UnobtrusiveGoogleMap(element) });
  }
})(jQuery);