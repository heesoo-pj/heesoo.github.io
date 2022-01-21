;(function($, doc) {
  var laterActiveClass= 'active';

  var layerAccessibility = function($this) {
    var $targetLayer = $('#' + $this.attr('aria-controls'));
    var $layerCloseBtn = $targetLayer.find('*[aria-label="닫기"]');
    var $layerObjTabbable = $targetLayer.find('button, input:not([type="hidden"]), select, iframe, textarea, [href], [tabindex]:not([tabindex="-1"])');
    var $layerObjTabbableFirst = $layerObjTabbable && $layerObjTabbable.first();
    var $layerObjTabbableLast = $layerObjTabbable && $layerObjTabbable.last();
    var isTab = function(e) {
      return (e.keyCode || e.which) === 9;
    };

    var layerClose = function() { // 레이어 닫기 동작
      setTimeout(function() {
        $this.focus();
      }, 0);
      $(document).off('keydown.lp_keydown');
    };

    var focusLayer = function() {
      setTimeout(function() {
        $layerObjTabbableFirst.focus();
      }, 0);
    };

    var keyBoardTabTrap = function() { // 키보드 이용시 tabTrap
      $layerObjTabbableFirst.on('keydown', function(event) {
        if (event.shiftKey && isTab(event)) {
          event.preventDefault();
          $layerObjTabbableLast.focus();
        }
      });

      $layerObjTabbableLast.on('keydown', function(event) {
        if (!event.shiftKey && isTab(event)) {
          event.preventDefault();
          $layerObjTabbableFirst.focus();
        }
      });
    };

    var checkEsc = function(e) { // esc 닫기 지원
      var keyType = e.keyCode || e.which;

      if (keyType === 27 && $targetLayer.hasClass(laterActiveClass)) {
        layerClose();
        $layerCloseBtn.trigger('click');
      }
    };

    var init = function() {
      keyBoardTabTrap();
      focusLayer();
      $layerCloseBtn.on('click', layerClose);
      $(document).on('keydown.layer_keydown', function(event) {
        checkEsc(event);
      });
    };

    init();
  };

  $(doc)
    .on('click', '.layerAlertButton', function() {
      var $alertButton = $(this);
      var $targetLayer = $('.layerAlert').filter(function() {
        return $(this).attr('id') === $alertButton.attr('aria-controls');
      });

      if ($('.layerAlert.' + laterActiveClass).length) {
        $('.layerAlert.' + laterActiveClass).removeClass(laterActiveClass);
      }

      $targetLayer.addClass(laterActiveClass);
      layerAccessibility($alertButton);
    })
    .on('click', '.layerAlertBtn[aria-label="닫기"]', function() {
      $(this).parents('.layerAlert').removeClass(laterActiveClass).attr('aria-modal', false);
    })
    .ready(function() {
      // 찜하기 쿠폰 예시
      $('.jjimGetBtn').on('click', function() {
        $(this).parents('.layerAlert').removeClass('active').attr('aria-modal', false);
        $('.couponStep2').addClass('active');
        $('.jjimBtn').addClass('on');
        $('.favoriteToggle .jjimText').html('찜한 스토어');
      });
    });
})(jQuery, document);
