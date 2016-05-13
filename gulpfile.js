// Gulp file to run tasks

// MAIN GULP FUNCTION

// gulp
// gulp default(ran by default using just "gulp")
// Hosts a server using development files
// Watches scss/html/js files for changes and reloads browsers upon changes
// compiles sass to css and refreshes development server

// gulp clean:cache 
// Cleans image cache

// gulp clean:dist
// Cleans production files

// gulp build
// Cleans production files
// Compiles sass into css
// Minify/Concatenates js/css files
// Optimizes/Compresses Images
// Moves font files to dist(production) folder
// Moves all other files into dist(production) folder

// gulp build:server
// Runs gulp build
// Hosts a server via browser-sync

// Node module requirements
var gulp        = require('gulp');

// Used to compile scss/sass to css
var sass        = require('gulp-sass');

// Used to refresh browsers upon change and host server for static site
var browserSync = require('browser-sync').create();

// Used to concatenate js/css files (configure which ones in the html files themselves)
var useref      = require('gulp-useref');

// Used to minify js files
var uglify      = require('gulp-uglify');

// Used to only run gulp tasks under certain conditions
var gulpIf     = require('gulp-if');

// Used to minify css files
var cssnano     = require('gulp-cssnano');

// Used to compress/optimize images
var imagemin    = require('gulp-imagemin');

// Used to cache images so they aren't recompressed unnecessarily
var cache       = require('gulp-cache');

// Used to clean up files before the gulp tasks are ran
var del         = require('del');

// Used to run tasks synchronously
var runSync     = require('run-sequence');

// Source maps for debugging live css/js
var sourcemaps  = require('gulp-sourcemaps');

// Auto prefixer for css prefixes
var autoprefixer = require('gulp-autoprefixer');

// Used to render nunjucks templating language files as html
var nunjucksRender = require('gulp-nunjucks-render');

// Used pipe json data into nunjucks template pages
var dataPipe = require('gulp-data');

// Used to sync local changes to deployment server
var rsync  = require('gulp-rsync');

// config file
// TODO: migrate current settings to config file
var config = require('./gulp-config.js')

// ======================== Gulp Tasks Examples ===============================

// Example Gulp Task ==========================================================

// gulp.task('task-name', function() {
//   // stuff goes here
//   console.log('test gulp task')
// });

// Example detailed gulp task =================================================

// gulp.task('task-name-detail', function() {
//   return gulp.src('source-files') // Get source files from source-files folder
//     .pipe(aGulpPlugin()) // Run a gulp plugin on the files(with optional options)
//     .pipe(gulp.dest('dist')) // output changed files to dist folder
// })

// Example Watch task =========================================================

// Watches the first argument and then runs the array of tasks if files are changed
// in the first argument

// gulp.watch('files-to-watch', ['tasks', 'to', 'run']);

// Example Watch task with requirements =======================================

// gulp.task('watch', ['tasks', 'to', 'run', 'before', 'watch'], function() {
//  watch task here
// 
// })

// ============================== End Examples ================================

// ============================== Config Options ==============================

// Input directory
var devDir = 'app';

// Output production directory
var prodDir = 'dist';

// sass compiling options
var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

// sass production options
var sassProdOptions = { outputStyle: 'compressed' };

// Source maps destination(relative to sass files), optional
var sMapOutput = './maps'

// Development paths for all the main html/js/sass/scss and image files
var cssPath  = './app/**/*.css';

// original variable compiles all sass files
// new variable only compiles main.scss which imports all other files anyways
// var sassPath = './app/scss/**/*.+(scss|sass)';
var sassPath = './app/scss/main.+(scss|sass)'

var htmlPath = './app/*.html';
var jsPath   = './app/js/**/*.js';
var imgPath  = './app/images/**/*.+(jpg|jpeg|png|svg|gif)';
var fontsPath = './app/fonts/**/*';
var nunjucksPath = './app/pages/**/*.+(html|nunjucks)';
var nunjucksTemplatePath = './app/templates/**/*.+(html|nunjucks)';

// Production Paths
var outputImgPath = './dist/images'
var outputFontsPath = './dist/fonts'


// Nunjucks Render options
var nunjucksOptions = {
  // Path to set where to look for templates
  path: ['app/templates'],
}

// Data to pipe into nunjucks pages
var dataPipePath = './app/data.json';

// Imagemin optimization options
var imageminOptions = {
  optimizationLevel : 3,     // default of 3, range 1-7
  progressive       : true, // jpg, progressive conversoin vs lossless(false) by default
  interlaced        : true, // gif, Interlace gif for progressive rendering
  multipass         : false, // svg, Optimize svg multiple times until it's fully optimized.
};

// Autoprefixer options
// Defaults:
// Browsers with over 1% market share,
// Last 2 versions of all browsers,
// Firefox ESR,
// Opera 12.1
// More info here
// https://github.com/ai/browserslist#queries
var autoprefixerOptions = {
   browsers: ['last 2 versions', '> 2%', 'Firefox ESR']
}


// ============================== End Options ================================

// Renders nunjucks files
// Sets "main" directory for nunjucks pages so paths to get partials/macros
// is set to app/templates
gulp.task('nunjucks', function() {
  return gulp.src(nunjucksPath)

  // Pipe json data to nunjucks templates
  .pipe(dataPipe(function() {
    return require(dataPipePath)
  }))

  // render templates with nunjucks
  .pipe(nunjucksRender(nunjucksOptions))

  // outputs files to app folder
  .pipe(gulp.dest('app/'))

  // Reloads browsersync
  .pipe(browserSync.reload({ // browserSync reloads the browser/devices
      stream: true
    }))
});

