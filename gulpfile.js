var fs = require('fs');
var gulp = require('gulp');
var del = require('del');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var jsdoc2md = require('gulp-jsdoc-to-markdown');

// dir vars
var srcRoot = 'lib/';
var src = srcRoot + 'mochila.js';
var dest = 'dist/';

// tasks
gulp.task('docs', function(){
    return gulp.src(src)
        .pipe(concat('README.md'))
        .pipe(jsdoc2md({
            template: fs.readFileSync('./readme.hbs', 'utf8')
        }))
        .on('error', function(err){
            console.error(err.message);
        })
        .pipe(gulp.dest('.'));
});

gulp.task('clean', function(cb) {
    del(dest, cb);
});

gulp.task('build:global', ['clean'], function() {
    return gulp.src(src)
        .pipe(babel({
            modules: 'ignore',
            experimental: 2,
        }))
        .on('error', function (err) { console.error(err.toString()); this.emit('end'); })
        .pipe(rename({suffix:'.global'}))
        .pipe(gulp.dest(dest))
        .pipe(uglify())
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest(dest));
});

gulp.task('build:amd', ['clean'], function() {
    return gulp.src(src)
        .pipe(babel({
            modules: 'amd',
            moduleIds: true,
            sourceRoot: __dirname + '/' + srcRoot,
            moduleRoot: null,
            experimental: 2,
        }))
        .on('error', function (err) { console.error(err.toString()); this.emit('end'); })
        .pipe(rename({suffix:'.amd'}))
        .pipe(gulp.dest(dest))
        .pipe(uglify())
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest(dest));
});

gulp.task('build:commonjs', ['clean'], function() {
    return gulp.src(src)
        .pipe(babel({
            modules: 'common',
            experimental: 2,
        }))
        .on('error', function (err) { console.error(err.toString()); this.emit('end'); })
        .pipe(rename({suffix:'.commonjs'}))
        .pipe(gulp.dest(dest))
        .pipe(uglify())
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest(dest));
});

gulp.task('default', ['docs', 'build:global', 'build:amd', 'build:commonjs']);
