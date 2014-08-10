
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , MongoStore = require('connect-mongo')(express)
  , routes = require('./routes')
  , user = require('./routes/user')
  , settings = require('./settings')
  , flash = require('connect-flash');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');//__dirname 为全局变量，存储当前正在执行的脚本所在的目录
app.set('view engine', 'jade');
app.use(express.favicon(__dirname+'/public/img/icon.ico'));//connect 内建的中间件，使用默认的 favicon 图标，如果想使用自己的图标，需改为 app.use(express.favicon(__dirname + '/public/images/favicon.ico')); 这里我们把自定义的 favicon.ico 放到了 /public/images 文件夹下。
app.use(express.logger('dev'));//在终端显示简单的日志
app.use(express.bodyParser({ keepExtensions: true, uploadDir: './public/images' }));//用来解析请求体，支持 application/json， application/x-www-form-urlencoded, 和 multipart/form-data
app.use(express.methodOverride())//connect 内建的中间件，可以协助处理 POST 请求，伪装 PUT、DELETE 和其他 HTTP 方法
app.use(express.cookieParser());
app.use(express.session({
    secret: settings.cookieSecret,
       key: settings.db,//cookie name
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
     store: new MongoStore({
        db: settings.db
    })
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//start working
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

routes(app);
