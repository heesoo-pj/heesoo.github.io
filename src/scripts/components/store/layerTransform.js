;(function($, doc, win) {
  $.fn.layerTransform = function(opts) {
    if (!this.length) {
      return;
    }

    var card = {};
    var isMobile = $('body').hasClass('mobile');
    var $layerAlert =$('.layerAlert');
    card.data = {};
    card.duration = 250;
    card.startPosition = '3rem';

    card.$btn = this;
    card.$pageContainer = $('.storeContainer');
    card.$layerTransform = undefined;
    card.closeSelector = '.closeCard button';
    card.closeInputSelector = '.closeCard input';

    card.opts = $.extend({}, {
      showBegin: undefined,
      showComplete: undefined,
      hideBegin: undefined,
      hideComplete: undefined,
      btnSelector: null
    }, opts);

    card.layerAccessibility = function($this) {
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

        if (keyType === 27 && $targetLayer.parents('.layerTransformWrapper').hasClass(card.visibleClass)) {
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

    card.setBtnSelector = function() {
      if (card.$btn[0] === document) {
        return card.btnSelector = card.opts.btnSelector;
      }

      if (card.$btn[0].classList) {
        return card.btnSelector = '.' + card.$btn[0].classList[0];
      } else {
        // For IE9
        return card.btnSelector = '.' + card.$btn[0].className.split(' ')[0];
      }
    };

    card.backScroll = {
      prevent: function() {
        var scrollTop = $(win).scrollTop();
        $('body').css({
          'top': -(scrollTop),
          'position': 'fixed',
          'overflow': 'hidden',
          'width': '100%'
        });
      },
      allow: function() {
        var bodyTop = $('body').css('top').replace('px', '');
        $('body').css({
          'top': 0,
          'position': 'relative',
          'overflow': 'auto',
          'width': '100%'
        });
        $(win).scrollTop(-1 * (bodyTop));
      }
    };

    card.resetLayer = function() {
      if ($('.layerTransformWrapper.' + card.visibleClass).length) {
        $('.layerTransformWrapper.' + card.visibleClass)
          .removeClass(card.visibleClass)
          .find('.layerTransformContainer')
          .removeClass('on');
      }
    };

    card.content = {
      show: function() {
        if (!$(card.data.contentSelector).length) {
          console.info('target-content is not found.');
        }

        $(card.data.contentSelector).addClass('on');
        if (isMobile || $(card.data.contentSelector).parents('.layerTransformBundle').hasClass('alignCenter')) {
          card.backScroll.prevent();
        }
      },
      hide: function() {
        $(card.data.contentSelector).removeClass('on');
        if (isMobile || $(card.data.contentSelector).parents('.layerTransformBundle').hasClass('alignCenter')) {
          card.backScroll.allow();
        }
      }
    };

    card.visibleArgs = {
      opacity: [1, 0],
      translateY: [0, card.startPosition]
    };
    card.visibleOpts = {
      display: '',
      duration: card.duration,
      begin: function() {
        card.init();
        card.resetLayer();

        card.$layerTransform = $(card.data.contentSelector).parents('.layerTransformWrapper');
        if (!card.$layerTransform.length) {
          console.info('bottom-card-element is not found.');
          return;
        }

        card.content.show();
        card.$layerTransform.addClass(card.visibleClass.join(' '));

        if (typeof card.opts.showBegin === 'function') {
          card.opts.showBegin(card);
        }
      },
      complete: function() {
        if (typeof card.opts.showComplete === 'function') {
          card.opts.showComplete(card);
        }
      }
    };

    card.hiddenArgs = {
      opacity: card.visibleArgs.opacity.slice().reverse(),
      translateY: card.visibleArgs.translateY.slice().reverse()
    };
    card.hiddenOpts = {
      duration: card.duration,
      begin: function() {
        if (typeof card.opts.hideBegin === 'function') {
          card.opts.hideBegin(card);
        }
      },
      complete: function() {
        card.$layerTransform.removeClass(card.visibleClass.join(' '));
        card.content.hide();

        $(card.data.contentSelector).css({
          display: '',
          transform: ''
        });

        if (typeof card.opts.hideComplete === 'function') {
          card.opts.hideComplete(card);
        }
      }
    };

    card.init = function() {
      card.visibleClass = ['visible'];
    };

    card.visible = function() {
      card.layerAccessibility($(card.btnSelected));

      if (isMobile) {
        $(card.data.contentSelector).velocity(card.visibleArgs, card.visibleOpts);

        return;
      }

      card.visibleOpts.begin();
      card.visibleOpts.complete();
    };

    card.hidden = function() {
      if (isMobile) {
        $(card.data.contentSelector).velocity(card.hiddenArgs, card.hiddenOpts);

        return;
      }

      card.hiddenOpts.begin();
      card.hiddenOpts.complete();
    };

    card.show = function(_this) {
      card.btnSelected = _this;
      card.data.contentSelector = '#' + _this.getAttribute('aria-controls');
      $layerAlert.removeClass('active');
      card.visible();
    };

    card.hide = function() {
      card.hidden();
    };

    card.setBtnSelector();
    card.$pageContainer.on('click', card.btnSelector, function(e) {
      e.preventDefault();

      card.show(this);
      card.$layerTransform
        .find(card.closeSelector, card.closeInputSelector)
        .off('click.cardHide')
        .on('click.cardHide', card.hide);
    });

    return card;
  };
})(jQuery, window, document);
