$(window).scroll(scrollFunc);

scrollFunc.apply(window);

function scrollFunc(e) {
  if($(this).scrollTop() <= 10) {
    $('#wrapper').addClass('top');
   } else {
    $('#wrapper').removeClass('top');
   }
}