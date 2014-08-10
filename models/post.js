var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(title, post, time, tag, imgSrc) {
    this.title = title;
    this.post = post;
    this.time = time;
    this.tag = tag;
    this.imgSrc = imgSrc;
}

module.exports = Post;

//instance method
Post.prototype.save = function save(callback) {
    var post = {
        title:this.title,
        post:this.post,
        time:this.time,
        tag:this.tag,
        imgSrc:this.imgSrc,
    };
    post.tag = (this.tag == undefined) ? false : true;
    post.imgSrc = post.imgSrc.substring (6, post.imgSrc.length);
    mongodb.open(function(err, db) {
        if(err) return callback(err);
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(post.title) query.title = post.title;
            collection.findOne(query, function(err, doc) {
                var exist = doc?true:false;   
                if(exist) {
                    post.time = doc.time;
                    post.imgSrc = post.imgSrc.length ? post.imgSrc : doc.imgSrc;
                    collection.update(doc, post, function(err, post){
                        mongodb.close();
                        callback(err, post);
                    });
                }
                else {
                    collection.insert(post, {
                        safe:true
                    }, function(err, post) {
                        mongodb.close();
                        callback(err, post);
                    });
                }
            });
        });
    });
};  

//class method
Post.getTen = function getTen(page, tag, callback) {
    mongodb.open(function(err, db) {
        if (err) return callback(err);
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = (tag==true) ? {} : {"tag":{"$ne":true}};
            collection.find(query, {skip:(page-1)*10, limit:11}).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if(err) callback(err, null);
                callback(null, showEntryContents (docs));
            });
        });
    });
};

Post.getOne = function getOne(title, callback) {
    mongodb.open(function(err, db) {
        if (err) return callback(err);
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(title) query.title = title;
            collection.findOne(query,function (err, doc) {
                mongodb.close();
                if(err) callback(err, null);
                var post = new Post(doc.title, doc.post, doc.time, doc.tag, doc.imgSrc);
                var time = post.time;
                if (doc.imgSrc == null) post.imgSrc = "";
                post.time = time.getFullYear() + "-" + (time.getUTCMonth()+1) + "-" + time.getUTCDate();
                post.post = markdown.toHTML(post.post);
                callback(null, post);
            });
        });
    });
};

Post.updateOne = function getOne(title, callback) {
    mongodb.open(function(err, db) {
        if (err) return callback(err);
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(title) query.title = title;
            collection.findOne(query,function (err, doc) {
                mongodb.close();
                if(err) callback(err, null);
                var post = new Post(doc.title, doc.post, doc.time, doc.tag, doc.imgSrc);
                var time = post.time;
                if (doc.imgSrc == null) post.imgSrc = "";
                post.time = time.getFullYear() + "-" + (time.getUTCMonth()+1) + "-" + time.getUTCDate();
                callback(null, post);
            });
        });
    });
};

Post.getRecent = function getRecent(tag, callback) {
    mongodb.open(function(err, db) {
        if (err) return callback(err);
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = (tag==true) ? {} : {"tag":{"$ne":true}};
            collection.find(query, {skip:0, limit:10}).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if(err) callback(err, null);
                var posts = [];
                docs.forEach(function (doc, index) {
                    var post = new Post(doc.title, doc.post, doc.time, doc.tag, doc.imgSrc);
                    var time = post.time;
                    post.time = time.getFullYear() + "-" + (time.getUTCMonth()+1) + "-" + time.getUTCDate();
                    posts.push(post);    
                });
                callback(null, posts);
            });
        });
    });
};

Post.getList = function getList(page, tag, callback) {
    mongodb.open(function(err, db) {
        if (err) return callback(err);
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = (tag==true) ? {} : {"tag":{"$ne":true}};
            collection.find(query, {skip:(page-1)*30, limit:31}).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if(err) callback(err, null);
                var posts = [];
                docs.forEach(function (doc, index) {
                    var post = new Post(doc.title, doc.post, doc.time, doc.tag, doc.imgSrc);
                    var time = post.time;
                    post.time = time.getFullYear() + "-" + (time.getUTCMonth()+1) + "-" + time.getUTCDate();
                    posts.push(post);    
                });
                callback(null,posts);
            });
        });
    });
};

