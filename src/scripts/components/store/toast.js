;(function($, win, doc) {
  $.fn.toast = function(opts) {
    if ($('.jsToast:visible').length) {
      return;
    }

    var toast = {};
    var options = $.extend({}, {
      content: '',
      class: '',
      time: 5000,
      autoHide: true
    }, opts);


    if ($('.jsToast:visible').length > 0) {
      return;
    }

    this.append(
      '<div class="toast jsToast ' + options.class + '">'
      + options.content
      + '</div>'
    );

    toast.element = this.find('.jsToast');

    if (options.autoHide) {
      setTimeout(function() {
        toast.element.remove();
      }, options.time);
    }

    return toast;
  };
})(jQuery, window, document);
