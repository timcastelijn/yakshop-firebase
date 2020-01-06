var gulp  = require('gulp')
var gutil = require('gulp-util');
var ftp   = require('vinyl-ftp');

var credentials = require('./credentials.js');

// file regex using minimatch
var globs = [
  'build/**',
  '!build/logfiles/**',
];


//Gulp APP ftp deploy
gulp.task('deploy-dev', function () {

    var conn = ftp.create({
        host: 'ftp.thenewmakers.com',
        user: credentials.username,
        password: credentials.password,
        parallel: 10,
        log: gutil.log
    });

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance
    return gulp.src(globs, { base: './build', buffer: false })
        .pipe(conn.newer('/public_html/tnmoffice-dev')) // only upload newer files
        .pipe(conn.dest('/public_html/tnmoffice-dev'));
});
