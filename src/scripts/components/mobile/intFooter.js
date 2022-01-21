;(function() {
  window.onload = function() {
    'use strict';

    var intFooter = document.getElementById('intFooter');
    if (!intFooter) {
      console.info('not found #intFooter');
      return;
    }

    function metaInfo() {
      var metaElems = document.getElementsByTagName('META');
      var result = {};
      var meta;
      var content;

      var toNumber = function(str) {
        if (!str) {
          return str;
        }

        return isNaN(str) ? str : Number(str);
      };

      var toArray = function(str) {
        return str.replace(/\s/g, '').split(',');
      };

      var toObject = function(str) {
        var arr = toArray(str);
        var currArr;
        var obj = {};

        for (var item = 0, itemLength = arr.length; item < itemLength; item++) {
          currArr = arr[item].split('=');
          obj[currArr[0]] = toNumber(currArr[1]);
        }

        return obj;
      };

      var urlRegex = new RegExp('^https?:\/\/');

      for (var i = 0, len = metaElems.length; i < len; i++) {
        meta = metaElems[i];
        meta.name = meta.name || meta.getAttribute('property');

        if (!meta.name || meta.name === 'null' || !meta.content) {
          continue;
        }

        if (meta.content.indexOf('=') > -1 && !urlRegex.test(meta.content)) {
          content = toObject(meta.content);
        } else {
          if (meta.content.indexOf(',') > -1) {
            content = toArray(meta.content);
          } else {
            content = meta.content;
          }
        }

        result[meta.name] = content;
      }

      return result;
    }
    var metaInfo = metaInfo();

    var metaClass = {
      target: '',
      metaService: '',
      footerMetaClass: function() {
        var target = this.target;

        var metaServiceLists = [
          'interpark',
          'shopping',
          'book',
          'ticket',
          'tour'
        ];

        if (!Array.indexOf) {
          Array.prototype.indexOf = function(obj) {
            for (var i = 0; i < this.length; i++) {
              if (this[i] === obj) {
                return i;
              }
            }
            return -1;
          };
        }

        var metaService = metaServiceLists.indexOf(this.metaService) < 0 ? 'interpark' : this.metaService;
        var metaServiceClass = metaService + 'Footer';
        var thisClass = this.target.getAttribute('class');
        var totalMetaClass = metaServiceClass + '';
        target.setAttribute('class', thisClass !== null && thisClass !== undefined ? thisClass + ' ' + totalMetaClass : totalMetaClass);
      }
    };

    metaClass.target = intFooter;
    metaClass.metaService = metaInfo.service;

    metaClass.footerMetaClass();

    var intFoot = intFoot || {};
    intFoot.footer = function() {
      this.init();
    };

    function intFoot(el) {
      this.name = el;
      this.footArea = el.querySelector('.footInfoArea');
      this.footBtn = el.querySelector('.btnInfo');
      this.init();
    }

    intFoot.prototype.init = function() {
      this._assignElem();
      this._attachEventHandler();
    };

    intFoot.prototype._assignElem = function() {
      var footInfoArea = this.footArea;
      var footBtn = this.footBtn;
    };

    intFoot.prototype._attachEventHandler = function() {
      this.footBtn.addEventListener('click', this._onClickToggle, false);
    };

    intFoot.prototype._onClickToggle = function(event) {
      event.preventDefault();
      this.parentNode.classList.toggle('on');
      var info = this.nextSibling.nextSibling;
      var button = this.getAttribute('aria-expanded');

      function easeInOutQuad(time, start, change, duration) {
        time /= duration / 2;
        if (time < 1) {
          return change /2 * time * time + start;
        }
        return -change / 2 * (time * (time - 2) - 1) + start;
      };

      function scrollTo(to, duration) {
        var start = window.scrollY;
        var changeScroll = to - start;
        var currentTime = 0;
        var increment = 15;

        var animate = function() {
          currentTime += increment;

          var val = easeInOutQuad(currentTime, start, changeScroll, duration);

          window.scrollBy(0, val);

          if (currentTime < duration) {
            setTimeout(animate, increment);
          }
        };
        animate();
      }

      if (button === 'false') {
        this.setAttribute('aria-expanded', true);
        info.style.maxHeight = info.scrollHeight + 'px';
        scrollTo(document.body.scrollHeight + info.scrollHeight, 400);
      } else {
        this.setAttribute('aria-expanded', false);
        info.style.maxHeight = '';
      }
    };

    var intFooterWrap = new intFoot(document.querySelector('.intFooter'));
  };
})();
