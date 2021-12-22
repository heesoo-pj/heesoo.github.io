;(function($, undefined) {
  $.extend($.fn, {
    splitLayout: function(opts) {
      var $splitter = this.eq(0);
      var $asideCol = $('#asideCol');
      var cookieName = 'shoppingMobile_asideWidth';
      var defaults = {
        limit: {
          min: 150,
          max: 600
        }
      };

      opts = $.extend({}, defaults, opts);

      $asideCol.css({
        width: Cookies.get(cookieName)
      });

      $splitter.on('mousedown', function(e) {
        e.preventDefault();
        $(document).on({
          mousemove: function(e) {
            if (e.pageX > opts.limit.min && e.pageX < opts.limit.max) {
              $asideCol.css({
                width: e.pageX
              });
            }

            $(document.body).addClass('resizing');
          },
          mouseup: function(e) {
            $(this).off('mousemove');
            $(document.body).removeClass('resizing');

            var width = Math.min(Math.max(parseInt(e.pageX), opts.limit.min), opts.limit.max);
            Cookies.set(cookieName, width);
          }
        });
      });
    },

    search: function(opts) {
      var defaults = {
        delay: 300,
        targetWrapper: '.asideWrapper',
        visibilityClass: 'visible',
        ancestorClass: 'ancestorItem',
        lastVisibleClass: 'lastVisibleItem',
        searchStatusClass: 'searchResult'
      };

      var $input = this.eq(0);
      var $reset = $input.next('.resetButton');

      opts = $.extend({}, defaults, opts);

      if (!$input.length) {
        return;
      }

      var $wrapper = $(opts.targetWrapper);
      var $list = $wrapper.find('[data-search-level]');

      var $items = {
        group: $list.filter('[data-search-level="0"]').find('h3'),
        firstLv: $list.filter('[data-search-level="1"]').find('> span'),
        secondLv: $list.filter('[data-search-level="2"]').find('> a')
      };

      var reset = function(e) {
        e.preventDefault();
        $input
          .val('')
          .trigger('input')
          .focus();
      };

      var $notFound = $('<p/>', {
        'class': 'empty',
        text: 'No results found.'
      });

      var searchIt = function(res) {
        var keyword = res.trim();
        var urlKeyword = keyword.replace(/^.*\/\/[^\/]+/, '');
        var escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var regexp = new RegExp(escapedKeyword, 'g');
        var matchedResult = [];

        $notFound.remove();

        $list
          .removeClass([
            opts.visibilityClass,
            opts.ancestorClass,
            opts.lastVisibleClass
          ].join(' '))
          .find('mark')
          .contents()
          .unwrap();

        if (!keyword) {
          $wrapper.removeClass(opts.searchStatusClass);
          return;
        }

        $wrapper.addClass(opts.searchStatusClass);

        var markedKeyword = '<mark>' + keyword + '</mark>';

        var loop = function($elems) {
          var $lastItem;

          $elems.each(function() {
            var $this = $(this);
            var text = $this.text();
            var href = $this.attr('href');

            if (regexp.test(text) || (href && ~href.indexOf(urlKeyword))) {
              $this
                .html(text.replace(regexp, markedKeyword))
                .parent('[data-search-level]')
                .addClass(opts.visibilityClass)
                .parents('[data-search-level]')
                .addClass(opts.ancestorClass);

              matchedResult.push(true);
              $lastItem = $this;
            }
          });

          if ($lastItem) {
            $lastItem.parent().addClass('lastVisibleItem');
          }
        };

        loop($items.group);
        loop($items.firstLv);
        loop($items.secondLv);

        if (matchedResult.indexOf(true) < 0) {
          $wrapper.append($notFound);
        }
      };

      var inputTimeout;
      var keyInput = function() {
        var _this = this;

        if (inputTimeout) {
          clearTimeout(inputTimeout);
        }

        inputTimeout = setTimeout(function() {
          searchIt(_this.value);
        }, opts.delay);
      };

      var keydown = function(e) {
        var $targetElem;

        if (e.keyCode === 40) {
          e.preventDefault();
          $targetElem = $items.secondLv.filter(':visible:first');

          if ($targetElem.length) {
            $targetElem.trigger('click');
          }
        }
      };

      $input.on({
        input: keyInput,
        keydown: keydown
      });

      $reset.on('click', reset);
      return $input;
    },

    pageSwitcher: function() {
      var $menu = this.eq(0);
      var $menuContentWrap = $menu.find('.asideWrapper');
      var $menuItems = $menu.find('a');
      var $header = $('.contentHeader');
      var $groupNameElem = $header.find('.groupName');
      var $pageNameElem = $header.find('.pageName');
      var $urlElem = $header.find('.url');
      var $newWinElem = $header.find('.openWithNewWindow');
      var selectedIndex = 0;

      var pageName = function() {
        return window.location.hash.slice(1);
      };

      var historyState = function(method, $elem) {
        var token = $elem.data('token');

        history[method]({
          elem: token
        }, null, '#' + token);
      };

      var menuHighlightChanger = function(i) {
        $menuItems
          .filter('.current')
          .removeClass('current')
          .end()
          .eq(i)
          .addClass('current');
      };

      var menuSlider = function($elem) {
        var menuOffsetTop = $menu.offset().top;
        var menuScrollTop = $menu.scrollTop();
        var menuContentHeight = $menuContentWrap.height();
        var menuHeight = $menu.height();
        var elemHeight = $elem.outerHeight();
        var currElemScrollTop = $elem.offset().top;
        var pad = menuHeight * .1;

        var viewport = {
          top: currElemScrollTop - menuOffsetTop - pad,
          bottom: currElemScrollTop + elemHeight - (menuOffsetTop + menuHeight) + pad
        };

        var scrollend = {
          top: menuScrollTop <= 0,
          bottom: menuContentHeight - menuScrollTop <= menuHeight
        };

        var scrollTo = Math.min(viewport.top, 0) || Math.max(viewport.bottom, 0);

        if (!scrollend.top && (scrollTo < 0) || !scrollend.bottom && (scrollTo > 0)) {
          $menu
            .stop()
            .animate({
              scrollTop: menuScrollTop + scrollTo
            }, 200);
        }

        $elem.focus();
      };

      var switcher = function($elem) {
        var $frame = $('#contentFrame');
        var frameSrc = $elem.attr('href');
        var $targetElem;

        $menuItems.each(function(i) {
          if ($(this).attr('href') === frameSrc) {
            $targetElem = $(this);
            selectedIndex = i;
            return false;
          }
        });

        if (!$targetElem) {
          return;
        }

        menuHighlightChanger(selectedIndex);
        $groupNameElem.text($targetElem.data('groupName'));
        $pageNameElem.text($targetElem.text());
        $urlElem.text($targetElem.attr('href'));
        $newWinElem.attr('href', $targetElem.attr('href'));
        historyState('replaceState', $targetElem);
        menuSlider($targetElem);

        $frame.stop().replaceWith($('<iframe/>', {
          attr: {
            id: 'contentFrame',
            src: $elem.attr('href'),
            'class': 'frame'
          }
        }));
      };

      $menuItems.on('click', function(e) {
        e.preventDefault();

        if (e.which === 2) {
          window.open(this.href);
          return;
        }

        switcher($(this));
        historyState('pushState', $(this));
      });

      $menu.on('keydown', function(e) {
        var keyCodes = {
          up: 38,
          down: 40
        };

        var $prev = $menuItems.filter(':lt(' + selectedIndex + '):visible:last');
        var $next = $menuItems.filter(':gt(' + selectedIndex + '):visible:first');

        if (e.keyCode === keyCodes.up) {
          e.preventDefault();

          if ($prev.length) {
            switcher($menuItems.eq($menuItems.index($prev)));
          } else {
            $('#searchInput').focus();
          }
        }

        if (e.keyCode === keyCodes.down) {
          e.preventDefault();

          if ($next.length) {
            switcher($menuItems.eq($menuItems.index($next)));
          }
        }
      });

      var initialSelection = function() {
        var page = pageName();
        var $selectedMenu;

        if (page) {
          $selectedMenu = $menuItems.filter('[data-token="' + page + '"]');
        } else {
          $selectedMenu = $menuItems.eq(0);
        }

        switcher($selectedMenu);
      };

      $(window).on('popstate', function(e) {
        if (e.originalEvent.state) {
          initialSelection();
        }
      });

      initialSelection();
    },

    toggleLayout: function() {
      var $button = this.eq(0);
      var $target = $button.parents('.projectInfo');
      var cookieName = 'shoppingMobile_infoboxStatus';

      var statusChange = function(method) {
        var before = 'collapsed';
        var after = 'expanded';

        if (method === 'collapse') {
          before = [after, after = before][0];
        }

        if ($target.hasClass(after)) {
          return;
        }

        $target
          .removeClass(before)
          .addClass(after);

        Cookies.set(cookieName, after);
      };

      var toggleIt = function(e) {
        var isExpanded = $target.hasClass('expanded');
        var action = isExpanded ? 'collapse' : 'expand';

        statusChange(action);
        e.preventDefault();
      };

      var init = function() {
        var savedVal = Cookies.get(cookieName);
        var isCollapsed = savedVal === 'collapsed';
        var initStatus = isCollapsed ? 'collapse' : 'expand';

        statusChange(initStatus);
      };

      init();
      $button.on('click', toggleIt);
    }
  });

  $('.pages').pageSwitcher();
  $('.splitter').splitLayout();
  $('#searchInput').search();
  $('.viewToggleButton').toggleLayout();
})(jQuery);