// Compiles scss into css for development folder
// adds source maps
// adds vendor prefixes automatically
// reloads browsersync
// More options here:
// https://github.com/sass/node-sass#options
gulp.task('sass', function() {
  // Matches any scss/sass files in the scss directory and its child directories
  return gulp.src(sassPath)
    .pipe(sourcemaps.init()) // initialize sourcemaps
    .pipe(sass(sassOptions).on('error', sass.logError)) // convert to css from sass
    .pipe(sourcemaps.write()) // write source maps inline(by default) or to relative path of gulp.dest
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest('app/css')) // output to app/css folder
    .pipe(browserSync.reload({ // browserSync reloads the browser/devices
      stream: true
    }))
});

// compile sass without source maps
gulp.task('sassProd', function() {
  // Matches any scss/sass files in the scss directory and its child directories
  return gulp.src(sassPath)
    .pipe(sass(sassProdOptions)) // convert to css from sass
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest('app/css')) // output to app/css folder
    .pipe(browserSync.reload({ // browserSync reloads the browser/devices
      stream: true
    }))
});


// Main watch function, to watch multiple files and run multiple tasks
// Run browserSync before watching files for changes
// Run Sass before starting to watch for changes 
gulp.task('watch', ['browserSync', 'sass'], function() {

  // Watches the scss directory for changes and runs the sass task
  gulp.watch(sassPath, ['sass']);

  // Watch html/js files for changes and reloads the browser
  gulp.watch(nunjucksPath, ['nunjucks']);
  gulp.watch(nunjucksTemplatePath, ['nunjucks']);
  // If using nunjucks, editing plain html isn't needed
  // gulp.watch(htmlPath, browserSync.reload);
  gulp.watch(jsPath, browserSync.reload)
  
  // log a message in the console on change
  .on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });

});

// Browser sync server/auto refresh browsers and devices
// More options here
// https://www.browsersync.io/docs/gulp/
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: devDir
    },
  })
});

// Browser sync server for production files
gulp.task('browserSyncDist', function() {
  console.log('running dist server');
  browserSync.init({
    server: {
      baseDir: prodDir
    },
  })
});

// Gets the js and css files linked in all the html files under app
// concatenates them and outputs them to the production folder(dist)
// under dist/js/main.min.js and dist/css/styles.min.css
//
// Also, turns the js and css comment block links in html into 
// a single js and css file requirement
// 
// More options here
// 
// js minify
// https://github.com/jonkemp/gulp-useref
// 
// css minify
// https://www.npmjs.com/package/gulp-cssnano
gulp.task('minify', function() {
  return gulp.src(htmlPath)
    .pipe(useref())
    // Only uglifies/minifies if it's a js file
    .pipe(gulpIf('*.js', uglify()))

    // Only uglifies/minifies if it's a css file
    .pipe(gulpIf('*.css', cssnano()))

    // outputs to dist/production folder
    .pipe(gulp.dest(prodDir))
});

// Optimize/compress images using gulp-imagemin
// Outputs the files to production images folder
// 
// More info here
// https://github.com/sindresorhus/gulp-imagemin
gulp.task('images', function() {
  // Gets all the images files in the images folder
  return gulp.src(imgPath)

    // uses gulp-imageMin to optimize/compress images
    // Currently set to default values of false/3
    // Cache makes sure imagemin is only ran on changed files
    .pipe(cache(imagemin(imageminOptions)))

    // Outputs to the production images folder
    .pipe(gulp.dest(outputImgPath))
});

// auto prefixer to add css prefixes
// https://github.com/ai/browserslist#queries
gulp.task('prefix', function() {
  gulp.src(cssPath)
})


// Transfer font files from dev to production
gulp.task('fonts', function() {
  return gulp.src(fontsPath)
    .pipe(gulp.dest(outputFontsPath))
});

// Delete production files before tasks are ran
gulp.task('clean:dist', function() {
  return del.sync(prodDir)
});

// Used to clear images cache on local filesystem
gulp.task('clean:cache', function (cb) {
  return cache.clearAll(cb)
});


// Build system, cleans production folder, compiles nunjucks files,minify/concat files, compile sass
// optimize images, move fonts from dev to production folder
gulp.task('build', function(callback) {
  // runSync used to clean dist folder FIRST THEN moves all files there
  // css files need to be compiled first THEN html generated THEN minification
  runSync('clean:dist', 'sassProd', 'nunjucks',
    ['minify', 'images', 'fonts'], 
    callback)
});

// Build everything to production then run a server using the production files
gulp.task('build:server', function(callback) {
  // runSync used to clean dist folder FIRST THEN moves all files there
  runSync('clean:dist', 'sassProd', 'nunjucks',
    ['minify', 'images', 'fonts'], 
    'browserSyncDist', 
    callback)
});

gulp.task('build:deploy', function(callback) {
  runSync('clean:dist',
    ['nunjucks', 'sassProd', 'minify', 'images', 'fonts'], 
    'rsync', 
    callback)
})


// Copy files and folder to server
// via rsync
// prompts for password
gulp.task('rsync', function() {
  return gulp.src(config.rsync.src)
    .pipe(rsync(config.rsync.options));
});

// Default function that runs browsersync and watches for changes
// Ran by default if calling "gulp" without any arguments
gulp.task('default', function(callback) {
  runSync(['nunjucks', 'sass', 'browserSync', 'watch'],
    callback)
});