;(function() {
  function expandedToggle($this, $content, toggleClass) {
    var expanded = $this.attr('aria-expanded');
    expanded === 'true' ? $this.attr('aria-expanded', false) : $this.attr('aria-expanded', true);

    $content.toggleClass(toggleClass);
  };

  var filterH = $('.searchWrapper').outerHeight();

  function filter() {
    var accordion = function() {
      $('.filterTit').click(function() {
        var $this = $(this);
        var $dd = $this.closest('.chkFilter').find('dd');

        expandedToggle($this, $dd, 'hidden');
        filterH = $('.searchWrapper').outerHeight();
      });
    };

    var moreBtnControl = function() {
      $('.filterContent').each(function() {
        var liLength = $(this).find('li').length;

        // list 5개 이상일 경우 더보기 버튼 show
        if (liLength > 5) {
          $(this).siblings('.btnListMore').addClass('show');
        }
      });

      $('.chkFilter .btnListMore').click(function() {
        var $this = $(this);
        var $filterContent = $this.siblings('.filterContent');
        filterH = $('.searchWrapper').outerHeight();

        expandedToggle($this, $filterContent, 'more');
        var expanded = $this.attr('aria-expanded');

        expanded === 'true' ? $(this).text('접기') : $(this).text('더보기');
      });
    };

    var scrollControl = function() {
      var $filter = $('.mainFilter');
      var $footer = $('#footArea');
      var windowH = $(window).innerHeight();
      var filterTop = $('.mainFilter').offset().top; //elTop
      var bodyH = $('body').innerHeight();
      var footerH = $footer.length > 0 ? $footer.innerHeight() : 0;

      $(window).scroll(function() {
        var scrollTop = $(window).scrollTop();
        var fixedPoint = (filterTop + filterH) - windowH;
        var absolutePoint = bodyH - (windowH + footerH);
        if (scrollTop < fixedPoint) {
          $filter.removeClass('absoluteBottom fixed');
        } else if (scrollTop < absolutePoint) {
          $filter
            .removeClass('absoluteBottom')
            .addClass('fixed');
        } else {
          $filter
            .removeClass('fixed')
            .addClass('absoluteBottom');
        }
      });
    };

    accordion();
    moreBtnControl();
    scrollControl();
  }

  function searchList() {
    var moreBtnControl = function() {
      $('.listItem .amenities').each(function() {
        var amenitiesH = $(this).outerHeight();

        if (amenitiesH > 27) {
          $(this).find('.btnListMore').addClass('used');
        }
      });
    };

    var amenitiesToggle = function() {
      $('.listItem .btnListMore').click(function() {
        var $this = $(this);
        var $infoWrap = $this.closest('.infoWrap');

        expandedToggle($this, $infoWrap, 'expanded');
        var expanded = $this.attr('aria-expanded');

        expanded === 'true' ? $(this).text('접기') : $(this).text('더보기');
      });
    };

    moreBtnControl();
    amenitiesToggle();
  }

  $(document).ready(function() {
    filter();
    searchList();
  });
})();
