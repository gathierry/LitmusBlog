﻿/* * GET home page. */Post = require('../models/post.js')Modify = require('../models/modify.js')var timelines;/* req.query： 处理 get 请求，获取 get 请求参数 req.params： 处理 /:xxx 形式的 get 或 post 请求，获取请求参数 req.body： 处理 post 请求，获取 post 请求体 req.param()： 处理 get 和 post 请求，但查找优先级由高到低为 req.params→req.body→req.query */module.exports = function(app){  app.get('/', function(req, res){      timelines = ["Tech", "France"];            res.render('index', {           title: 'Litmus Blog',           timelines:timelines,      });  });  app.get('/blog', function(req, res){        var page = req.query.p;      if(!page) page = 1;      else page = parseInt(page);      Post.getTen(page, null, function(err, posts){          if (err) posts = [];                  res.render('blog', {              title:'Blog',              page:page,              posts:posts,              postsLen:posts.length,              timelines:timelines,          });      });  });  app.get('/tag/:tag', function(req, res){        var page = req.query.p;      if(!page) page = 1;      else page = parseInt(page);      var tag = req.params.tag;      Post.getTen(page, tag, function(err, posts){          if (err) posts = [];                  res.render('blog', {              title:'Blog',              page:page,              posts:posts,              postsLen:posts.length,              timelines:timelines,          });      });  });    app.get('/blog/:title', function(req, res){      Post.getOne(req.params.title, function(err, post){          if (err) post = [];          res.render('article', {              title:req.params.title,              post:post,              timelines:timelines,          });      });  });  app.get('/post', function(req, res){      res.render('post', {          timelines:timelines,          title:'New Blog',      });  });  app.post('/post', function(req, res){           var post = new Post(req.body.title, req.body.post, new Date(), req.body.tag);      if (req.body.title.length || req.body.post.length) {          post.save(function(err) {              return res.redirect('/blog');          });      }   });  app.get('/blog/:title/delete', function(req, res){      Modify.deleteArticle(req.params.title, function(err){          return res.redirect('/blog');            });      });  app.get('/blog/:title/update', function(req, res){      Post.getOne(req.params.title, function(err, post){          if (err) post = [];          res.render('post', {              title:req.params.title,              post:post,              timelines:timelines,          });      });         });            app.post('/blog/:title/update', function(req, res){           var post = new Post(req.body.title, req.body.post, new Date(), req.body.tag);      if (req.body.title.length || req.body.post.length) {          post.save(function(err) {              return res.redirect('/blog');          });      }   });              };