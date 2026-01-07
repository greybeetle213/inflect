window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
})
const versionTag = "?2"
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
        await fetch("dict_US/filteredConjs.json"+versionTag).then((r)=>(r.json())).then((r)=>(conjs=r))
        await fetch("dict_US/ipaToOrth.json"+versionTag).then((r)=>(r.json())).then((r)=>(ipaToOrth=r))
        await fetch("dict_US/ipaTree.json"+versionTag).then((r)=>(r.json())).then((r)=>(ipaTree=r))
        await fetch("dict_US/orthToIpa.json"+versionTag).then((r)=>(r.json())).then((r)=>(orthToIpa=r))
        await fetch("dict_US/orthTree.json"+versionTag).then((r)=>(r.json())).then((r)=>(orthTree=r))
        await fetch("dict_US/wordList.json"+versionTag).then((r)=>(r.json())).then((r)=>(wordList=r))
    }else{
        await fetch("dict/filteredConjs.json"+versionTag).then((r)=>(r.json())).then((r)=>(conjs=r))
        await fetch("dict/ipaToOrth.json"+versionTag).then((r)=>(r.json())).then((r)=>(ipaToOrth=r))
        await fetch("dict/ipaTree.json"+versionTag).then((r)=>(r.json())).then((r)=>(ipaTree=r))
        await fetch("dict/orthToIpa.json"+versionTag).then((r)=>(r.json())).then((r)=>(orthToIpa=r))
        await fetch("dict/orthTree.json"+versionTag).then((r)=>(r.json())).then((r)=>(orthTree=r))
        await fetch("dict/wordList.json"+versionTag).then((r)=>(r.json())).then((r)=>(wordList=r))
    }
    addExtrasToDict()
    proccessDictFiles()
    document.getElementById("mainMenu").style.visibility = "visible"
}
loadResources()