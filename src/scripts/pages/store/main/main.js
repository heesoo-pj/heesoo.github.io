var layerTransform = function() {
  $(document).layerTransform({
    btnSelector: '.layerTransformButton[aria-controls=eventPopup]'
  });
};

var bannerSlide = function() {
  var $mainBanner = $('.mainBanner');
  var mainEventLength = $mainBanner.find('li').length;

  if (mainEventLength > 1) {
    $('.mainBanner ul').bxSlider({
      captions: true,
      pagerType: 'short',
      auto: true,
      autoHover: true,
      pause: 5000,
      speed: 200
    });
  }
};

var couponSlide = function() {
  var couponLength = $('.couponWrap .storeCoupon').length;
  var isNoBanner = $('.sellerInfoWrap').hasClass('noBanner');

  var slideOptions = [
    // desktop
    {
      maxSlides: 2,
      moveSlides: 1,
      slideWidth: 250,
      slideMargin: 20,
      infiniteLoop: false,
      touchEnabled: false,
      keyboardEnabled: true,
      hideControlOnEnd: true
    },
    // mobile
    {
      maxSlides: 2,
      moveSlides: 1,
      slideWidth: 'auto',
      infiniteLoop: false,
      pager: false,
      hideControlOnEnd: true
    }
  ];

  if (couponLength) {
    if ($('.mobile').length && couponLength >=2) {
      $('.couponInner').bxSlider(slideOptions[1]);
    } else if (couponLength >= 3) {
      if (isNoBanner) {
        slideOptions[0].slideWidth = 440;
        $('.couponInner').bxSlider(slideOptions[0]);
      } else {
        $('.couponInner').bxSlider(slideOptions[0]);
      }
    }
  } else {
    return false;
  }
};

var eventSlide = function() {
  var slideOptions = {
    desktop: {
      maxSlides: 2,
      moveSlides: 1,
      slideWidth: 620,
      slideMargin: 40,
      pager: false,
      touchEnabled: false,
      infiniteLoop: true,
      keyboardEnabled: true,
      hideControlOnEnd: true,
      onSliderLoad: function() {
        $('.bx-clone').find('a').prop('tabIndex', -1);
      },
      onSlideAfter: function() {
        $('.eventSlide').children('li').each(function() {
          if ($(this).attr('aria-hidden') === 'false') {
            $(this).find('a').attr('tabIndex', 0);
          } else {
            $(this).find('a').attr('tabIndex', -1);
          }
        });
      }
    },
    mobile: {
      pagerType: 'short',
      infiniteLoop: true,
      slideMargin: 10,
      speed: 200
    }
  };

  var eventLiLength = $('.mainEvent li').length;

  if ($('.desktop').length && eventLiLength >= 3) {
    $('.eventSlide').bxSlider(slideOptions.desktop);
  } else if ($('.mobile').length && eventLiLength > 1) {
    eventSlide = $('.eventSlide').bxSlider(slideOptions.mobile);
  }
};

var eventPopup = function() {
  var $eventMoreBtn = $('.desktop .eventMoreBtn');
  var $eventCloseBtn = $('.desktop #eventPopup .closeCard button');
  $eventMoreBtn.on('click', function() {
    $('html, body').css('overflow', 'hidden');
  });

  $eventCloseBtn.on('click', function() {
    $('html, body').css('overflow', 'visible');
  });
};

var commonInit = function() {
  layerTransform();
  bannerSlide();
  couponSlide();
  eventSlide();
  eventPopup();
};

commonInit();




