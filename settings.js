var Connection = require('mongodb').Connection;

module.exports = {
    cookieSecret: 'litmus-blog',
    db: 'litmus_blog',
    host: 'localhost',
    port: Connection.DEFAULT_PORT,
};
//db 是数据库的名称，host 是数据库的地址。cookieSecret 用于 Cookie 加密与数据库无关
