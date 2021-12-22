var gulp = require('gulp');
var log = require('fancy-log');
var chalk = require('chalk');
var gulpLoadPlugins = require('gulp-load-plugins');
var autoprefixer = require('autoprefixer');
var path = require('path');
var url = require('url');
var del = require('del');
var fs = require('fs');
var argv = require('yargs').argv;
var exec = require('child_process').exec;

var $ = gulpLoadPlugins();
var site = JSON.parse(fs.readFileSync('./package.json'));
var ejsFilters = require('./config/filters');
var asciiIntro = require('./config/asciiIntro')(site);
var banner = require('./config/banner')(site, argv.preview ? 'preview' : '');
var base = site.base;
var defaultLanguage = 'ko';
var isMultiLang = false;

site.languages = site.languages || [defaultLanguage];
site.languages = [].concat.apply([], [site.languages]);

if (site.languages.length > 1) {
  isMultiLang = true;
  defaultLanguage = site.languages[0];
  site.languages.push('keyCode');
}

console.info(asciiIntro);
var isTestMode = !!argv.testonly;

if (isTestMode) {
  log.info(chalk.red('This mode is intended for testing purposes'));
}

var lastUpdatedDate;
exec('git log --pretty=format:\'%cD\' -1', function(error, stdout, stderr) {
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

function server() {
  $.connect.server({
    host: '0.0.0.0',
    root: base.dist,
    port: process.env.npm_config_port || site.port,
    livereload: false,
    middleware: function(connect, opt) {
      return [
        function(req, res, next) {
          var reqUrlPathname = url.parse(req.url).pathname;
          var reqPathObj = path.parse(reqUrlPathname);

          if (req.method === 'GET' && reqPathObj.ext === '.html') {
            res.setHeader('Content-Type', 'text/html');
          }

          next();
        }
      ];
    }
  });
}

function scripts() {
  var dir = 'scripts';
  var stream = gulp
    .src([
      '**/*.js',
      '!{libs,plugins}/**/*.js'
    ], {
      cwd: path.join(base.src, dir)
    })
    .pipe($.eslint())
    .pipe($.eslint.format());

  if (isTestMode) {
    stream = stream
      .pipe($.eslint.failAfterError());
  } else {
    stream = stream
      .pipe(gulp.dest(path.join(base.dist, dir)));
  }

  return stream;
}

function styles() {
  var dir = 'styles';
  var opts = {
    banner: '/*!' + banner + '*/',
    scss: {
      outputStyle: argv.cssstyle || 'expanded',
      includePaths: path.join(base.src, dir)
    },
    postcss: [
      autoprefixer({
        remove: false,
        cascade: false
      })
    ]
  };

  var sassVars = Object.keys(argv).reduce(function(result, key) {
    var prefix = 'sassvar_';
    var regex = new RegExp('^' + prefix, 'i');
    var sassProp;

    if (regex.test(key)) {
      sassProp = key.replace(regex, '');
      sassProp = sassProp[0] === '$' ? sassProp : '$' + sassProp;
      result.push(sassProp + ': "' + argv[key] + '";');
    }

    return result;
  }, []).join('\n');

  var stream = gulp
    .src('**/*.scss', {
      cwd: path.join(base.src, dir)
    })
    .pipe($.sassLint())
    .pipe($.sassLint.format());

  if (isTestMode) {
    stream = stream
      .pipe($.sassLint.failOnError());
  }

  if (sassVars) {
    sassVars.split('\n').forEach(function(vars) {
      log.info('Injected Sass variable ' + chalk.yellow(vars));
    });

    stream = stream
      .pipe($.header(sassVars));
  }

  if (!isTestMode) {
    stream = stream
      .pipe($.header(opts.banner));
  }

  stream = stream
    .pipe($.sass(opts.scss).on('error', $.sass.logError));

  if (!isTestMode) {
    stream = stream
      .pipe($.postcss(opts.postcss))
      .pipe(gulp.dest(path.join(base.dist, dir)));
  }

  return stream;
}

function images() {
  var dir = 'images';

  return gulp
    .src('**/*.{png,jpg,jpeg,gif,svg,ico}', {
      cwd: path.join(base.src, dir)
    })
    .pipe(gulp.dest(path.join(base.dist, dir)));
}

function fonts() {
  var dir = 'fonts';

  return gulp
    .src('**/*.{ttf,otf,eot,woff,woff2}', {
      cwd: path.join(base.src, dir)
    })
    .pipe(gulp.dest(path.join(base.dist, dir)));
}

function html() {
  var dir = 'views';
  var lintCfg = site.htmlhint;

  var opts = {
    frontMatter: {
      property: 'fm',
      remove: true
    },
    prettify: site.htmlBeautify
  };

  var htmlVars = Object.keys(argv).reduce(function(result, key) {
    var prefix = 'htmlvar_';
    var regex = new RegExp('^' + prefix, 'i');

    if (regex.test(key)) {
      prop = key.replace(regex, '');
      result[prop] = argv[key];

      log.info(
        'Injected HTML variable ' +
        chalk.yellow('{' + prop + ': "' + argv[key] + '"}')
      );
    }

    return result;
  }, {});

  var indexData = {};
  var generatePages = function(page) {
    var pageFm = page.fm;
    var charset = pageFm.charset || 'utf-8';
    var isCustomEncode = charset.toLowerCase() !== 'utf-8';
    var basePath = path.resolve(page.cwd, base.src);
    var srcPath = page.path.replace(basePath, '')
      .replace(/\.[^/\\.]+$/, '')
      .split(path.sep)
      .join('/');

    var token = srcPath.replace(/\//g, '-').slice(1);
    var isPartialPage = path.basename(srcPath).substring(0, 2) === '__';
    var pageName = pageFm.pageName || srcPath;
    var dataPaths = pageFm.data;
    var dataPath;
    var contentData = {};

    if (Object.keys(htmlVars).length) {
      Object.assign(pageFm, htmlVars);
    }

    var states = Object.assign({
      'default': pageName + ' 기본'
    }, (pageFm.state || {}));

    if (pageFm.indexGroup) {
      indexData[pageFm.indexGroup] = indexData[pageFm.indexGroup] || {
        pages: []
      };
    } else {
      if (!isPartialPage) {
        log(chalk.red('"indexGroup" is not defined: ') + srcPath);
      }
    }

    if (dataPaths) {
      if (!Array.isArray(dataPaths)) {
        dataPaths = [dataPaths];
      }
    } else {
      dataPaths = [];
    }

    for (var i = 0, len = dataPaths.length; i < len; i++) {
      dataPath = path.join(__dirname, dataPaths[i]);

      if (!fs.existsSync(dataPath)) {
        continue;
      }

      delete require.cache[require.resolve(dataPath)];
      contentData[path.parse(dataPath).name] = require(dataPath);
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

    if (pageFm.indexGroup) {
      indexData[pageFm.indexGroup].pages.push(pageData);
    }

    site.languages.forEach(function(lang) {
      var distDir = isMultiLang ? path.join(dir, lang) : dir;

      Object.keys(states).forEach(function(state) {
        var isDefault = state === 'default';
        var listOpts = {
          src: {
            base: path.join(base.src, dir)
          },
          ejs: {
            root: path.join(__dirname, base.src, dir),
            outputFunctionName: 'echo'
          },
          rename: {
            extname: (isDefault ? '' : '.' + state) + '.html'
          },
          convertEncoding: {
            to: charset
          }
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

        var listData = {
          site: site,
          page: pageFm,
          state: state,
          data: contentData,
          loadData: loadData,
          $: ejsFilters(),
          lang: lang === 'keyCode' ? defaultLanguage : lang,
          i18n: i18n
        };

        var stream = gulp
          .src(page.path, listOpts.src)
          .pipe($.frontMatter(opts.frontMatter))
          .pipe($.ejs(listData, listOpts.ejs))
          .pipe($.rename(listOpts.rename));

        if (!isPartialPage) {
          stream = stream
            .pipe($.htmlhint(lintCfg))
            .pipe($.htmlhint.reporter());

          if (isTestMode) {
            stream = stream
              .pipe($.htmlhint.failOnError());
          }
        }

        if (!isTestMode) {
          stream = stream
            .pipe($.prettify(opts.prettify));

          if (isCustomEncode) {
            stream = stream
              .pipe($.convertEncoding(listOpts.convertEncoding));
          }

          if (isPartialPage) {
            stream = stream
              .pipe($.rename(function(path) {
                path.basename = path.basename.replace(/^__/, '');
              }));
          }

          stream = stream
            .pipe(gulp.dest(path.join(base.dist, distDir)));
        }

        return stream;
      });
    });
  };

  var generateIndex = function(file) {
    var indexOpts = {
      ejs: {
        root: path.join(__dirname, base.src, dir),
        outputFunctionName: 'echo'
      },
      rename: {
        extname: '.html'
      }
    };

    var getIndexData = function(index) {
      var indexFm = index.fm;
      var groups = indexFm.groups;

      Object.keys(groups).forEach(function(group) {
        if (indexData[group]) {
          groups[group] = {
            name: groups[group]
          };

          Object.assign(groups[group], indexData[group]);
        } else {
          log(chalk.red(
            'group name is not found ') +
            group + ': ' + groups[group]
          );
        }
      });

      indexFm.list = groups;
      indexFm.pkgInfo = site;
      indexFm.lastUpdatedDate = lastUpdatedDate;

      return indexFm;
    };

    var stream = gulp
      .src('index.ejs', {
        cwd: base.src
      })
      .pipe($.frontMatter(opts.frontMatter))
      .pipe($.data(getIndexData))
      .pipe($.ejs(null, indexOpts.ejs))
      .pipe($.rename(indexOpts.rename))
      .pipe($.htmlhint(lintCfg))
      .pipe($.htmlhint.reporter());

    if (isTestMode) {
      stream = stream
        .pipe($.htmlhint.failOnError());
    } else {
      stream = stream
        .pipe($.prettify(opts.prettify))
        .pipe(gulp.dest(base.dist));
    }

    return stream;
  };

  return gulp
    .src([
      path.join(base.src, dir, '**/*.ejs'),
      path.join('!' + base.src, dir, '**/_!(_)*.ejs'),
      path.join('!' + base.src, dir, 'layouts/**/*.ejs')
    ], {
      nosort: true
    })
    .pipe($.frontMatter(opts.frontMatter))
    .pipe($.data(generatePages))
    .pipe($.pluck('fm'))
    .pipe($.data(generateIndex));
}

function statics() {
  return gulp
    .src([
      'styles/**/*.css',
      'scripts/{libs,plugins}/**/*.js'
    ], {
      base: base.src,
      cwd: base.src
    })
    .pipe(gulp.dest(base.dist));
}

function data_texts() {
  var dir = 'texts';

  return gulp
    .src('**/*.json', {
      cwd: path.join(base.data, dir)
    })
    .pipe(gulp.dest(path.join(base.dist, base.data, dir)));
}

function data_images() {
  var dir = 'images';

  return gulp
    .src('**/*.{png,jpg,jpeg,gif,svg,ico}', {
      cwd: path.join(base.data, dir)
    })
    .pipe(gulp.dest(path.join(base.dist, base.data, dir)));
}

function clean() {
  var opts = {
    force: true
  };

  return del(base.dist, opts);
}

var tasks = {
  normal: gulp.series(
    clean,
    gulp.parallel(
      html,
      styles,
      images,
      fonts,
      scripts,
      statics,
      data_images,
      data_texts
    )
  ),
  test: gulp.parallel(html, styles, scripts, fonts)
};

gulp.task('default', tasks[isTestMode ? 'test' : 'normal']);
gulp.task('server', server);
