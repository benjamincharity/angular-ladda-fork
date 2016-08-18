/*! angular-ladda 0.4.1 */
/**!
 * AngularJS Ladda directive
 * @author Chungsub Kim <subicura@subicura.com>
 */

/* global Ladda */
/* exported Ladda */
(function (root, factory)
{
  'use strict';
  var Ladda;
  if (typeof exports === 'object') {
    // CommonJS module
    // Load ladda
    try { Ladda = require('ladda'); } catch (e) {}
    module.exports = factory(Ladda);
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(function (req)
    {
      // Load ladda as an optional dependency
      var id = 'ladda';
      try { Ladda = req(id); } catch (e) {}
      return factory(Ladda);
    });
  } else {
    root.Ladda = factory(root.Ladda);
  }
}(this, function (Ladda){
  'use strict';

  angular.module('angular-ladda', [])
    .provider('ladda', function () {
      var opts = {
        'style': 'zoom-out',
        'duration': 3000
      };
      return {
        setOption: function (newOpts) {
          angular.extend(opts, newOpts);
        },
        $get: function () {
          return opts;
        }
      };
    })
    .directive('ladda', ['ladda', '$window', function (laddaOption, $window) {
      return {
        restrict: 'A',
        priority: -1,
        link: function (scope, element, attrs) {

          element.addClass('ladda-button');

          if( angular.isUndefined( element.attr('data-style') ) ) {
            element.attr('data-style', laddaOption.style || 'zoom-out');
          }

          // ladda breaks childNode's event property.
          // because ladda use innerHTML instead of append node
          if(!element[0].querySelector('.ladda-label')) {

            var labelWrapper = document.createElement('span');
                labelWrapper.className = 'ladda-label';

            angular.element(labelWrapper).append(element.contents());

            element.append(labelWrapper);

          }


          //
          // Create ladda button
          var ladda = Ladda.create( element[0] );
          var timer;


          //
          // Add watch!
          scope.$watch(attrs.ladda, function(loading) {

            if( !loading && !angular.isNumber(loading) ) {

              ladda.stop();

              // When the button also have the ng-disabled directive it needs to be
              // re-evaluated since the disabled attribute is removed by the 'stop' method.
              if (attrs.ngDisabled) {
                element.attr('disabled', scope.$eval(attrs.ngDisabled));
              }

              // Clear the timer if it exists
              if( timer ) {
                $window.clearTimeout(timer);
              }

              return;
            }

            if( !ladda.isLoading() ) {

              ladda.start();

              var timerDuration = attrs.duration || laddaOption.duration;
              var start = new Date();
              var timeoutVal = Math.floor(timerDuration / 100);

              var animateUpdate = function() {
                var now = new Date();
                var timeDiff = now.getTime() - start.getTime();
                var percentage = Math.round( (timeDiff / timerDuration) * 100 );

                if( percentage <= 100 ) {
                  ladda.setProgress(percentage / 100);
                  timer = $window.setTimeout(animateUpdate, timeoutVal);
                }
              };

              animateUpdate();

            }

            if( angular.isNumber(loading) ) {
              ladda.setProgress(loading);
            }
          });
        }
      };
    }]);

    return Ladda;
}));
