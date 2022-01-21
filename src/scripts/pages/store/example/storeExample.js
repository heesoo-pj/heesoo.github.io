var layerTransformExample = function() {
  $(document).layerTransform({
    btnSelector: '#contents .layerTransformButton',
    showBegin: function(e) {
      if (e.data.contentSelector === '#callBackTestCard') {
        console.log('SHOWBEGIN');
      }
    },
    hideBegin: function(e) {
      if (e.data.contentSelector === '#callBackTestCard') {
        console.log('HIDEBEGIN');
      }
    },
    showComplete: function(e) {
      if (e.data.contentSelector === '#callBackTestCard') {
        console.log('SHOWCOMPLETE');
      }
    },
    hideComplete: function(e) {
      if (e.data.contentSelector === '#callBackTestCard') {
        console.log('HIDECOMPLETE');
      }
    }
  });
};

var tab = function() {
  $('.jsTab .jsTabBtn').on('click', function() {
    $(this).parent().addClass('active').siblings().removeClass('active');
  });
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

var toastExample = function() {
  if (!$('.toastExample').length) {
    return;
  }

  var toast = $('.storeContainer').toast({
    content: '토스트 예제입니다', // {String} 토스트 팝업 콘텐츠
    class: 'example', // {String} 토스트 팝업 클래스
    time: 4000 // {Number} 토스트 팝업 유지 시간 (default: 5000)
  });
};

var commonInit = function() {
  tab();
  checkBox();
  selectStyle();
  ranges();
  toastExample();
  layerTransformExample();
};


commonInit();


