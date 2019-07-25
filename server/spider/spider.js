const puppeteer = require('puppeteer-cn');
let { URL } = require('../const/_variables');
const colors = require('colors');
const {
    getPostUrls,
    saveToDB,
    toPage,
    parseElementHandle,
    crawPageContent,
    savePost,
    getNextUrl } = require('./util');
const {writeToFileSys} = require('./jieba');
/**
 * 先获取需要爬取的页的所有帖子的链接
 * 
 */
(async () => {
    let broswer = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: false,
    }),
        page = await broswer.newPage(),
        currentPage = 1,
        totalPages = 0,
        linksHandle,
        url = '',
        postUrls = [];

    console.log('PAGE LOG: Starting task.'.yellow);
    page.setDefaultNavigationTimeout();
    URL = URL + `1.html`;
    toPage(page, URL).then(async (url) => {
        console.log('PAGE LOG'.yellow + ' Page has been loaded,%s', url);

        console.log(url);
        // console.log(page);
        //分页数量
        // totalPages = await page.$eval('.last', el => {return Number.parseInt(el.textContent.replace(/[^0-9]/ig,""))});
        totalPages = 3;
        console.log(`PAGE LOG`.yellow + ` site:${URL} has ${totalPages} pages`);

        //抓取post文超链接
        for (let i = 1; i <= totalPages; i++) {
            url = getNextUrl(i);
            await toPage(page, url, 3000);
            let links = await parseElementHandle(page, url);
            let result = await getPostUrls(links);
            postUrls.push(result);
        }
        console.log(postUrls);
        try {
            await saveToDB(postUrls);
        }
        catch(err) {
            console.log('错误为：',err);
            return;
        }

        console.log('PAGE LOG : All tasks have been finished.'.green);
        // writeToFileSys();
        await broswer.close();
        try{
            setTimeout(() => {
                console.log('20s后开始执行爬取数据方法')
                require('./content')
            }, 20000);
        }catch(err){
            console.log("运行post错误为：", err.stack);
        }

    });
})()