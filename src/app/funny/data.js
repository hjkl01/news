const jsonData = [
  {
    "id": "娱乐-简书 / 首页-https://www.jianshu.com/p/99a6aeba1161",
    "feed_name": "简书 / 首页",
    "category": "娱乐",
    "title": "Android可不可以在子线程中更新UI？",
    "link": "https://www.jianshu.com/p/99a6aeba1161",
    "pub_date": "2026-09-05 16:39:08",
    "author": "在岁月中远行",
    "description": "我们首先来看一段代码： 在一个activity的xml文件中随便写一个TextView文本控件，然后在Activity的onCreate方法中开启一个子线程并在该子线程的run方法中更新TextView文本控件，你会发现根本没有任何问题。 但是如果你把Thread.sleep(2000)放开绘发现报错崩溃： 我们从这堆栈开始分析源码原因： mButton.setText(\"woyaoniu\");会调用android.widget.Tex…",
    "content": "我们首先来看一段代码： 在一个activity的xml文件中随便写一个TextView文本控件，然后在Activity的onCreate方法中开启一个子线程并在该子线程的run方法中更新TextView文本控件，你会发现根本没有任何问题。 但是如果你把Thread.sleep(2000)放开绘发现报错崩溃： 我们从这堆栈开始分析源码原因： mButton.setText(\"woyaoniu\");会调用android.widget.TextView#checkForRelayout方法中来，checkForRelay…"
  },
  {
    "id": "娱乐-喷嚏图卦-https://www.dapenti.com/blog/more.asp?name=xilei&id=195340",
    "feed_name": "喷嚏图卦",
    "category": "娱乐",
    "title": "【喷嚏图卦20260904】是谁出的题这么的难，到处全都是正确答案！",
    "link": "https://www.dapenti.com/blog/more.asp?name=xilei&id=195340",
    "pub_date": "2026-09-04 16:15:00",
    "author": "xilei",
    "description": "以下内容，有可能引起内心冲突或愤怒等不适症状。若有此症状自觉被误导者，请绕行。若按捺不住看后症状特别明显，可自行前往CCAV等欢乐 频道进行综合调理。其余，概不负责 。 本文转摘的各类事件，均来自于公开发表的国内媒体报道。引用的个人或媒体评论旨在传播各种声音，并不代表我们认同或反对其观点。 欢迎转载，转载请保证原文的完整性（不得随意增删内容，或篡改图卦名称等），请注明来源和链接。 每天一图卦，让我们更清楚地了解这个世界 【1】受台风“沙…",
    "content": "以下内容，有可能引起内心冲突或愤怒等不适症状。若有此症状自觉被误导者，请绕行。若按捺不住看后症状特别明显，可自行前往CCAV等欢乐 频道进行综合调理。其余，概不负责 。 本文转摘的各类事件，均来自于公开发表的国内媒体报道。引用的个人或媒体评论旨在传播各种声音，并不代表我们认同或反对其观点。 欢迎转载，转载请保证原文的完整性（不得随意增删内容，或篡改图卦名称等），请注明来源和链接。 每天一图卦，让我们更清楚地了解这个世界 &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; 【1】受台风“沙德尔”影响，…"
  },
  {
    "id": "娱乐-喷嚏图卦-https://www.dapenti.com/blog/more.asp?name=xilei&id=195317",
    "feed_name": "喷嚏图卦",
    "category": "娱乐",
    "title": "【喷嚏图卦20260903】35岁办不了哦",
    "link": "https://www.dapenti.com/blog/more.asp?name=xilei&id=195317",
    "pub_date": "2026-09-03 20:22:56",
    "author": "",
    "description": "",
    "content": ""
  },
  {
    "id": "娱乐-喷嚏图卦-https://www.dapenti.com/blog/more.asp?name=xilei&id=195296",
    "feed_name": "喷嚏图卦",
    "category": "娱乐",
    "title": "【喷嚏图卦20260902】数亿人冲破信息茧房感觉不舒服",
    "link": "https://www.dapenti.com/blog/more.asp?name=xilei&id=195296",
    "pub_date": "2026-09-02 16:49:00",
    "author": "xilei",
    "description": "【1】G20财长和央行行长会议结束，中国对联合声明持异议 据美国财长贝森特说，联合声明有一处提出，“非市场经济体源源不断输出廉价出口产品的模式不具备可持续性”，中国是唯一对该表述持异议的成员国。 另一段内容，原文为：“尤其是长期对外顺差过高的国家，应当消除抑制国内消费、造成经济增长过度依赖出口的各类扭曲性政策。” 其附注说明称，19国达成共识，“各国应当采取措施消除加剧全球失衡的非市场政策与做法”，中国对该段落表示反对。 中国还对以下两…",
    "content": "【1】G20财长和央行行长会议结束，中国对联合声明持异议 据美国财长贝森特说，联合声明有一处提出，“非市场经济体源源不断输出廉价出口产品的模式不具备可持续性”，中国是唯一对该表述持异议的成员国。 另一段内容，原文为：“尤其是长期对外顺差过高的国家，应当消除抑制国内消费、造成经济增长过度依赖出口的各类扭曲性政策。” 其附注说明称，19国达成共识，“各国应当采取措施消除加剧全球失衡的非市场政策与做法”，中国对该段落表示反对。 中国还对以下两段内容持反对立场：一段是赞扬国际货币基金组织 “对全球失衡开展监督”；另一段专门…"
  }
];

export default jsonData;
