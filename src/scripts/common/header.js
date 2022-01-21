;(function($, doc, win) {
  var isMobile = $('body').hasClass('mobile');

  var category = {
    common: function() {
      this.$headerWrapper = $('.headerWrapper');
      this.$wrapper = $('.categoryNavigation');
      this.$list = this.$wrapper.find('ul');
      this.$btnMore = this.$wrapper.find('.btnMore');
      this.btnToggleText = ['더보기', '닫기'];
      this.class = {
        expanded: 'expanded'
      };
      this.attr = {
        ariaExpanded: 'aria-expanded'
      };
      this.backScroll = {
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

      this.moreBtn = function() {
        var isExpanded = category.$wrapper.hasClass(category.class.expanded);

        category.$btnMore.find('span').text(category.btnToggleText[+ !isExpanded]);
        category.$wrapper.toggleClass(category.class.expanded);
        category.$btnMore.attr(category.attr.ariaExpanded, !isExpanded);

        if (isMobile) {
          if (category.$wrapper.hasClass(category.class.expanded)) {
            category.backScroll.prevent();
            $('.layerCategory').css('top', category.$wrapper.offset().top + category.$wrapper.outerHeight());
          } else {
            category.backScroll.allow();
          }

          return;
        }

        category.controlTabindex.reset();

        if (isExpanded) {
          category.controlTabindex.removeFocus(category.hideList);
        } else {
          $(category.hideList[0]).find('a').focus();
        }
      };

      this.$btnMore.on('click', category.moreBtn);

      $(doc).layerTransform({
        btnSelector: '.layerTransformButton[aria-controls=storeInfo]',
        showComplete: function() {
          category.$wrapper.removeClass(category.class.expanded);
        }
      });
    },
    desktop: function() {
      this.exposureHeight = this.$wrapper.find('> div').outerHeight();
      this.attr = {
        tabindex: 'tabindex',
        dataMultiLine: 'data-multi-line'
      };

      this.hideList = [];

      this.multiLine = {
        isMultiLine: function() {
          return category.$list.outerHeight() > category.exposureHeight;
        },
        controlAttr: {
          add: function() {
            category.$wrapper.attr(category.attr.dataMultiLine, true);
          },
          remove: function() {
            category.$wrapper.removeAttr(category.attr.dataMultiLine);
          }
        }
      };

      this.controlTabindex = {
        getHideList: function(hideArr) {
          var $categoryListTop = $('.categoryList').css('paddingTop').replace(/[^0-9]/g, '');

          category.$wrapper.find('li').each(function() {
            if ($(this)[0].offsetTop > $categoryListTop) {
              hideArr.push($(this));

              return;
            }
          });
        },
        removeFocus: function(arr) {
          category.controlTabindex.getHideList(arr);
          arr.forEach(function(item) {
            $(item).find('a').attr(category.attr.tabindex, -1);
          });
        },
        reset: function() {
          category.$wrapper.find('li a[' + category.attr.tabindex + '=-1]').removeAttr(category.attr.tabindex);
        }
      };

      this.desktop.init = function() {
        category.$wrapper.find('> div > ul').removeClass('invisible');

        if (!category.multiLine.isMultiLine()) {
          return;
        }

        category.multiLine.controlAttr.add();

        if (!category.$wrapper.hasClass(category.class.expanded)) {
          category.controlTabindex.removeFocus(category.hideList);
        }
      };

      this.desktop.init();
    },
    mobile: function() {
      this.$accordionBtn = $('.layerCategory .accordion .accordionBtn');
      this.accordion = function(event, $this) {
        event.preventDefault();
        var isActive = $this.parents('li').hasClass('on');

        $this
          .attr(category.attr.ariaExpanded, !isActive)
          .find('span')
          .text('상품 ' + (isActive ? '더보기' : '닫기'))
          .parents('li')[(isActive ? 'remove' : 'add') + 'Class']('on');
      };

      this.$accordionBtn.on('click', function(e) {
        category.accordion(e, $(this));
      });
    }
  };

  var subGateway = function() {
    var $gateway = $('.gatewayWrapper');
    var gateRight = $gateway.find('.gatewayRight');
    var hasSubEl = gateRight.find('.hasSub');
    var hasSubElA = hasSubEl.find('> a');
    var activeClass = 'active';

    hasSubEl.on({
      mouseenter: function() {
        $(this).addClass(activeClass);
      },
      mouseleave: function() {
        $(this).removeClass(activeClass);
      }
    });

    hasSubElA.on('keydown', function(e) {
      if (e.keyCode === 13) {
        $(this)
          .parent()
          .toggleClass(activeClass);

        return false;
      }
    });
  };

  var jjimToggle = function() {
    var $targetEl = $('.jjimBtn');
    var toastTxt;
    var buttonTxt;

    $targetEl.on('click', function() {
      var $this = $(this);
      $('.jjimBtn').toggleClass('on');

      var hasOn = $('.jjimBtn').hasClass('on');
      var isCoupon = $('.couponWrap .storeCoupon').length;
      var layerInfoJjim = $this.hasClass('layerInfoJjim');

      buttonTxt = hasOn ? '찜한 스토어' : '스토어 찜하기';
      toastTxt = hasOn ? '스토어찜이 완료되었습니다.' : '스토어찜이 해제되었습니다.';
      $this.find('.jjimText').html(buttonTxt);

      if (hasOn) {
        $this.attr('aria-controls', 'couponStep1');
        if (!isCoupon) {
          $('.storeContainer').toast({
            content: toastTxt, // {String} 토스트 팝업 콘텐츠
            time: 2000 // {Number} 토스트 팝업 유지 시간 (default: 5000)
          });
        } else {
          if (layerInfoJjim) {
            $('.storeContainer').toast({
              content: toastTxt, // {String} 토스트 팝업 콘텐츠
              time: 2000 // {Number} 토스트 팝업 유지 시간 (default: 5000)
            });
          }
          $this.attr('aria-controls', 'couponStep1');
        }

        if ($('.jsToast:visible').length) {
          $('.storeContainer .toast').html(toastTxt);
          return;
        }
      } else {
        $this.removeAttr('aria-controls');
        $('.storeContainer').toast({
          content: toastTxt, // {String} 토스트 팝업 콘텐츠
          time: 2000 // {Number} 토스트 팝업 유지 시간 (default: 5000)
        });

        if ($('.jsToast:visible').length) {
          $('.storeContainer .toast').html(toastTxt);
          return;
        }
      }
    });
  };

  category.common();
  jjimToggle();

  if (isMobile) {
    category.mobile();

    return;
  }

  subGateway();
  category.desktop();
})(jQuery, document, window);
