const { exec } = require('child_process');
const analyzer = require('nodejieba');
const { SERVER_BASE_URL } = require('../const/_variables');
const { getModel } = require('../db/db');
const POST = getModel('post');
const fs = require('fs');
const opn = require('opn');

analyzer.load();
const wordMap = new Map();

//分词完成打开浏览器展示结果
function openBrowser() {
    opn(`${SERVER_BASE_URL}`, { app: 'chrome' });
}

//分词结果，写入文件系统
function writeToFileSys() {
    fs.writeFile('./word.txt', JSON.stringify([...wordMap]), (err) => {
        if (err) {
            console.log('LOG'.red + ' Saving data to file system got some error');
            return;
        }
        console.log('LOG Saving data to file system success!');
        openBrowser();
    })
}

//jieba分词
function jieba(post) {
    return new Promise((resolve, reject) => {
        let results = analyzer.tag(post);
        // console.log(results);
        if (results) {
            results.forEach(word => {
                if (wordMap.has(word.word)) {
                    let count = wordMap.get(word.word);
                    wordMap.set(word.word, ++count);
                } else {
                    //过滤一些tag的词语 主要是标点、人称、语气词等
                    if(word.tag === 'x' || word.tag === 'r' || word.tag === 'uj' || word.tag === 'ul' || word.tag === 'v'||
                        word.tag === 'c' || word.tag === 'd' || word.tag === 'p' || word.tag === 'q'){
                       return;
                    }
                    wordMap.set(word.word, 0);
                }
            })
        }
        resolve(wordMap);
        
    })
}

/**
 * 分词，以txt形式保存到文件系统
 */
module.exports = () => {
    const jiebaResult = [];
    POST.find({}, async (err, docs) => {
        // console.log(docs);
        if (err) {
            throw new Error(err)
        }
        try{            
            docs.forEach((v) => {
                jiebaResult.push(jieba(v.post));
            });
        }
        catch(err) {
            console.log('jiebaResult.push错误为：', err.stack);
        }

        try{            
            await Promise.all(jiebaResult).then(() => {
                writeToFileSys();
            })
        }
        catch(err) {
            console.log('writeToFileSys错误为：', err.stack);
        }
        console.log('end');
    })
}

