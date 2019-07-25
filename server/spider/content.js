const { getModel } = require('../db/db');
const { savePost, delay } = require('./util');
const POST = getModel('post');
const colors = require('colors');
const cheerio = require('cheerio');
const { rq } = require('./util');


/**
 * 根据post链接，爬取post文内容
 */
(() => {

    let totalPages = 0, //总页数
        postLinks = [], //文章链接
        proxyIndex = 0,
        currentPage = 0;
    console.log('开始根据url去post数据');
    //获取尚未爬取到内容的链接
    POST.find({post: ''}, {}, {limit: 500}, async function(err, docs){
        if (err) {
            console.log('DB LOG'.red + ' Error while saving post content to mongodb');
        }
        console.log('mongoose查找到记录为：', docs);
        docs = docs.map(v => v.link);
        postLen = docs.length;
        //根据post文链接抓取post文内容 用async先爬完入库 然后在分词
        for (let i = 0; i < postLen; i++) {
            let postUrl = docs[i];
            // console.log(postUrl);
            // proxyIndex < ipTable.length ? proxyIndex : proxyIndex = 0;
            await rq(postUrl, (body) => parseBody(body, postUrl))
                .catch(async e => {
                    console.log(e.stack);
                    // console.log('LOG'.red + ': Request ' + postUrl + ' failed. Retrying...');
                    await delay(1000);
                    await rq(postUrl, (body) => parseBody(body, postUrl));
                })
        }
        //这里还是用async来处理 而不是简单的延时
        setTimeout(() => {
            console.log('50秒后开始分词');
            try{
                require('./jieba')();
            }
            catch(err){
                console.log('分词错误为：', err.stack);
            }
        }, 50000); 
    });


    function parseBody(body, postUrl) {
        if (body) {
            const $ = cheerio.load(body, { decodeEntities: false });
            let post = $('.pct .pcb tr td').text();
            // console.log(post);
            savePost({
                post, link: postUrl
            })

        }

    }

})()