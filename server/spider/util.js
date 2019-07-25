let { URL , SERVER_BASE_URL} = require('../const/_variables');
const { getModel } = require('../db/db');
const color = require('colors');
const POST = getModel('post');
const opn = require('opn');
const rp = require('request-promise');
const fs = require('fs');
const url = require('url');

// 1、加载页面指定页面
async function toPage(page, url, timeout) {
    try {
        await delay(timeout);
        await page.goto(url);
        console.log(`PAGE LOG`.yellow + ` Opening Chrome's new tab and going to ${url}`);
        return url;
    } catch (error) {
        console.log(error);
    }
}

//延时爬取
function delay(timeout = 1300) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    })

}

// 根据标签获取帖子的地址
async function parseElementHandle(page, url) {
    try {
        const linksHandle = await page.$$('tbody > tr > th.new > a.s, tbody > tr > th.common > a.s');
        // linksHandle = await linksHandle.$$('a');
        // console.log(linksHandle);
        // return linksHandle;
        console.log(`PAGE LOG`.blue + ` Getting Links from ${url}`);
        return linksHandle;
    } catch (error) {
        console.log(error);
    }
}

//这里只爬前3页 一页50个帖子 三页大概就是近三天的讨论
function getNextUrl(pageNum = 1) {
    return URL + `${pageNum}.html`
}

// 3、调用getPostUrls方法获取超链接
async function getPostUrls(links) {
    const urlArray = [];
    console.log('links长度为：', links.length);
    for (const link of links) {
        try {
            const property = await link.getProperty('href');
            const url = await property.jsonValue();
            urlArray.push(url);
        } catch (error) {
            console.log(error);
        }
    }

    return urlArray;
}

/**  
 * 保存帖子超链接到数据库
 * @param {*} docs 
 */
function saveToDB(docs) {
    let isAllSaved = true;
    docs.forEach(doc => {
        doc.forEach(href => {
            POST.findOne({ link: href }, (err, doc) => {
                if (err) {
                    console.log(`DB LOG`.red + ' Some error happened while saving to Mongodb.' + `\nReason:${err}`);
                }
                if (!doc) {
                    POST.create({ link: href, post: '' }, (err) => {
                        if (err) {
                            isAllSaved = false;
                            console.log(`DB LOG`.red + ' Some error happened while saving to Mongodb.' + `\nReason:${err}`);
                        }
                    })
                }
            })
        });
    });
    isAllSaved ? console.log('DB LOG'.green + ' All links of page has been saved successfully!') : console.log('DB LOG'.red + ' MongoDB has some error.');;
}


/**
 * 根据URL将post文内容保存
 * @param {*} param0 
 */
function savePost({ post, link }) {
    post = getRidOfHTMLTag(post);
    POST.findOne({ link }, (err, doc) => {
        if (err) {
            console.log(`DB LOG`.red + ` Url ${link} saved error`);
        }
        if (doc) {
            doc.set({ post, link });
            doc.save((err, updatedDoc) => {
                if (err) {
                    console.log(`DB LOG`.red + ` Update ${link} occur an error`);
                }
                console.log(`DB LOG`.green + ` Post ${link} has been save.`);
            })
        } else {
            POST.create({ link, post }, (err, doc) => {
                if (err) {
                    console.log(`DB LOG`.red + ` Update ${link} occur an error`);
                }
                console.log(`DB LOG`.green + ` Post ${link} has been save.`);
            })
        }
    })
}

/**
 * 去除html标签，特殊字符，转义字符
 * @param {*} post 正文内容
 */
function getRidOfHTMLTag(post) {
    const regex = /(<([^>]+)>)/ig,
        escRegex = /[\'\"\\\/\b\f\n\r\t]/ig,
        spcRegex = /[&\|\\\*^%$#@\-]/g;
    post = post.replace(regex, '');
    post = post.replace(escRegex, '');
    post = post.replace(spcRegex, '');
    return post;
}

/**
 * 读取分词结果
 */
function readWordsFromFile() {
    return fs.readFileSync('word.txt', { encoding: 'utf-8' });
}

/**
 * 
 * @param {string} REQUEST_URL 待爬取的URL
 * @param {string} proxy 代理IP
 * @param {fn} success 成功回调函数
 * @param {fn} fail 失败回调函数
 */
function rq(REQUEST_URL, callback) {
    return rp({ 'url': url.parse(REQUEST_URL)})
        .then(res => callback(res))
}


// const interfaces = require('os').networkInterfaces(); // 在开发环境中获取局域网中的本机iP地址
// let IPAdress = '';
// for(var devName in interfaces){  
//   var iface = interfaces[devName];  
//   for(var i=0;i<iface.length;i++){  
//         var alias = iface[i];  
//         if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
//               IPAdress = alias.address;  
//         }  
//   }  
// } 
// console.log(IPAdress);

module.exports = {
    getPostUrls,
    toPage,
    delay,
    rq,
    getNextUrl,
    savePost,
    saveToDB,
    readWordsFromFile,
    parseElementHandle,
}