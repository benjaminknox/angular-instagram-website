/*
	Visualize by TEMPLATED
	templated.co @templatedco
	Released for free under the Creative Commons Attribution 3.0 license (templated.co/license)
*/

$(function() {

	// Vars.
		var	$window = $(window),
			$body = $('body'),
			$wrapper = $('#wrapper');

	// Breakpoints.
		skel.breakpoints({
			xlarge:	'(max-width: 1680px)',
			large:	'(max-width: 1280px)',
			medium:	'(max-width: 980px)',
			small:	'(max-width: 736px)',
			xsmall:	'(max-width: 480px)'
		});

	// Disable animations/transitions until everything's loaded.
		$body.addClass('is-loading');

		$window.on('load', function() {
			var t = setTimeout(function() {
				$body.removeClass('is-loading');
			}, 1000);
		});

	// fancybox.
		$window.on('thumbnails-loaded', function(event, column) {
			var column = $('#column-' + column);
      
			$('thumbnails a.handle').click(function(event){
				event.stopPropagation();
			});
			
			$('thumbnails a').fancybox({
        helpers: {
          title : {
            type : 'float'
          }
        }
      });
		});

});

