$(window).scroll(scrollFunc);

scrollFunc.apply(window);

function scrollFunc(e) {
  var $window = $(this),
      $body = $('body'),
      $fader,
      scrollTop = $window.scrollTop(),
      fade;

  if(scrollTop <= 10) {
    $('#wrapper').addClass('top');
  } else {
    $('#wrapper').removeClass('top');
  }
  
  fade = calculateFade();
  $fader = $body.find('.fader');
  if(fade) {
    if($fader.length === 0) {
      $fader = $body.prepend('<div class="fader"></div').find('.fader');
    }
    $fader.css('opacity', fade);
  } else {
    $fader.remove();
  }
  
  // if($('#articles').length > 0 && scrollTop + $window.height() >= $('#articles').offset().top) {
  //   $body.css('background', 'rgba(0,0,0,' + calculateFade() + ')');
  //       .addClass('focus-on-articles');
  //   // .css('background', '#000');
  // } else {
  //   $body.css('background', '#000')
  //       .removeClass('focus-on-articles');
  //   // .css('background', '');
  // }
}

function calculateFade() {
  var $articles = $('#articles'),
      $window = $(window),
      bottom, 
      scrollPosition,
      top;
   
  
  if($articles.length === 0) return undefined;
  
  scrollPosition = $window.scrollTop() + $window.height();
  top = $articles.offset().top;
  
  if(scrollPosition < top) return undefined; 
  
  bottom = top + 500;
  
  opacity = (scrollPosition - top)/(bottom - top);
  
  if(opacity > 1) return 1
  
  return opacity;
}