Post.deleteArticle = function deleteArticle(title, callback){
    mongodb.open(function(err,db){
        if(err) return callback(err);
        db.collection('posts', function(err, collection){
            if(err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(title) {
                query.title = title;
                collection.remove(query);
            }
            mongodb.close();
            callback();
        });
    });
};

Post.search = function(keyword, page, callback) {
    mongodb.open(function (err, db) {
        if (err) return callback(err);
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var pattern = new RegExp("^.*" + keyword + ".*$", "i");
            collection.find({"title": pattern}, {skip:(page-1)*10, limit:11}).sort({
                time: -1
            }).toArray(function (err, docs) { 
                mongodb.close();
                if (err) return callback(err); 
                callback(null, showEntryContents (docs));
            });
        });
    });
};

/*   
 * 调整截取的字符串的位置。因为在截取一个字符串后可能存在两种情况：
 * （1）字符串末位正好处于一个标签的属性之中的某个位置。如：<<span style="color: #ff0000;">a id="xxx"  href="xxx"</span>
 ></a>中红色标注的位置。
 &nbsp;* （2）字符串末位处于一个标签内容之中的某个位置。如：<<span style="color: #000000;">a</span>
 ><span style="color: #ff0000;">here</span>
 </a> 中红色标注的位置。
 *  对于这两种情况，第二种情况可以无需特殊处理，但是第一种情况的话得将整个标签删除或者将其属性补全。删除的话
 *  将字符串的末尾位置前移至标签开始之前；而补全则是将末尾位置后移至次标签的'>'处。这里采用的是删除的方法。
 */
function adjustByTagPostion(str){
    var left_brace_index = str.lastIndexOf('<');
    var right_brace_index = str.lastIndexOf('>');
    // 为true的话则表示字符串处于第一种情况，需要进行删除操作。
    var inTagDefinition = left_brace_index > right_brace_index;
    return inTagDefinition ? str.substring(0,left_brace_index) : str;
}

// 将未闭合的标签按序闭合。
function modifyDisplayString(original, addTags){
    var tagLenth = addTags.length;
    for(var i = tagLenth-1; i >= 0; i--){
        original += '</' + addTags[i] + '>';
    }
    return original;
}

// 
function splitString(original, length){
    // 此数组用于保存那些未闭合的标签。
    var non_match_tag = [];
    // 如果大于字符串的总长度，返回整个字符串；否则返回指定长度的子串
    var to = length >= original.length ? original.length : length;
    var substring = original.substring(0,to);
    if (to < original.length) substring = substring + '...';

    // 调整字符串。
    adjustedSubString = adjustByTagPostion(substring);
    var tag_pattern = /<\s*(\w+\b)(?:[^>]*[^\/])?>|<(\/\w+)>/ig

        adjustedSubString.replace(tag_pattern, function(match,$1,$2){
            var value = $1 == null ? ($2 == null ? '' : $2) : $1;
            if(value.charAt(0) == '/'){
                // 为真表示这个标签是前面最后一个为闭合标签的闭合，因此，将此标签从数组中删除。
                if(non_match_tag.length > 0 && non_match_tag[non_match_tag.length-1] == value.substring(1)){
                    non_match_tag.pop();
                }
            }else{
                // 新的未闭合的标签，将其添加到数组中。
                non_match_tag.push(value);
            }
        });
    return modifyDisplayString(adjustedSubString, non_match_tag);
}

function showEntryContents(docs) {
    var posts = [];
    docs.forEach(function (doc, index) {
        var post = new Post(doc.title, doc.post, doc.time, doc.tag, doc.imgSrc);
        var now = post.time;
        post.time = now.getFullYear() + "-" + (now.getUTCMonth()+1);
        var limitLength = 200;
        post.post = splitString (post.post, limitLength);
        posts.push(post);    
    });
    return posts;
}

