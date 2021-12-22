var path = require('path');
var fs = require('fs');
var os = require('os');
var express = require('express');
var app = express();
var glob = require('glob');
var ejs = require('ejs');
var matter = require('gray-matter');
var mime = require('mime-types');
var sassMiddleware = require('node-sass-middleware');
var beautify = require('js-beautify');
var autoprefixer = require('autoprefixer');
var postcssMiddleware = require('postcss-middleware');
var ejsFilters = require('./config/filters');
var exec = require('child_process').exec;

global.site = require('./package.json');
global.src = path.join(__dirname, site.base.src);
global.dist = path.join(__dirname, site.base.dist);

var banner = require('./config/banner')(site, 'dev');
var defaultLanguage = 'ko';
var isMultiLang = false;

site.languages = site.languages || [defaultLanguage];
site.languages = [].concat.apply([], [site.languages]);

if (site.languages.length > 1) {
  isMultiLang = true;
  defaultLanguage = site.languages[0];
  site.languages.push('keyCode');
}

var langsWithPipe = site.languages.join('|');

app.set('port', process.env.npm_config_port || site.port);

var lastUpdatedDate;
exec('git log --pretty=format:\'%cD\' -1', function(error, stdout) {
  if (error !== null) {
    return;
  }

  var d = new Date(stdout);
  var date = [
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate()
  ].join('. ');

  var time = [
    d.getHours(),
    d.getMinutes()
  ].join(':');

  lastUpdatedDate = date + ' ' + time;
});

