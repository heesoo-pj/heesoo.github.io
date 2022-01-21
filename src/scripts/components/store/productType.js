;(function($, win, doc) {
  $.fn.productType = function() {
    var sliderActive = false;
    var slider;
    var isDesktop = $('body').hasClass('desktop');
    var $bestProductSlide = $('.bestProductSlide');
    var $bigItemSlide = $('.bigItemSlide');
    var slideOptions = {
      desktop: {
        maxSlides: 3,
        moveSlides: 1,
        slideWidth: 'auto',
        pager: false,
        slideMargin: 40,
        infiniteLoop: true,
        touchEnabled: false,
        keyboardEnabled: true
      },
      mobile: {
        bigItem: {
          maxSlides: 1,
          moveSlides: 1,
          slideMargin: 5,
          infiniteLoop: true,
          pager: true,
          hideControlOnEnd: true
        },
        bestProduct: {
          maxSlides: 2,
          moveSlides: 1,
          slideWidth: 'auto',
          slideMargin: 20,
          infiniteLoop: true,
          pager: false,
          hideControlOnEnd: true
        }
      }
    };

    var slideActiveLength = isDesktop ? 3 : 1;
    var bestProductItemLength = $bestProductSlide.find('li').length;
    var bigItemSlideLength = $bigItemSlide.find('li').length;
    var $bestProductSlideUl = $bestProductSlide.find('ul');
    var $bigItemSlideSlideUl = $bigItemSlide.find('ul');
    var slideOpt = isDesktop ? slideOptions.desktop : slideOptions.mobile.bigItem;
    var bestProductSlideOpt = isDesktop ? slideOptions.desktop : slideOptions.mobile.bestProduct;
    var onClass = 'on';
    var bigItemSlideClass = 'bigItemSlide';
    var $typeWrap = $('.typeWrap');

    var typeBtn = {
      setClass: function($clickedBtn) {
        $clickedBtn
          .addClass(onClass)
          .siblings()
          .removeClass(onClass);
      },
      accessibility: function($clickedBtn) {
        var ariaPressed = 'aria-pressed';

        $clickedBtn
          .attr(ariaPressed, $clickedBtn.hasClass(onClass))
          .siblings()
          .attr(ariaPressed, false);
      },
      init: function($btn) {
        this.setClass($btn);
        this.accessibility($btn);
      }
    };

    var typeFilterSlide = {
      setClass: function(_dataTpye) {
        $('.typeFilter ul')
          .removeClass()
          .addClass(_dataTpye);

        if (_dataTpye === 'bigItem') {
          $typeWrap.addClass('slideWrap ' + bigItemSlideClass);
        }
      },
      setSlide: function(_dataTpye) {
        var noSlide = $('.productWrap').hasClass('noSlide');

        if (_dataTpye === 'bigItem' && !sliderActive && !noSlide) {
          sliderActive = createTypeFilterSlider();
          $typeWrap.addClass(bigItemSlideClass);
        } else if (_dataTpye !== 'bigItem' && sliderActive) {
          slider.destroySlider();
          sliderActive = false;
          $typeWrap.removeClass(bigItemSlideClass);
        }
      },
      init: function(type) {
        this.setClass(type);
        this.setSlide(type);
      }
    };

    function typeFilter($this) {
      var dataTpye = $this.data('type');

      typeBtn.init($this);
      typeFilterSlide.init(dataTpye);
    }

    function createExampleSlider() {
      if (bigItemSlideLength > slideActiveLength) {
        $bigItemSlideSlideUl.bxSlider(slideOpt);
      }

      if (bestProductItemLength > slideActiveLength) {
        $bestProductSlideUl.bxSlider(bestProductSlideOpt);
      }
    };

    function createTypeFilterSlider() {
      slider = $('.typeFilter ul').bxSlider(slideOpt);
      return true;
    };

    function init($this) {
      createExampleSlider();

      $this.click(function() {
        typeFilter($(this));
      });
    };

    init($(this));
  };

  $(doc).ready(function() {
    $('.typeIconWrap button').productType();
  });
})(jQuery, window, document);
