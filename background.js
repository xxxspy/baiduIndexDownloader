// Extension event listeners are a little different from the patterns you may have seen in DOM or
// Node.js APIs. The below event listener registration can be broken in to 4 distinct parts:
//
// * chrome      - the global namespace for Chrome's extension APIs
// * runtime     – the namespace of the specific API we want to use
// * onInstalled - the event we want to subscribe to
// * addListener - what we want to do with this event
//
// See https://developer.chrome.com/docs/extensions/reference/events/ for additional details.
chrome.runtime.onInstalled.addListener(async () => {
  

    // While we could have used `let url = "hello.html"`, using runtime.getURL is a bit more robust as
    // it returns a full URL rather than just a path that Chrome needs to be resolved contextually at
    // runtime.
    // let url = chrome.runtime.getURL("hello.html");
  
    // Open a new tab pointing at our page's URL using JavaScript's object initializer shorthand.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#new_notations_in_ecmascript_2015
    //
    // Many of the extension platform's APIs are asynchronous and can either take a callback argument
    // or return a promise. Since we're inside an async function, we can await the resolution of the
    // promise returned by the tabs.create call. See the following link for more info on async/await.
    // https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
    let tab = await chrome.tabs.create({ url: 'https://mlln.cn/2021/11/19/百度指数数据下载方法/' });
  
    // Finally, let's log the ID of the newly created tab using a template literal.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
    //
    // To view this log message, open chrome://extensions, find "Hello, World!", and click the
    // "service worker" link in th card to open DevTools.
    // console.log(`Created tab ${tab.id}`);

  });

//   chrome.webRequest.onBeforeSendHeaders.addListener(details=>{
//     console.log(details)
//     return details.requestHeaders
//   }, {
//     urls: [
//         '*://index.baidu.com/api/SearchApi/index*'
//     ],
//     types: [
//         'main_frame',
//         'sub_frame',
//         'xmlhttprequest'
//     ]
// }, );

// chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
//      console.log(details);
//   },
//   {urls: ["*://index.baidu.com/*"]}
// );

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    for (var i = 0; i < details.requestHeaders.length; ++i) {
      if (details.requestHeaders[i].name=='Cipher-Text'){
        console.log(details.requestHeaders[i].value)
        console.log(details)
        chrome.tabs.sendMessage(details.tabId, details.requestHeaders[i].value); 
      }
    }
    return {requestHeaders: details.requestHeaders};
  },
  {urls: ["https://index.baidu.com/api/SearchApi/index*"]},
  ["blocking", "requestHeaders"]
);