app.get('/', function(req, res, next) {
  var indexPath = path.join(src, 'index.ejs');
  var indexFmObj = matter.read(indexPath);
  var indexFm = indexFmObj.data;
  var indexContent = indexFmObj.content;
  var indexGroup = indexFm.groups;
  var groupsProps = Object.keys(indexGroup);
  var dir = 'views';

  var ejsOption = {
    root: src,
    outputFunctionName: 'echo'
  };

  var pages = glob.sync(dir + '/**/pages/**/[^_]*.ejs', {
    cwd: src,
    nosort: true,
    nodir: true
  });

  var indexData = {
    pkgInfo: site,
    lastUpdatedDate: lastUpdatedDate,
    list: groupsProps.reduce(function(obj, group) {
      obj[group] = {
        name: indexGroup[group],
        pages: []
      };

      return obj;
    }, {})
  };

  pages.forEach(function(page) {
    var pathObj = path.parse(page);
    var fullPath = path.join(src, page);
    var srcPath = '/' + pathObj.dir + '/' + pathObj.name;
    var token = srcPath.replace(/\//g, '-').slice(1);
    var pageFmObj = matter.read(fullPath);
    var pageFm = pageFmObj.data;
    var indexGroup = pageFm.indexGroup;
    var pageName = pageFm.pageName || srcPath;
    var states = Object.assign({
      'default': pageName + ' 기본'
    }, (pageFm.state || {}));

    if (!indexGroup || !indexGroup in indexData.list || !indexData.list[indexGroup]) {
      return;
    }

    var pageData = Object.keys(states).reduce(function(before, state) {
      var isDefault = state === 'default';
      var isUnexposedPage = states[state][0] === '_';
      var stateName = isUnexposedPage ? states[state].substr(1) : states[state];

      site.languages.forEach(function(lang) {
        var stateData = {
          text: stateName,
          token: token,
          href: srcPath,
          unexposed: isUnexposedPage
        };

        if (!isDefault) {
          stateData.token += '-' + state;
          stateData.href += '.' + state;
        }

        if (isMultiLang) {
          stateData.text += ' (' + lang + ')';
          stateData.token += '-' + lang;
          stateData.href = stateData.href.replace(
            new RegExp('^\/' + dir),
            '/' + dir + '/' + lang
          );
        }

        stateData.href += '.html';
        before.states = before.states.concat(stateData);
      });

      return before;
    }, {
      states: []
    });

    pageData.name = pageName;
    pageData.path = srcPath;
    indexData.list[indexGroup].pages.push(pageData);
  });

  var render = ejs.render(indexContent, indexData, ejsOption);
  var beautified = beautify.html(render, site.htmlBeautify);
  res.end(beautified);
});

app.get('/views/:lang(' + langsWithPipe + ')?/**/?*.html', function(req, res, next) {
  var lang = req.params.lang;
  var pathObj = path.parse(req.path);

  if (isMultiLang && lang) {
    pathObj.dir = pathObj.dir.replace(new RegExp('^(\/views\/)' + lang), '$1');
  }

  if (!lang) {
    lang = defaultLanguage;
  }

  var fileState = pathObj.name.split('.');
  var targetFile = fileState[0];
  var targetPath = path.join(src, pathObj.dir, targetFile + '.ejs');
  var ejsOption = {
    root: path.join(src, 'views'),
    outputFunctionName: 'echo'
  };

  var loadData = function(dataPath) {
    var fileFullPath = path.join(__dirname, dataPath);
    var basename = path.basename(dataPath);
    var extname = path.extname(dataPath);
    var parsedStr;

    if (extname !== '.json') {
      console.log(basename + ' is not JSON file.');
      return;
    }

    if (fs.existsSync(fileFullPath)) {
      parsedStr = JSON.parse(fs.readFileSync(fileFullPath));
    } else {
      console.log(dataPath + ' file does not exist.');
      return;
    }

    return parsedStr;
  };

  var setProp = function Prop(obj, is, value) {
    if (typeof is === 'string') {
      is = is.split('.');
    }

    if (is.length === 1 && value !== undefined) {
      return (obj[is[0]] = value);
    } else if (is.length === 0) {
      return obj;
    } else {
      var prop = is.shift();

      if (value !== undefined && obj[prop] === undefined) {
        obj[prop] = {};
      }

      return setProp(obj[prop], is, value);
    }
  };

  var replacer = function(str, obj) {
    return str.replace(/\$\{(.+?)\}/g, function(match, p1) {
      return setProp(obj, p1);
    });
  };

  var i18n = function(keyCode, textObj, data) {
    if (lang === 'keyCode') {
      return '{{' + keyCode + '}}';
    }

    if (!(lang in textObj)) {
      return '\'' + lang + '\' property is not exist.';
    }

    data = data || {};
    return replacer(textObj[lang], data);
  };

  fs.readFile(targetPath, function(err, data) {
    var fm;
    var renderData;
    var htmlString;
    var beautified;

    if (err) {
      next();
    } else {
      fm = matter(data.toString());
      renderData = {
        site: site,
        page: fm.data,
        state: fileState[1] || 'default',
        data: {},
        loadData: loadData,
        $: ejsFilters(),
        lang: lang === 'keyCode' ? defaultLanguage : lang,
        i18n: i18n
      };

      ejsOption.filename = targetPath;

      if (fm.data.data && Object.keys(fm.data.data).length) {
        fm.data.data.forEach(function(filePath) {
          var fileName = path.basename(filePath, '.json');
          var fileFullPath = path.join(__dirname, filePath);
          var parsedStr;

          if (fs.existsSync(fileFullPath)) {
            parsedStr = fs.readFileSync(fileFullPath);
            renderData.data[fileName] = JSON.parse(parsedStr);
          }
        });
      }

      res.set('Content-Type', 'text/html');
      htmlString = ejs.render(fm.content, renderData, ejsOption);
      beautified = beautify.html(htmlString, site.htmlBeautify);
      res.end(beautified);
    }
  });
});

app.get('/data/**/*/?*', function(req, res, next) {
  var targetPath = path.join(__dirname, req.path);
  var mimeType = mime.contentType(targetPath);

  fs.readFile(targetPath, function(err, data) {
    if (err) {
      next();
    } else {
      res.set('Content-Type', mimeType);
      res.send(data);
    }
  });
});

app.use(sassMiddleware({
  src: path.join(src, 'styles'),
  dest: path.join(dist, 'styles'),
  prefix: '/styles',
  outputStyle: 'expanded',
  force: true,
  response: false,
  maxAge: 0,
  sourceMapContents: true,
  sourceMapEmbed: true,
  includePaths: [
    path.join(src, 'styles')
  ]
}));

app.use('/styles', postcssMiddleware({
  plugins: [
    autoprefixer({
      remove: false,
      cascade: false
    }),
    function(root, result) {
      var first = root.first;
      var hasCharset = first.type === 'atrule' && first.name === 'charset';
      var cssBanner = '/*!' + banner + '*/';

      if (hasCharset) {
        root.first.after('\n' + cssBanner);
      } else {
        root.prepend(cssBanner);
      }
    }
  ],
  options: {
    map: {
      inline: true
    }
  },
  src: function(req) {
    return path.join(dist, 'styles', req.url);
  }
}));

app.use('/scripts', express.static(path.join(src, 'scripts')));
app.use('/images', express.static(path.join(src, 'images')));
app.use('/fonts', express.static(path.join(src, 'fonts')));
app.use('/styles', express.static(path.join(dist, 'styles')));

app.listen(app.get('port'), function() {
  var ifaces = os.networkInterfaces();
  var ip;

  Object.keys(ifaces).forEach(function(dev) {
    ifaces[dev].filter(function(details) {
      if (details.family === 'IPv4' && details.internal === false) {
        ip = details.address;
      }
    });
  });

  console.info('server started http://' + ip + ':' + app.get('port'));
});
