# 介绍
这是个[nodejs](https://nodejs.org/zh-cn/)练手的项目，因为是dnf玩家,所以就爬了下dnf玩家论坛——[COLG心情咖啡屋](https://bbs.colg.cn/forum-171-1.html).提取一下玩家讨论的关键字，并做成词云。

# 效果图

![词云演示1]('./public/images/ciyun.png')
 
# 使用
先下载或者clone代码
```
git clone https://github.com/shangnengfanfou/ColgSpider.git
```
进入项目目录，安装依赖
```
cd ./ColgSpider
npm install
```
启动项目 
```
npm run dev
```
# 项目介绍
## 原理
其实就是先拿到网站主页，分析`html`,，根据规律拿到帖子的`post`地址，然后依次请求地址，分析拿回的数据，筛选出玩家发布的内容。

## 核心依赖
 puppeteer   
 :    Puppeteer是谷歌官方出品的一个通过DevTools协议控制headless Chrome的Node库。可以通过Puppeteer的提供的api直接控制Chrome模拟大部分用户操作来进行UI Test或者作为爬虫访问页面来收集数据。
cheerio
:    cheerio是nodejs的抓取页面模块，为服务器特别定制的，快速、灵活、实施的jQuery核心实现。
request-promise
:    http请求模块，用于请求网页获取数据
nodejieba
:    最好的nodejs中文分词模块

