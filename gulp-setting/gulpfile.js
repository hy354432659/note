var gulp 		= require('gulp'),
	browserSync = require('browser-sync').create(),
	reload      = browserSync.reload;
	plumber 	= require('gulp-plumber'),
	changed 	= require('gulp-changed'),
	sass 		= require('gulp-sass'),
	cssmin 		= require('gulp-clean-css'),
	autoprefix 	= require('gulp-autoprefixer'),
	uglify 		= require('gulp-uglify'),
	concat 		= require('gulp-concat'),
	imagemin 	= require('gulp-imagemin'),
	pngquant 	= require('imagemin-pngquant'),
	htmlmin 	= require('gulp-htmlmin');

function errrHandler(e) {
	console.log(e);
}

gulp.task('server', function () {
	var files = [
		'css/*.css',
		'js/*.js',
		'images/**/*.jpg',
		'images/**/*.png'
	];

	browserSync.init(files, {
		open: "external",
		host: '192.168.202.55',
		proxy: 'localhost/weiling/pc/html/',
		online: true
	});
});

gulp.task('css', function () {
	return gulp.src('./src/sass/**/*.scss')
			.pipe(changed('./css'))
			.pipe(plumber({errorHandler: errrHandler }))
			.pipe(sass())
			.pipe(autoprefix({
				browsers: ['> 1%']
			}))
			.pipe(cssmin({
				advanced: true,
				keepBreaks: false,
				keepSpecialComments: '*'
			}))
			.pipe(gulp.dest('./css'));
});

gulp.task('js', function () {
	return gulp.src('./src/js/**/*.js')
			.pipe(changed('./js'))
			.pipe(plumber({errorHandler: errrHandler }))
			// .pipe(concat('main.js'))
			.pipe(uglify())
			.pipe(gulp.dest('./js'))
			.pipe(reload({stream: true}));
});

gulp.task('htmlm', function () {
	var options = {
		removeComments: true,//清除HTML注释
		collapseWhitespace: false,//压缩HTML
		collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
		removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
		removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
		removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
		minifyJS: true,//压缩页面JS
		minifyCSS: true//压缩页面CSS
	};

	return gulp.src('./src/html/*.html')
			.pipe(changed('./html'))
			.pipe(plumber({errorHandler: errrHandler }))
			.pipe(htmlmin(options))
			.pipe(gulp.dest('./html'));
});

gulp.task('img', function () {
	return gulp.src('./src/images/**/*')
			.pipe(changed('./src/images'))
			// .pipe(imagemin({
			// 	optimizationLevel: 7,
			// 	progressive: true,
			// 	use: [pngquant()]
			// }))
			.pipe(gulp.dest('./images'))
			.pipe(reload({stream: true}));
});

gulp.task('watch', function(){
	gulp.watch('./src/sass/**/*.scss', ['css']);

	gulp.watch('./src/js/**/*.js', ['js']);

	gulp.watch("./src/html/*.html", ['htmlm']).on('change', reload);

	gulp.watch('./src/images/**/*', ['img']);
});

gulp.task('default', ['server', 'css', 'js', 'htmlm', 'img', 'watch']);