/*
 * GET home page.
 */


Post = require('../models/post.js');
var fs = require('fs');
var crypto = require('crypto');

var prive = null;
/*
   req.query： 处理 get 请求，获取 get 请求参数
   req.params： 处理 /:xxx 形式的 get 或 post 请求，获取请求参数
   req.body： 处理 post 请求，获取 post 请求体
   req.param()： 处理 get 和 post 请求，但查找优先级由高到低为 req.params→req.body→req.query
*/

module.exports = function(app){
    app.get('/', checkAdmin);
    app.get('/', function(req, res){
        Post.getTen(1, prive, function(err, posts){
            if (err) posts = [];
            Post.getOne(posts[0].title, function(err, post){
                if (err) post = [];
                posts[0] = post;
                Post.getRecent(prive, function(err, recentPosts){
                    if (err) recentPosts = [];
                    res.render('index', { 
                        title:'Shiyu\'s Blog | Li Shiyu Blog',
                        posts:posts,
                        recentPosts:recentPosts,
                        login:prive,
                    });


                });

            });
        });

    });

    app.get('/blog', checkAdmin);
    app.get('/blog', function(req, res){  
        var page = req.query.p;
        if(!page) page = 1;
        else page = parseInt(page);
        Post.getTen(page, prive, function(err, posts){
            if (err) posts = [];
            Post.getRecent(prive, function(err, recentPosts){
                if (err) recentPosts = [];
                res.render('blog', {
                    title:'Blog',
                    page:page,
                    posts:posts,
                    recentPosts:recentPosts,
                    login:prive,
                });
            });
        });
    });

    app.get('/blog/:title', checkAdmin);
    app.get('/blog/:title', function(req, res){
        Post.getOne(req.params.title, function(err, post){
            if (err) post = [];
            Post.getRecent(prive, function(err, recentPosts){
                if (err) recentPosts = [];
                res.render('article', {
                    title:req.params.title,
                    post:post,
                    recentPosts:recentPosts,

                });
            });
        });
    });

    app.get('/post', checkAdmin);
    app.get('/post', function(req, res){
        Post.getRecent(prive, function(err, recentPosts){
            if (err) recentPosts = [];
            res.render('post', {
                title:'New Blog',
                recentPosts:recentPosts,
                login:prive,
            });
        });
    });

    app.post('/post', function(req, res){     
        var post = new Post(req.body.title, req.body.post, new Date(), req.body.tag, req.body.imgSrc);
        if (req.body.title.length && req.body.post.length) {
            post.save(function(err) {
                return res.redirect('/blog');
            });
        }
    });

    app.get('/blog/:title/delete', checkAdmin);
    app.get('/blog/:title/delete', function(req, res){
        Post.deleteArticle(req.params.title, function(err){
            return res.redirect('/blog');      
        });    
    });

    app.get('/blog/:title/update', checkAdmin);
    app.get('/blog/:title/update', function(req, res){
        Post.updateOne(req.params.title, function(err, post){
            if (err) post = [];
            Post.getRecent(prive, function(err, recentPosts){
                if (err) recentPosts = [];
                res.render('post', {
                    title:req.params.title,
                    post:post,
                    recentPosts:recentPosts,
                    login:prive,
                });
            });
        });      
    });      

    app.post('/blog/:title/update', function(req, res){
        var post = new Post(req.body.title, req.body.post, new Date(), req.body.tag, req.body.imgSrc);
        if (req.body.title.length && req.body.post.length) {
            post.save(function(err) {
                return res.redirect('/blog');
            });
        }
    });     

    app.get('/search', checkAdmin);
    app.get('/search', function(req, res){
        var page = req.query.p;
        if (!page) page = 1;
        else page = parseInt(page);
        Post.search(req.query.keyword, page, function (err, posts) {
            if (err) posts = [];
            Post.getRecent(prive, function(err, recentPosts){
                if (err) recentPosts = [];
                res.render('blog',{
                    title:'Search',
                    page:page,
                    posts:posts,
                    keyword:req.query.keyword,
                    recentPosts:recentPosts,
                    login:prive,
                });
            });
        });
    });

    app.get('/list', checkAdmin);
    app.get('/list', function(req, res) {
        var page = req.query.p;
        if(!page) page = 1;
        else page = parseInt(page);
        Post.getList(page, prive, function(err, posts){
            if (err) posts = [];
            Post.getRecent(prive, function(err, recentPosts){
                if (err) recentPosts = [];
                res.render('list', {
                    title:'List',
                    page:page,
                    posts:posts,
                    recentPosts:recentPosts,
                    login:prive,
                });
            });
        });
    });

    app.get('/about-me', checkAdmin);
    app.get('/about-me', function(req,  res) {
        Post.getRecent(prive, function(err, recentPosts){
            if (err) recentPosts = [];
            res.render('aboutMe', {
                title:'About me',
                recentPosts:recentPosts,
                login:prive,
            });
        });
    });

    app.get('/login', function(req, res) {
        res.render('login', {
            title:'Administration Login',
        });
    });

    app.get('/logout', function(req, res) {
        req.session.user = null;
        res.redirect('/');
    });

    app.post('/login', function(req, res){
        console.log(req.header('Referer'));
        if (req.body.username == 'litmus' && req.body.password == '10241072') {
            req.session.user = 'admin';
            return res.redirect('back');
        }
        return res.redirect('/');
    });

    function checkAdmin(req, res, next){
        prive = (req.session.user == 'admin');
        next();
    }

};

