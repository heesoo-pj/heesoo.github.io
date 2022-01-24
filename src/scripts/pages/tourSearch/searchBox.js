;(function($, doc, win) {
  var searchBox = {
    searchDestination: function() {
      var controlLayer = function(e) {
        $('#searchDestinationLayer .searchLayerInner')[(Boolean(e.target.value.length) ? 'add' : 'remove') + 'Class']('searched');
      };

      $(doc).on('keyup', '.jsSearch', function(event) {
        controlLayer(event);
      });
    },
    searchRoom: function() {
      var disabled = 'disabled';

      function quantitySelector() {
        var q = {};
        q.temp = {};
        q.quantitySelector = '.quantitySelector';
        q.spinnerInputSelector = '.currentQuantity .iText';
        q.spinnerController = '.controller';

        q.getDataset = function(element, name) {
          return element.getAttribute('data-' + name);
        };

        q.controlEvent = function() {
          q.this = this;
          q.wrap = q.this.parentNode;
          q.isMinus = $(q.this).hasClass('minus');
          q.thisInput = q.wrap.querySelector(q.spinnerInputSelector);

          q.quantityRule();
        };

        q.totalRule = function() {
          if (!q.getDataset(q.thisInput, 'total-number-selector')) {
            return true;
          }

          if (q.isMinus) {
            q.temp.totalSum = q.temp.totalSum - 1;

            return true;
          }

          q.wrapper = q.wrap.closest(q.getDataset(q.thisInput, 'total-number-selector'));
          q.totalNumber = q.wrapper.dataset.totalNumber;

          q.allSpinnerInput = q.wrapper.querySelectorAll(q.spinnerInputSelector);
          q.temp.totalSum = 0;

          for (var i = 0, iLength = q.allSpinnerInput.length; i < iLength; i++) {
            q.temp.totalSum += Number(q.allSpinnerInput[i].value || q.allSpinnerInput[i].innerText);
          }

          return true;
        };

        q.trigger = function() {
          var ev = doc.createEvent('HTMLEvents');
          ev.initEvent('change', true, false);
          q.thisInput.dispatchEvent(ev);
        };

        q.quantityRule = function() {
          if (!q.totalRule()) {
            return;
          }

          q.temp.result = q.isMinus ?
            Number(q.thisInput.value || q.thisInput.innerText) - 1 :
            Number(q.thisInput.value || q.thisInput.innerText) + 1;

          q.controlState();
          if (q.temp.result > q.getDataset(q.thisInput, 'max-number') || q.temp.result < q.getDataset(q.thisInput, 'min-Number')) {
            return;
          }

          if (q.thisInput.value) {
            q.thisInput.value = q.temp.result;
          } else {
            q.thisInput.innerText = q.temp.result;
          }

          q.trigger();
        };

        q.controlState = function() {
          var $allPlusSelector = $('.searchRoomCountForm .controller.plus');
          var $plusSelector = $(q.wrap).find('.plus');
          var $minusSelector = $(q.wrap).find('.minus');

          if (q.temp.result >= q.getDataset(q.thisInput, 'max-number')) {
            $plusSelector.attr(disabled, '');
            $plusSelector.addClass(disabled);
          } else {
            $plusSelector.removeAttr(disabled);
            $plusSelector.removeClass(disabled);
          }

          if (q.temp.result <= q.getDataset(q.thisInput, 'min-Number')) {
            $minusSelector.attr(disabled, '');
            $minusSelector.addClass(disabled);
          } else {
            $minusSelector.removeAttr(disabled);
            $minusSelector.removeClass(disabled);
          };

          if (Number(q.totalNumber) - 1 === q.temp.totalSum) {
            $allPlusSelector.addClass(disabled);
          } else {
            $allPlusSelector.removeClass(disabled);
          }
        };

        $(doc).on('click', q.quantitySelector + ' ' + q.spinnerController, q.controlEvent);
      };

      function controlRoom() {
        var room = {};

        room.temp = {};
        room.control = {};
        room.remove = {};
        room.strings = {
          activeBtnClose: 'activeBtnClose',
          guestRoom: '.guestRoom'
        };

        room.markup = {};
        room.markup.childrenAge = {};
        room.markup.rooms = {};
        room.markup.childrenAge.selectStyle = '<div class="selectStyle">' +
                                                '<a href="#" class="viewPoint">' +
                                                  '<span>만 0세</span>' +
                                                '</a>' +
                                                '<div class="optionList">' +
                                                  '<ul>' +
                                                    (function() {
                                                      var arr = [];

                                                      for (var i = 0; i <= 11; i++) {
                                                        arr.push('<li' + (i === 0 ? ' class="current"' : '') + '><a href="#">만 ' + i + '세</a></li>');
                                                      };

                                                      return arr.join('');
                                                    })() +
                                                  '</ul>' +
                                                '</div>' +
                                              '</div>';

        room.markup.rooms.quantitySelector = function(t) {
          return '<div class="quantitySelector">' +
                    '<button type="button" class="controller minus" disabled><span>줄이기</span></button>' +
                    '<label class="currentQuantity">' + t + ' <span class="iText' + (t === '소아' ? ' jsChildrenInput' : '') + '"data-max-number="' + (t === '성인' ? 20 : 6) + '"data-min-number="0">0 </span>명 </label>' +
                    '<button type="button" class="controller plus"><span>늘리기</span></button>' +
                  '</div>';
        };

        room.markup.rooms.guestRoom = function(idx) {
          return '<div class="guestRoom">' +
                    '<h1>객실 ' + idx + '</h1>' +
                    '<div class="guestRoomSelect">' +
                      (function() {
                        var arr = [];

                        ['성인', '소아'].forEach(function(item) {
                          arr.push(room.markup.rooms.quantitySelector(item));
                        });

                        return arr.join('');
                      })() +
                    '</div>' +
                    '<div class="childrenAge">' +
                      '<h1>소아 나이 입력</h1>' +
                      '<div class="selectStyleWrap"> </div>' +
                      '<span class="caution">입실일(2021.04.12) 기준 2008.04.13 ~ 2019.04.12 출생. 자세한 내용은 숙소별 규정 참고</span>' +
                    '</div>' +
                    '<button type="button" class="btnClose">닫기</button>' +
                  '</div>';
        };

        room.control.childrenAge = function() {
          room.temp.isAdd = room.$.detailWrap.find('.selectStyle').length < Number(room.this.innerText);

          room.control.childrenAge.add = function() {
            room.$.detailWrap.append(room.markup.childrenAge.selectStyle);
          };

          room.control.childrenAge.remove = function() {
            room.$.detailWrap.find('.selectStyle:last-child').remove();
          };

          if (room.temp.isAdd) {
            room.control.childrenAge.add();
          } else {
            room.control.childrenAge.remove();
          }

          room.$.childrenAge[(room.$.detailWrap.find('.selectStyle').length === 0 ? 'hide' : 'show')]();
        };

        room.setChildrenForm = function() {
          room.this = this;
          room.$ = $(room.this);
          room.$.childrenAge = room.$.parents('.guestRoom').find('.childrenAge');
          room.$.detailWrap = room.$.parents('.guestRoom').find('.selectStyleWrap');

          room.control.childrenAge();
        };

        room.control.rooms = function() {
          room.searchRoomCountForm = room.$.closest('.searchRoomCountForm');
          room.visibleGuestRoomLength = room.searchRoomCountForm.find(room.strings.guestRoom).length;
          room.temp.isAdd = room.visibleGuestRoomLength < room.this.innerText;

          room.control.rooms.add = function() {
            room.searchRoomCountForm.find('.guestRoomWrap').append(room.markup.rooms.guestRoom(room.visibleGuestRoomLength + 1));

            if (room.visibleGuestRoomLength === 1) {
              room.searchRoomCountForm.addClass(room.strings.activeBtnClose);
            }
          };

          room.control.rooms.remove = function() {
            room.searchRoomCountForm.find(room.strings.guestRoom + ':last-child').remove();
          };

          if (room.temp.isAdd) {
            room.control.rooms.add();

            return;
          }

          room.control.rooms.remove();

          if (room.visibleGuestRoomLength === 2) {
            room.searchRoomCountForm.removeClass(room.strings.activeBtnClose);
          }
        };

        room.setRoomCountForm = function() {
          room.this = this;
          room.$ = $(room.this);

          room.control.rooms();
        };

        room.remove.removeRoom = function(closeBtn) {
          $(closeBtn).parents(room.strings.guestRoom).remove();
        };

        room.remove.resetNumber = function() {
          room.remove.$guestRoom = room.searchRoomCountForm.find(room.strings.guestRoom);

          room.remove.$guestRoom.each(function(idx, item) {
            $(item).find('> h1').text('객실 ' + (idx + 1));
          });

          room.searchRoomCountForm.find('.jsRoomCount').text(room.remove.$guestRoom.length);
        };

        room.remove.checkMinNumber = function() {
          if (room.remove.$guestRoom.length !== 1) {
            return;
          }

          room.remove.$minusSelector = $('.searchRoomCount .minus');
          room.searchRoomCountForm.removeClass(room.strings.activeBtnClose);

          room.remove.$minusSelector.attr(disabled, '');
          room.remove.$minusSelector.addClass(disabled);
        };

        room.remove.init = function(btn) {
          room.remove.removeRoom(btn);
          room.remove.resetNumber();
          room.remove.checkMinNumber();
        };

        $(doc).find('.guestRoomWrap').append(room.markup.rooms.guestRoom(1));
        $(doc).on('change', '.jsRoomCount', room.setRoomCountForm);
        $(doc).on('change', '.jsChildrenInput', room.setChildrenForm);
        $(doc).on('click', '.guestRoom .btnClose', function() {
          room.remove.init(this);
        });
      };

      function selectStyle() {
        var form = {};
        form.selectStyle = 'selectStyle';
        form.btnSelector = '.' + form.selectStyle + ' .viewPoint';
        form.optionList = '.' + form.selectStyle + ' .optionList a';
        form.classCurrent = 'current';
        form.classOn = 'on';

        form.toggleEvent = function(e) {
          e.preventDefault();

          $(this)
            .parent()
            .toggleClass(form.classOn)
            .siblings()
            .removeClass(form.classOn);
        };

        form.selectOption = function(e) {
          e.preventDefault();
          $(this)
            .parent()
            .addClass(form.classCurrent)
            .siblings()
            .removeClass(form.classCurrent)
            .end()
            .closest('.' + form.selectStyle)
            .find('.viewPoint span')
            .text($(this).text().trim())
            .parent()
            .trigger('click');
        };

        form.closeSelector = function(e) {
          if (!$('.' + form.selectStyle + '.' + form.classOn).length) {
            return;
          }

          if ($(e.target).parents().hasClass(form.selectStyle)) {
            return;
          }

          $('.' + form.selectStyle).removeClass(form.classOn);
        };

        $(doc).on('click', form.btnSelector, form.toggleEvent);
        $(doc).on('click', form.optionList, form.selectOption);
        $(doc).on('click', form.closeSelector);
      };

      function searchRecent() {
        var removeBox = function() {
          $('.searchRecentBox').remove();;
        };

        var removeItem = function(btn) {
          var $li = $(btn).parents('li');

          if ($li.siblings().length === 0) {
            removeBox();
          }

          $li.remove();
        };

        $('.searchRecent').find('li .btnClose').on('click', function() {
          removeItem(this);
        });
        $('.btnRemoveAll').on('click', removeBox);
      };

      quantitySelector();
      controlRoom();
      selectStyle();
      searchRecent();
    },
    searchRegion: function() {
      var acccordion = function(btn) {
        var $content = $(btn).parent('').siblings().find('.regionContent').eq($(btn).index());
        var $firstLink = $content.find('li:first-child a');
        var duration = 150;

        var acccordionEffect = {
          spread: function($button, $content) {
            $button
              .addClass('on')
              .attr('aria-expanded', true);

            $content
              .slideDown(duration)
              .animate(
                { opacity: 1 },
                { queue: false, duration: duration}
              )
              .find('li a')
              .removeAttr('tabindex');

            $firstLink.focus();
          },
          fold: function($button, $content, callback) {
            $($button)
              .removeClass('on')
              .attr('aria-expanded', false);

            $content
              .animate(
                { opacity: 0 },
                { queue: false, duration: duration, complete: function() {
                  $content.slideUp(duration, function() {
                    if (callback) {
                      callback();
                    }
                  });
                }}
              )
              .find('li a')
              .attr('tabindex', -1);
          }
        };

        var activateEffect = {
          activate: function($el) {
            var $activedBtn = $('.regionButton.on');
            var $content = $activedBtn.parent('').siblings().find('.regionContent').eq($activedBtn.index());

            if ($content.length) {
              acccordionEffect.fold($($activedBtn), $content, function() {
                acccordionEffect.spread($(btn), $el);
              });

              return;
            }

            acccordionEffect.spread($(btn), $el);
          },
          deActivate: function($el) {
            acccordionEffect.fold($(btn), $el);
          }
        };

        if ($content.css('display') !== 'block') {
          activateEffect.activate($content);
        } else {
          activateEffect.deActivate($content);
        }
      };

      $('.regionButton').on('click', function() {
        acccordion(this);
      });

      $('.regionContent a').on('click', function(e) {
        e.preventDefault();

        var $searchRegion = $('.searchRegion');
        $searchRegion.find('input[type=text]').val(e.target.innerText);
        $searchRegion.find('.btnClose').trigger('click');
      });
    }
  };

  searchBox.searchDestination();
  searchBox.searchRoom();
  searchBox.searchRegion();
})(jQuery, document, window);
