const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register(
                'sw.js',
            {
                scope: './',
            }
            );
            if (registration.installing) {
                console.log('Service worker installing');
            } else if (registration.waiting) {
                console.log('Service worker installed');
            } else if (registration.active) {
                console.log('Service worker active');
            }
        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
    return
};
registerServiceWorker()
async function loadResources(){
    console.log("started")
    if(america){
        await fetch("dict_US/filteredConjs.json").then((r)=>(r.json())).then((r)=>(conjs=r))
        await fetch("dict_US/ipaToOrth.json").then((r)=>(r.json())).then((r)=>(ipaToOrth=r))
        await fetch("dict_US/ipaTree.json").then((r)=>(r.json())).then((r)=>(ipaTree=r))
        await fetch("dict_US/orthToIpa.json").then((r)=>(r.json())).then((r)=>(orthToIpa=r))
        await fetch("dict_US/orthTree.json").then((r)=>(r.json())).then((r)=>(orthTree=r))
        await fetch("dict_US/wordList.json").then((r)=>(r.json())).then((r)=>(wordList=r))
    }else{
        await fetch("dict/filteredConjs.json").then((r)=>(r.json())).then((r)=>(conjs=r))
        await fetch("dict/ipaToOrth.json").then((r)=>(r.json())).then((r)=>(ipaToOrth=r))
        await fetch("dict/ipaTree.json").then((r)=>(r.json())).then((r)=>(ipaTree=r))
        await fetch("dict/orthToIpa.json").then((r)=>(r.json())).then((r)=>(orthToIpa=r))
        await fetch("dict/orthTree.json").then((r)=>(r.json())).then((r)=>(orthTree=r))
        await fetch("dict/wordList.json").then((r)=>(r.json())).then((r)=>(wordList=r))
    }
    addExtrasToDict()
    proccessDictFiles()
    console.log("done")
}
loadResources()