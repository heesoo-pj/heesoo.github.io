;(function() {
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
      if (typeof this !== 'function') {
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }
      var aArgs = Array.prototype.slice.call(arguments, 1);
      var fToBind = this;
      var fNOP = function() {};
      var fBound = function() {
        return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
  }

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

  function MetaClass(target, metaService, metaContainerWidth, metaCompatibility) {
    this.target = target;
    if (!this.target) {
      return;
    }
    this.metaService = metaService;
    this.metaContainerWidth = metaContainerWidth;
    this.metaCompatibility = metaCompatibility;
    this.getMetaClass = function() {
      var target = this.target;

      var metaServiceLists = [
        'interpark',
        'shopping',
        'book',
        'ticket',
        'tour',
        'ipss'
      ];

      var metaService = metaServiceLists.indexOf(this.metaService) < 0 ? 'interpark' : this.metaService;
      var metaContainerWidth = this.metaContainerWidth === '1280' ? '1280' : '980';
      var metaCompatibility = this.metaCompatibility === 'nonStandard' ? 'nonStandard' : 'standard';

      var metaServiceClass = metaService + 'Footer';
      var metaContainerWidthClass = 'container' + metaContainerWidth;
      var metaCompatibilityClass = metaCompatibility + 'Footer';
      var thisClass = this.target.getAttribute('class');
      var totalMetaClass = metaServiceClass + ' ' + metaContainerWidthClass + ' ' + metaCompatibilityClass;

      target.setAttribute('class', thisClass !== null && thisClass !== undefined ? thisClass + ' ' + totalMetaClass : totalMetaClass);
    };

    this.getMetaClass();
  }

  function INTSelect(container, classname) {
    this.container = container;
    if (!this.container) {
      return;
    }
    this.button = this.container.querySelector('.intFooterSelectPoint');
    this.options = container.querySelectorAll('a');
    this._classname = classname;
    this._isOpened = false;
    this.handleWindowClick = function() {
      if (this._isOpened) {
        var target = window.event.target || window.event.srcElement;
        while (target !== undefined && target.parentNode) {
          if (target === this.container) {
            return false;
          }
          target = target.parentNode;
        }
        this.toggleClose();
      }
    };

    this.toggleOpen = function() {
      this._isOpened = true;
      this.container.setAttribute('class', this.container.getAttribute('class') + ' ' + this._classname);
      if (window.addEventListener) {
        window.addEventListener('click', this.handleWindowClick.bind(this));
      } else {
        document.attachEvent('onclick', this.handleWindowClick.bind(this));
      }
    };

    this.toggleClose = function() {
      this._isOpened = false;
      this.container.setAttribute('class', this.container.getAttribute('class').replace(' ' + this._classname, ''));
      if (window.removeEventListener) {
        window.removeEventListener('click', this.handleWindowClick);
      } else {
        document.detachEvent('onclick', this.handleWindowClick);
      }
    };

    this.toggle = function() {
      if (this._isOpened) {
        this.toggleClose();
      } else {
        this.toggleOpen();
      }
    };

    this.setValue = function(value) {
      this.button.innerText = value;
    };

    if (this.button.addEventListener) {
      this.button.addEventListener('click', function() {
        this.toggle();
        return false;
      }.bind(this));
    } else {
      this.button.attachEvent('onclick', function() {
        this.toggle();
        return false;
      }.bind(this));
    }

    for (var i = 0; i < this.options.length; i++) {
      if (this.options[i].addEventListener) {
        this.options[i].addEventListener('click', function(e) {
          e.preventDefault();
          this.setValue(e.target.innerText);
          this.toggleClose();
          window.open(e.target.href);
        }.bind(this));
      } else {
        this.options[i].attachEvent('onclick', function(e) {
          e.returnValue = false;
          this.setValue(e.srcElement.innerText);
          this.toggleClose();
          window.open(e.srcElement.href);
        }.bind(this));
      }
    }
  }

  if (document.readyState === 'complete') {
    domReady();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', domReady);
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState === 'complete') {
        domReady();
      }
    });
  }

  function domReady() {
    var metaClass = new MetaClass(document.getElementById('intFooter'), metaInfo.service, metaInfo.containerWidth, metaInfo.compatibility);
    var intSelect = new INTSelect(document.querySelector('.intFooterSelect'), 'active');
  }
})();
