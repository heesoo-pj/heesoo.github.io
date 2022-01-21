var tab = {
  common: function() {
    $('.jsTab .jsTabBtn').on('click', function() {
      $(this).parent().addClass('active').siblings().removeClass('active');
    });
  },
  mobile: function() {
    $('.jsTab .jsTabBtn').on('click', function() {
      var $jsTabBtn = $(this).parent('li');
      // var offsetPadding = parseInt($(this).parent().css('padding-left'));
      // var offsetLeft = this.offsetLeft;


      const root = $jsTabBtn.parents('.jsTab'); // 탭 상위 요소
      // const prev = $jsTabBtn.prev(); // 선택된 다음 탭
      // const next = $jsTabBtn.next(); // 선택된 이전 탭
      // const prevX = prev.length ? prev.offset().left : 0;
      // const nextX = next.length ? next.offset().left : 0;
      // const nextWidth = next.width();
      const scrollX = root.scrollLeft();
      const winWidth = window.innerWidth;
      // const gutter = 10;
      const thisLeft = $jsTabBtn.offset().left;
      const thisWidth = $jsTabBtn.width();

      // console.log('thisLeft///'+ thisLeft);
      // console.log('scrollX///'+scrollX);

      // console.log(())
      // console.log(thisLeft + scrollX)
      console.log((winWidth-thisLeft + scrollX - thisWidth) * -1);
      // console.log(thisLeft)


      // console.log(scrollX)
      // var ss = Math.min(prevX - scrollX, 0);
      // var bb = Math.max((winWidth - nextX + scrollX - nextWidth) * -1, 0);
      // console.log(ss)
      // console.log(bb)

      // $(this).parents('.jsTab').animate({ scrollLeft:  }, 300);
    });
  }
};

var checkBox = function() {
  $('.jsFormCheckRound').on('change', function() {
    var round = $($(this).data('round'));
    var toggle = $($(this).data('toggle'));

    round.toggleClass('round');
    toggle.toggleClass('active');
  });
};

var selectStyle = function() {
  var form = {};
  form.btnSelector = '.selectStyle .viewPoint';
  form.optionList = '.selectStyle .optionList a';

  form.allClose = function() {
    $('.selectStyle:not(.thisEvent)').removeClass('on');
    $('.thisEvent').removeClass('thisEvent');
  };

  form.toggleEvent = function(e) {
    e.preventDefault();

    $(this)
      .parent()
      .toggleClass('on')
      .addClass('thisEvent');

    form.allClose();
  };

  form.selectOption = function(e) {
    e.preventDefault();
    $(this)
      .parent()
      .addClass('current')
      .siblings()
      .removeClass('current')
      .end()
      .closest('.selectStyle')
      .find('.viewPoint span')
      .text($(this).text().trim())
      .parent()
      .trigger('click');
  };

  $('.storeContainer').on('click', form.btnSelector, form.toggleEvent);
  $('.storeContainer').on('click', form.optionList, form.selectOption);
  $('body').on('click', function(e) {
    var _target = $('.sortSelect');
    var _currentTarget = $(e.target);
    if (!_currentTarget.closest(_target).length || _currentTarget.is(_target)) {
      form.allClose();
    }
  });
};

var ranges = function() {
  if ($('.rangeWrap').length === 0) {
    return;
  }

  var ranges = $('.rangeWrap').nstSlider({
    'rounding': {
      '100': '1000',
      '1000': '10000',
      '10000': '100000',
      '100000': '1000000'
    },
    'left_grip_selector': '.min',
    'right_grip_selector': '.max',
    'value_bar_selector': '.bar',
    'value_changed_callback': function(cause, leftValue, rightValue) {
      var $container = $(this).parents('.progressBar');
      leftValue = leftValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      rightValue = rightValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      $container.find('.minPrice .value').text(leftValue);
      $container.find('.maxPrice .value').text(rightValue);
    }
  });

  $(window).resize(function() {
    $('.rangeWrap').nstSlider('refresh');
  });
};

var searchInputEvent = function() {
  var sch = {};

  sch.switchDeleteButton = function() {
    $(sch.this)
      .parent()
      [(sch.hasText ? 'add' : 'remove') + 'Class']('hasText');
  };

  sch.deleteSearchKeyword = function() {
    sch.this = sch.this || this.previousElementSibling;
    sch.this.value = '';
    $(sch.this).trigger('input');
  };

  sch.inputEvent = function(e) {
    sch.this = this;
    sch.hasText = sch.this.value.length > 0;
    sch.switchDeleteButton();
  };

  $(document).on('input', '.jsSearch', sch.inputEvent);
  $(document).on('click', '.jsDelSearchText', sch.deleteSearchKeyword);
};

var toggleFilterLayer = function() {
  var rangeFlag = true;
  var activeClass = 'isActive';

  $('.filterBtn').on('click', function() {
    $(this).parent().toggleClass(activeClass);

    if (!rangeFlag) {
      return;
    }

    setTimeout(function() {
      ranges();
      rangeFlag = false;
    }, 0);
  });
};

var commonInit = function() {
  tab.common();
  checkBox();
  selectStyle();
  searchInputEvent();
  toggleFilterLayer();
};


var mobileInit = function() {
  tab.mobile();
};


commonInit();




if ($('.mobile').length) {
  mobileInit();
}
