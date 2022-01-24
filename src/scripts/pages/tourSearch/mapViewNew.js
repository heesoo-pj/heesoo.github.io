;(function() {
  var ranges = (function() {
    if ($('.range').length !== 0) {
      var ranges = $('.range').nstSlider({
        'rounding': {
          '10000': '990000'
        },
        'left_grip_selector': '.min',
        'right_grip_selector': '.max',
        'value_bar_selector': '.bar',
        'value_changed_callback': function(cause, leftValue, rightValue) {
          var $container = $(this).parent();
          leftValue = leftValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          rightValue = rightValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          $container.find('.minPrice').val(leftValue);
          $container.find('.maxPrice').val(rightValue);
        }
      });
    }
  }());

  var distanceActive = (function() {
    $('.distanceBtn li').on('click', function() {
      var $this = $(this);
      var $parent = $this.parent();
      $parent.toggleClass('open');
      if (!$this.hasClass('active')) {
        $this.siblings().removeClass('active');
        $this.addClass('active');
      }
    });
  }());

  var nearBtn = (function() {
    var open = function() {
      $('.mapViewNew .nearBtn').on('click', function() {
        $('#nearContent').addClass('on');

        if (!$('.tabMenu span').hasClass('active')) {
          $('.tabMenu span').eq(0).addClass('active');
          slide('.slide1');
        }
      });
    };

    open();

    var close = function() {
      $('#nearContent .btnClose').on('click', function() {
        $('#nearContent').removeClass('on');
      });
    };

    close();
  }());

  var mapViewSlider;
  var slide = (function(e) {
    if ($(e).length !== 0) {
      $('.mapSliderWrap').not($(e)).removeClass('active');
      $(e).addClass('active');
      var $slide = $(e).find('.mapSlider');
      (mapViewSlider !== undefined) && (mapViewSlider.destroySlider());
      mapViewSlider = $slide.bxSlider({
        maxSlides: 2,
        moveSlides: 1,
        slideWidth: 285,
        slideMargin: 20,
        infiniteLoop: false,
        pager: false
      });
    };
  });

  var slideTab = (function() {
    $('.tabMenu span').on('click', function() {
      var $this = $(this);
      if (!$this.hasClass('active')) {
        $this.addClass('active');
        $this.siblings().removeClass('active');
        slide('.slide' + Number($this.index() + 1));
      }

      //지도 point 변경
      $('div[class*="type"]').removeClass (function(index, css) {
        return (css.match (/(^|\s)type\S+/g) || []).join(' ');
      });

      $('.pinInfoBox').addClass('type'+ $this.index());
    });
  }());
})();
