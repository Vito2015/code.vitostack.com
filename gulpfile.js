
var gulp = require('gulp');
var plugins = {
        minifyCss: require('gulp-minify-css'),
        minifyHtml : require('gulp-minify-html'),
        uglify : require('gulp-uglify'),
        rename : require('gulp-rename'),
        clean : require('gulp-clean'),
        shell : require('gulp-shell')
};


// 清理任务
gulp.task("clean",function() {
    return gulp.src("./dst/*")
    .pipe(plugins.clean());           //plugins为加载的gulp-load-plugins插件,它可以自动加载项目依赖(package.json定义)
});

// 压缩css
gulp.task("css",function() {
    return gulp.src(["public/**/*.css","!public/**/*.min.css"])
    .pipe(plugins.minifyCss({compatibility: "ie8"}))
    .pipe(gulp.dest("./dst/"));
});

// 压缩js
gulp.task("js",function() {
    return gulp.src(["public/**/*.js","!public/**/*.min.js"])
    .pipe(plugins.uglify())
    .pipe(gulp.dest("./dst/"));
});

// 压缩html
gulp.task("html",function() {
    return gulp.src("public/**/*.html")
    .pipe(plugins.minifyHtml())
    .pipe(gulp.dest("./dst/"));
});

// 默认任务
gulp.task("default",["css","js","html"],function() {
    console.log("gulp task finished!");
});

// 文件监听
gulp.task("watch",function() {
    gulp.watch("public/*",["default"]);
});

// 代码替换
gulp.task("mv",function() {
    return gulp.src("./dst/*")
    .pipe(plugins.shell([
        "cp -r ./dst/* ./public/"
    ]));
});