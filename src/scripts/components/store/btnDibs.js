;(function($, win, doc) {
  $.extend($.fn, {
    dibs: function() {
      var active = 'active';
      var txt;
      var hasActive = $(this).hasClass(active);

      $(this).toggleClass(active);
      $(this).attr('aria-pressed', !hasActive);
      txt = hasActive ? '찜리스트에서 상품이 삭제되었습니다.' : '찜리스트에 상품이 추가되었습니다.';

      $('.storeContainer').toast({
        content: txt, // {String} 토스트 팝업 콘텐츠
        time: 3000 // {Number} 토스트 팝업 유지 시간 (default: 5000)
      });

      if ($('.jsToast:visible').length) {
        $('.storeContainer .toast').html(txt);
        return;
      }
    }
  });

  $(doc).on('click', '.btnDibs', function(e) {
    e.preventDefault();
    $(this).dibs();
  });
})(jQuery, window, document);
