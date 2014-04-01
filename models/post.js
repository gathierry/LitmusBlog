﻿var mongodb = require('./db');var markdown = require('markdown').markdown;function Post(title, post, time, tag) {  this.title = title;  this.post = post;  this.time = time;  this.tag = tag;}module.exports = Post;//instance methodPost.prototype.save = function save(callback) {  var post = {    title:this.title,    post:this.post,    time:this.time,    tag:this.tag,  };  mongodb.open(function(err, db) {    if(err) return callback(err);    db.collection('posts', function(err, collection) {      if (err) {        mongodb.close();        return callback(err);      }      var query = {};      if(post.title) query.title = post.title;      collection.findOne(query, function(err, doc) {          var exist = doc?true:false;             if(exist) {              post.time = doc.time;              collection.update(doc, post, function(err, post){                  mongodb.close();                  callback(err, post);              });          }          else {              collection.insert(post, {                  safe:true              }, function(err, post) {                    mongodb.close();                    callback(err, post);              });          }       });    });  });};  //class methodPost.getTen = function getTen(page, tag, callback) {    mongodb.open(function(err, db) {        if (err) return callback(err);        db.collection('posts', function(err, collection) {            if (err) {                mongodb.close();                return callback(err);            }            var query = {};            collection.find(query, {skip:(page-1)*20, limit:21}).sort({                time: -1            }).toArray(function (err, docs) {                    mongodb.close();                    if(err) callback(err, null);                    var posts= [];                    docs.forEach(function (doc, index) {                        var post = new Post(doc.title, doc.post, doc.time, doc.tag);                        var now = post.time;                        post.time = now.getFullYear() + "-" + (now.getUTCMonth()+1);                        posts.push(post);                    });                callback(null, posts);            });        });    });};Post.getOne = function getOne(title, callback) {    mongodb.open(function(err, db) {        if (err) return callback(err);        db.collection('posts', function(err, collection) {            if (err) {                mongodb.close();                return callback(err);            }            var query = {};            if(title) query.title = title;            collection.findOne(query,function (err, doc) {                mongodb.close();                if(err) callback(err, null);                var post = new Post(doc.title, doc.post, doc.time, doc.tag);                var now = post.time;                post.time = now.getFullYear() + "-" + (now.getUTCMonth()+1) + "-" + now.getUTCDate();                //post.post = markdown.toHTML(post.post);                callback(null, post);            });        });    });};Post.getArchieve = function(callback) {    mongodb.open(function(err, db) {        if (err) return callback(err);        db.collection('posts', function(err, collection) {            if (err) {                mongodb.close();                return callback(err);            }            collection.find({},{"time":1, "title":1}).sort({                time: -1            }).toArray(function (err, docs) {                    mongodb.close();                    if(err) callback(err, null);                    var posts= [];                    docs.forEach(function (doc, index) {                        var post = new Post(doc.title, doc.post, doc.time, doc.tag);                        var now = post.time;                        post.time = now.getFullYear() + "-" + (now.getUTCMonth()+1);                        posts.push(post);                    });                callback(null, posts);            });        });    });};