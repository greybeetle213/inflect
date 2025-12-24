const addResourcesToCacheNetworkFirst = async (resources) => {
    const cache = await caches.open("v1");
    for (var resource of resources){
        try{
            var resourceValue = await fetch(resource)
            cache.put(resource, resourceValue)
        } catch (error) {

        }
    }
}
const addResourcesToCacheCacheFirst = async (resources) => {
    const cache = await caches.open("v1");
    for (var resource of resources){
        try{
            const responseFromCache = await caches.match(request);
        } catch (error) {
            try{
                var resourceValue = await fetch(resource)
                cache.put(resource, resourceValue)
            } catch (error) {
    
            }
        }
    }
}
const addResourcesToCache = async (resources) => {
    const cache = await caches.open("v1");
    await cache.addAll(resources);
};
const putInCache = async (request, response) => {
    const cache = await caches.open("v1");
    await cache.put(request, response);
};

const netFirst = async (request, preloadResponsePromise, event) => {
    try {
        const responseFromNetwork = await fetch(request);
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        event.waitUntil(putInCache(request, responseFromNetwork.clone()));
        return responseFromNetwork;
    } catch (error) {

    }
    // First try to get the resource from the cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }

    // Next try to use (and cache) the preloaded response, if it's there
    const preloadResponse = await preloadResponsePromise;
    if (preloadResponse) {
        console.info("using preload response", preloadResponse);
        event.waitUntil(putInCache(request, preloadResponse.clone()));
        return preloadResponse;
    }

    // Next try to get the resource from the network
    
};

const cacheFirst = async (request, preloadResponsePromise, event) => {
    // First try to get the resource from the cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }

    // Next try to use (and cache) the preloaded response, if it's there
    const preloadResponse = await preloadResponsePromise;
    if (preloadResponse) {
        console.info("using preload response", preloadResponse);
        event.waitUntil(putInCache(request, preloadResponse.clone()));
        return preloadResponse;
    }

    // Next try to get the resource from the network
    try {
        const responseFromNetwork = await fetch(request);
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        event.waitUntil(putInCache(request, responseFromNetwork.clone()));
        return responseFromNetwork;
    } catch (error) {
        // there is nothing we can do, but we must always
        // return a Response object
        return new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
        });
    }
};
  
self.addEventListener("install", (event) => {
    event.waitUntil(
        addResourcesToCacheNetworkFirst([
            "/",
            "/index.html",
            "/american.html",
            "/style.css",
            "/load.js",
            "/sw.js",
            "/main.js",
            "/makePuzzle.js",
            "/borowedCode.js",
            "/tutorial.js"
        ])
    )
    event.waitUntil(
        addResourcesToCacheCacheFirst([
            "/dict/extras.js",
            "/dict/filteredConjs.json",
            "/dict/ipaToOrth.json",
            "/dict/ipaTree.json",
            "/dict/orthToIpa.json",
            "/dict/orthTree.json",
            "/dict/wordList.json",
    
            "/dict_US/extras.js",
            "/dict_US/filteredConjs.json",
            "/dict_US/ipaToOrth.json",
            "/dict_US/ipaTree.json",
            "/dict_US/orthToIpa.json",
            "/dict_US/orthTree.json",
            "/dict_US/wordList.json"
        ])
    )
})

self.addEventListener("fetch", (event) => {
    if(event.request && event.request.url.indexOf("dict")==-1){
        event.respondWith(
            netFirst(
                event.request,
                event.preloadResponse,
                event
            )
        )
    }else{
        event.respondWith(
            cacheFirst(
                event.request,
                event.preloadResponse,
                event
            )
        );
    }
  }
)