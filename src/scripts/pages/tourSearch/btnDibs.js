;(function($, win, doc) {
  $.extend($.fn, {
    dibs: function(e) {
      e.preventDefault();

      $(this).toggleClass('active');
    }
  });

  $(doc).on('click', '.btnDibs', function(event) {
    $(this).dibs(event);
  });
})(jQuery, window, document);
