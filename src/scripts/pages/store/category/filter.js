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

    var search = function(e) {
      e.preventDefault();
      var searchText = $(this).val();

      if (!searchText.replace(/ /gi, '')) {
        return false;
      }

      $(this).val('');
      $(this)
        .parents('.search')
        .find('.searchList')
        .append('<li><button type="button" class="searchText">' + searchText+ '</button><button type="button" class="searchClose"></button></li>');
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

  var search = function() {
    var searchText = $('.search input[type="text"]');

    if (!searchText.val().replace(/ /gi, '')) {
      return false;
    }

    searchText
      .parents('.search')
      .find('.searchList')
      .append('<li><button type="button" class="searchText">' + searchText.val()+ '</button><button type="button" class="searchClose"></button></li>');

    searchText.val('');
  };

  $(doc)
    .on('click', '.filterBtn', function() {
      var $filterBtn = $(this);
      var $targetLayer = $('.filterBox').filter(function() {
        return $(this).attr('id') === $filterBtn.attr('aria-controls');
      });

      if ($('.filterBox.' + laterActiveClass).length) {
        $('.filterBox.' + laterActiveClass).removeClass(laterActiveClass);
      }

      if ($('body.mobile').length) {
        $('body').css('overflow', 'hidden');
      }

      $targetLayer.addClass(laterActiveClass);
      layerAccessibility($filterBtn);
    })
    .on('click', '.closeCard button[aria-label="닫기"]', function() {
      $(this).parents('.filterBox').removeClass(laterActiveClass);
      $('body').css('overflow', '');
    })
    .on('click', '.filterBox', function(e) {
      if ($(e.target).is('.filterBox')) {
        $(this).removeClass(laterActiveClass);
        $('body').css('overflow', '');
      }
    })
    .on('keydown', '.search input[type="text"]', function(e) {
      if (e.keyCode === 13) {
        e.preventDefault();
        search();
      };
    })
    .on('click', '.btnFilterSearch', function() {
      search();
    })
    .on('click', '.searchList li', function() {
      $(this).remove();
    });
})(jQuery, document);
