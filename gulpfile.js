var gulp         = require('gulp'), //включение модуля gulp
    sass         = require('gulp-sass'),
    browserSync  = require('browser-sync'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglifyjs'),
    cssnano      = require('gulp-cssnano'),
    rename       = require('gulp-rename'),
    del          = require('del'),
    imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant'),
    cache        = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    haml         = require('gulp-ruby-haml'),
    csscomb      = require('gulp-csscomb'),
    spritesmith  = require('gulp.spritesmith');


//таски
// gulp.task('mytask', function(){
//   return gulp.src('source-files') // взяли файлы из выборки в скобках
//         .pipe(plugin()) // что-то с ними выполнили
//         .pipe(gulp.dest('folder')) //загружаем результат в папку

// });
// gulp.task('sprite', function () {
//   var spriteData = gulp.src('app/img/sprt-footicons/*.*').pipe(spritesmith({
//     imgName: 'sprt-foot.png',
//     cssName: '_sprt-foot.sass',
//     cssFormat: 'sass',
//     algorithm: 'binary-tree',
//   }));
//   spriteData.img.pipe(gulp.dest('app/img')); // путь, куда сохраняем картинку
//   spriteData.css.pipe(gulp.dest('app/sass')); // путь, куда сохраняем стили
// });

gulp.task('sass', function(){
  return gulp.src('app/sass/*.sass') // взяли файлы из выборки в скобках
        //gulp.src('app/sass/*.sass') выбор всех файлов с разрешением sass
        //gulp.src('app/sass/**/*.sass') в любом подкаталоге
        //gulp.src('!app/sass/main.sass') файл исключится из выборки
        //gulp.src(['!app/sass/main.sass', 'app/sass/*.sass']) массив когда несколько вариантов
        //gulp.src('app/sass/*.+(scss|sass)')
        .pipe(sass()) // что-то с ними выполнили
        .pipe(autoprefixer([
            'last 15 versions', '> 1%', 'ie 8', 'ie 7'
          ], {cascade: true})) //добавили префиксы
        .pipe(csscomb('mycsscomb.json'))
        .pipe(gulp.dest('app/css')) //загружаем результат в папку указывать только папку!
        .pipe(cssnano())
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('haml', function(){
  return gulp.src('app/haml/*.haml') // взяли файлы из выборки в скобках
        .pipe(haml({
            doubleQuote: true,
            compiler: 'visionmedia'
        }))
        .pipe(gulp.dest('app')) //загружаем результат в папку указывать только папку!
        .pipe(browserSync.reload({stream: true}))
});

//объединение библотек JS
gulp.task('scripts', function(){
  return gulp.src([
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/bootstrap/dist/js/bootstrap.min.js'
         ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'));
});

 // gulp.task('csslibs', function(){
 //   return gulp.src([
 //           'app/libs/normalize-css/normalize.css',
 //           'app/libs/bootstrap/dist/css/bootstrap.css'
 //          ])
 //         .pipe(concat('libs.css'))
 //         .pipe(gulp.dest('app/css'));
 // });

//CSSLIBS
gulp.task('css-libs', ['sass'], function() {
  return gulp.src(['app/css/libs.css'])
        .pipe(cssnano())
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest('app/css'));
});
//
gulp.task('browser-sync', function(){
  browserSync({
    server: {
      baseDir: 'app' //папка, которая будет сервером
    },
    notify: false //отключаем уведомления
  });
});

//создаем таск для удаления папки dist  до watch!
gulp.task('clean', function(){
  return del.sync('dist');
});

// таск очистки кеша запускается вручную когда надо почистить кеш
gulp.task('clear', function(){
  return cache.clearAll();
});

//таск для обработки картинок и выгрузки в дистрибутив
// к этому надо добавить кеш чтобы картинки кешировались для экономии времени
gulp.task('img', function(){
  return gulp.src('app/img/**/*')
        .pipe(cache(imagemin({
          interlaced: true,
          svgoPlugins: [{removeViewBox: false}],
          une: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img'));
});

//Слежка за изменениями watch для проверки сохраняемых файлов
// то что в []  выполняет ДО выполнения таска
gulp.task('watch',['browser-sync', 'css-libs', 'haml','scripts'],function(){
  gulp.watch('app/sass/**.sass', ['sass']);//файлы за которыми следим и массив тасков которые будем выполнять
  gulp.watch('app/haml/**/**.haml', ['haml']);
  gulp.watch('app/js/**/*.js', browserSync.reload); //файлы за которыми следим и запуск команды автоматического обновления
});

//таск по умолчанию запускается командой gulp
gulp.task('default', ['watch']);

//Сборка проекта отдельный
gulp.task('build', ['clean','img', 'css-libs', 'haml', 'scripts'], function(){
  var buildCss = gulp.src([
        'app/css/main.css',
        'app/css/main.min.css',
        'app/css/libs.min.css'
      ])
     .pipe(gulp.dest('dist/css'));

  var buildFonts = gulp.src('app/fonts/**/*')
     .pipe(gulp.dest('dist/fonts'));

  var buildJs = gulp.src('app/js/**/*')
     .pipe(gulp.dest('dist/js'));

  var buildHtml = gulp.src('app/*.html')
     .pipe(gulp.dest('dist'));
});