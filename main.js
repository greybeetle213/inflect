puzzleSettings = ["2",10]
firstGame = true
restored = false
daily = false
copyType = "solution"
history.pushState({mainMenu:true, america:america},"")
addEventListener("popstate", restoreFromHistory)

function onBodyLoad(){
    scaleFontAllElems()
    if(!localStorage.getItem("notFirstLoad")){
        initStorage()
    }
    try{
        loadStorage()
    } catch {
        initStorage()
        loadStorage()
    }
    updateDailyTimer()
    setInterval(updateDailyTimer,1000*60)
    if(location.search.length){
        loadChallange()
    }
}
function updateDailyTimer(){
    var day=Date.now()/86400000
    var miliSeconds = (day - Math.floor(day))*86400000
    var hoursSinceReset = miliSeconds/1000/60/60
    var hoursToReset = 24 - hoursSinceReset
    var minutes = Math.floor((hoursToReset - Math.floor(hoursToReset))*60)
    document.getElementById("dailyTimer").innerHTML = Math.floor(hoursToReset) + "h " + minutes + "m"
}
function playRandom(){
    daily = false
    seededRandom = Math.random
    document.getElementById("newPuzzle").style.display = "initial"
    document.getElementById("newPuzzleMobile").style.display = "initial"
    requestAnimationFrame(play)
}
function play(){
    document.getElementById("progressNewPuzzle").style.display = "initial"
    document.getElementById("playButton").innerHTML = "Generating Puzzle..."
    requestAnimationFrame(playRandomPuzzle)
}
function playRandomPuzzle(){
    document.getElementById("tutorialButtons").style.display=false
    if(puzzleSettings == "custom"){
        init(getBestPuzzle(customDiff, customTryNum, Number(document.getElementById("startCountCustom").value),Number(document.getElementById("goalCountCustom").value)))
    }else{
        init(getBestPuzzle(...puzzleSettings))
    }
}
function init(tree){
    if(!firstGame){
        if(!tutorial){
            addToBrowserHistory()
        }
        deleteAll()
    }
    openGame()
    // tree = getBestPuzzle(...puzzleSettings)
    wordsInPlay = new Set()
    for(var word of tree.activeWords){
        goalWords.push(word.orth)
    }
    for(var word of tree.roots){
        startWords.push(word.orth)
    }
    puzzle = {startWords:startWords, goal:goalWords}
    beginGame(puzzle)
}

function openGame(){
    document.getElementById("mainMenu").style.display = "none"
    document.getElementById("game").style.display = "initial"
    wordDiv = document.getElementById("words")
    multichoiceMenu = document.getElementById("multichoice")
    multichoicesDiv = document.getElementById("choices")
    buttonDict = {}
    touchDict = {}
    lastDrag = 0
    zoomScale = 1
    panAmount = {x:0, y:0}
    currentIdMax = 1
    goalWords = [] 
    startWords = []
    draging = false
    if(firstGame){
        addEventListener("resize", ()=>{makeElemOnscreen(document.getElementById("popupMenu"))})
        document.addEventListener("mousedown", closePopupMenuWhenClickedOffOf)
        document.addEventListener("touchstart", closePopupMenuWhenClickedOffOf)
        document.addEventListener("touchstart", startPanOrZoom, {passive: false})
        document.addEventListener("gesturestart", (e)=>{
            if(e.target.className.indexOf("canScroll")==-1&&e.target.parentNode.className.indexOf("canScroll")==-1){
                e.preventDefault()
            }
        }, {passive: false})
        document.addEventListener("touchmove", panAndZoom, {passive: false})
        multichoicesDiv.addEventListener("touchmove", manySelectTouchDrag)
        document.addEventListener("touchend", zoomEnd)
        document.addEventListener("wheel", zoomMouse)
        document.addEventListener("mousedown", (e)=>{
            if(e.target.className.indexOf("Word")==-1 && e.target.className.indexOf("Btn")==-1){
                draging = true
            }
            clicking = true
        })
        document.addEventListener("mouseup", (e)=>{
            draging = false
            lastDrag = 0
            clicking = false
        })
        document.addEventListener("mousemove", (e)=>{
            if(draging){
                panMouse(e)
            }
        })
        document.getElementById("dictionarySearch").addEventListener("input",searchDictionary)
        firstGame = false
    }
}

function displayAnswer(tree){
    deleteAll()
    zoomScale = 1
    panAmount = {x:0, y:0}
    wordDiv.style.transform = "scale("+zoomScale+")"
    wordDiv.style.translate = panAmount.x + "px " + panAmount.y + "px"
    document.getElementById("mainMenu").style.display = "none"
    document.getElementById("game").style.display = "initial"
    goalWords = [] 
    for(var word of tree.activeWords){
        goalWords.push(word.orth)
    }
    clickOpenedPopupMenu = false
    popupMenuWordId = 0
    currentIdMax = 0
    buttonDict = {}
    wordDiv = document.getElementById("words")
    multichoiceMenu = document.getElementById("multichoice")
    multichoicesDiv = document.getElementById("choices")
    clickFunction = (id)=>{popupMenu(id)}
    document.addEventListener("click", closePopupMenuWhenClickedOffOf)
    addEventListener("resize", makeAllOnscreen)
    puzzle = {goal:goalWords}
    tree.showAnswer()
    centerWords()
}

function beginGame(puzzleLocal){
    zoomScale = 1
    panAmount = {x:0, y:0}
    wordDiv.style.transform = "scale("+zoomScale+")"
    wordDiv.style.translate = panAmount.x + "px " + panAmount.y + "px"
    document.getElementById("progressNewPuzzle").style.display="none"
    puzzle = puzzleLocal
    goalWords = puzzle.goal
    clicking = false
    updateGoalText()
    puzzle.startWords.forEach((word)=>{
        var createdWordId = createWord(word)
        makeElemOnscreen(buttonDict[createdWordId].elem)
        moveWordSoNotIntersecting(createdWordId)
        var newWordOffset = getOffset(buttonDict[createdWordId].elem)
        if(newWordOffset.left + newWordOffset.width > window.innerWidth){
            buttonDict[createdWordId].elem.style.left = "0px"
            buttonDict[createdWordId].elem.style.top = newWordOffset.top + newWordOffset.height + 5 + "px"
        }
    })
    centerWords()
    clickOpenedPopupMenu = false
    popupMenuWordId = 0
    clickFunction = (id)=>{popupMenu(id)}
    if(!tutorial){
        updateBrowserHistory()
    }
}

function centerWords(){
    const html = document.getElementById("html")
    var bounds = getWordBounds()
    var boundsCenterX = (bounds.left + bounds.right)/2
    var centerX = html.clientWidth/2
    panAmount.x += centerX - boundsCenterX
    wordDiv.style.translate = panAmount.x + "px " + panAmount.y + "px"
    moveAllLines()
}

function addTieBar(symbol){
    if(symbol.length > 1 && symbol[1] != "ː"){
        if(symbol == "tʃ"){
            symbol = "t͡ʃ"
        }else if(symbol == "dʒ"){
            symbol = "d͡ʒ"
        }else{
            symbol = symbol[0] + "͜" + symbol[1]
        }
    }
    return(symbol)
}

function createWord(orth, data){
    if(!data){
        data = orth
    }
    newWord = document.createElement("div")
    newWord.classList.add("word")
    if(typeof(data)=="string"){
        newWord.classList.add("orthWord")
    } else {
        newWord.classList.add("ipaWord")
        orthList = [...data]
        orth = ""
        for(var symbol of data){
            orth += addTieBar(symbol)
        }
    }
    wordsInPlay.add(orth)
    newWord.innerHTML = orth
    var id = currentIdMax
    dragElement(newWord, ()=>{
        requestAnimationFrame(()=>(popupMenu(id)))
    }, ()=>{
        moveLines(id)
    })
    wordDiv.appendChild(newWord)
    scaleFontUnder(newWord)
    buttonDict[currentIdMax] = {elem:newWord, data:data, orth:orth, enabled:true, lines:[], children:[], parents:[]}
    if(puzzle.goal.indexOf(orth)!=-1){
        newWord.classList.add("goalWord")
    }
    currentIdMax += 1
    return(currentIdMax-1)
}

function moveLines(id){
    for(line of buttonDict[id].lines){
        updateLine(line.line, buttonDict[id].elem, buttonDict[line.connectedToId].elem)
    }
}

function moveAllLines(){
    for(var id of Object.keys(buttonDict)){
        moveLines(id)
    }
}

function revert(id, calledFromChlid=-1){
    for(var child of buttonDict[id].children){
        if(child==calledFromChlid){
            continue
        }
        deleteWord(child, id)
    }
    removeDeletedReferances(id)
    buttonDict[id].enabled = true
    buttonDict[id].elem.classList.remove("disabled") 
    updateGoalText()
}

function removeDeletedReferances(id){
    remainingChildren = []
    for(var i=0; i<buttonDict[id].children.length; i++){
        if(buttonDict[buttonDict[id].children[i]]){
            remainingChildren.push(buttonDict[buttonDict[id].children[i]])
        }
    }
    buttonDict[id].children = remainingChildren

    remainingLines = []
    for(var i=0; i<buttonDict[id].lines.length; i++){
        if(!buttonDict[buttonDict[id].lines[i].connectedToId]){
            buttonDict[id].lines[i].line.remove() 
        }else if(buttonDict[id].lines[i].line){
            remainingLines.push(buttonDict[id].lines[i])
        }
    }
    buttonDict[id].lines = remainingLines
}

function deleteWord(id, parentId){
    if(!buttonDict[id]){
        return
    }
    wordsInPlay.delete(buttonDict[id].orth)
    for(var child of buttonDict[id].children){
        deleteWord(child, id)
    }
    for(var line of buttonDict[id].lines){
        line.line.remove()
    }
    buttonDict[id].elem.remove()
    if(!parentId){
        return
    }
    var parents = buttonDict[id].parents
    delete buttonDict[id]
    if(parents.length > 1){
        for(var parent of parents){
            if(parent != parentId){
                revert(parent,id)
            }
        }
    }
}

function deleteAll(){
    for(var id of Object.keys(buttonDict)){
        deleteWord(id)
    }
    buttonDict = {}
    currentIdMax = 0
}

function createChildWord(parentId, orth, data, parentId2){
    if(!orth){
        return
    }
    buttonDict[parentId].enabled = false
    buttonDict[parentId].elem.classList.add("disabled")
    var newWordId = createWord(orth, data)
    var offset = getOffset(buttonDict[parentId].elem)
    var newWordOffset = getOffset(buttonDict[newWordId].elem)
    buttonDict[newWordId].elem.style.top = (Number(buttonDict[parentId].elem.style.top.slice(0,-2)) + offset.height*2/zoomScale) + "px"
    buttonDict[newWordId].elem.style.left = (Number(buttonDict[parentId].elem.style.left.slice(0,-2)) + offset.width/2/zoomScale - newWordOffset.width/2/zoomScale) + "px"
    line = connectLine(buttonDict[parentId].elem, buttonDict[newWordId].elem)
    buttonDict[parentId].lines.push({line:line,connectedToId:newWordId})
    buttonDict[newWordId].lines.push({line:line,connectedToId:parentId})
    buttonDict[parentId].children.push(newWordId)
    buttonDict[newWordId].parents.push(parentId)
    if(parentId2){
        secondLine = connectLine(buttonDict[parentId2].elem, buttonDict[newWordId].elem)
        buttonDict[parentId2].lines.push({line:secondLine, connectedToId:newWordId})
        buttonDict[parentId2].enabled = false
        buttonDict[parentId2].elem.classList.add("disabled")
        buttonDict[parentId2].children.push(newWordId)
        buttonDict[newWordId].lines.push({line:secondLine, connectedToId:parentId2})
        buttonDict[newWordId].parents.push(parentId2)
    }
    updateGoalText()
    return(newWordId)
}

function getForms(orth){
    forms = new Set()
    for(word of conjs.concat(extras)){
        if(word.indexOf(orth) != -1){
            forms = forms.union(new Set(word))
        }
    }
    forms.delete(orth)
    return(forms)
}
function changeForm(id){
    data = buttonDict[id].data
    orth = buttonDict[id].orth
    if(typeof(data)!="string"){
        return
    }
    forms = getForms(orth)
    if(forms.size == 0){
        return
    }
    forms = [...forms]
    var buttons = []
    for(var form of forms){
        if(wordsInPlay.has(form)){
            buttons.push({text:form, enabled:false, hoverText:"You have already used '"+form+"'"})
        }else{
            buttons.push({text:form, enabled:true})
        }
    }
    multichoice(buttons, (index)=>{createChildWord(id, forms[index])})
}


function toggleIPA(id){
    data = buttonDict[id].data
    orth = buttonDict[id].orth
    if(typeof(data)=="string"){
        toIPA(orth, id)
    }else{
        toOrth(data,id)
    }
}

function toIPA(orth,id){
    if(!orthToIpa[orth]){
        return
    }
    // deleteWord(id)
    ipa = orthToIpa[orth]
    joinedIPA = []
    for(let word of ipa){
        var joinedWord = ""
        for(var sound of word){
            joinedWord += addTieBar(sound)
        }
        joinedIPA.push(joinedWord)
    }
    var buttons = []
    var disabledButton = false
    for(let word of joinedIPA){
        if(wordsInPlay.has(word)){
            buttons.push({text:word, enabled:false, hoverText:"You have already used /"+word+"/"})
            disabledButton = true
        }else{
            buttons.push({text:word, enabled:true})
        }
    }
    if(ipa.length > 1 || disabledButton){
        multichoice(buttons, (index)=>{createChildWord(id, ipa[index].join(""), ipa[index])})
    }else{
        createChildWord(id, ipa[0].join(""), ipa[0])
        closePopupMenu()
    }
}

function toOrth(data, id){
    if(!ipaToOrth[data.join(",")]){
        return
    }
    orth = ipaToOrth[data.join(",")]
    var disabledButton = false
    var buttons = []
    for(var word of orth){
        if(wordsInPlay.has(word)){
            buttons.push({text:word, enabled:false, hoverText: "You have already used '"+word+"'"})
            disabledButton = true
        }else{
            buttons.push({text:word, enabled:true})
        }
    }
    if(orth.length > 1 || disabledButton){
        multichoice(buttons, (index)=>{createChildWord(id, orth[index])})
    }else{
        createChildWord(id, orth[0])
        closePopupMenu()
    }
}

function splitWord(id){
    data = buttonDict[id].data
    orth = buttonDict[id].orth
    if(typeof(data)=="string"){
        splitWordOrth(orth, id)
    }else{
        splitWordIpa(data,id)
    }
}

function splitWordIpa(data,id){
    if(!ipaToOrth[data.join()]){
        return
    }
    var options = []
    var buttons = []
    var wordList = Object.keys(ipaToOrth)
    for(var startWord of wordList){
        startWordLength = startWord.split(",").length
        if(data.length < startWordLength){
            continue
        }
        if(data.slice(0,startWordLength).join() != startWord){
            continue
        }
        for(var endWord of wordList){
            if(data.slice(startWordLength).join()==endWord){
                options.push([startWord.split(","), endWord.split(",")])

                var textLabel = startWord.replaceAll(",","")+" "+endWord.replaceAll(",","")
                if(wordsInPlay.has(startWord.replaceAll(",",""))){
                    buttons.push({text:textLabel, enabled:false, hoverText:"You have already used /"+startWord.replaceAll(",","")+"/"})
                }else if(wordsInPlay.has(endWord.replaceAll(",",""))){
                    buttons.push({text:textLabel, enabled:false, hoverText:"You have already used /"+endWord.replaceAll(",","")+"/"})
                }else{
                    buttons.push({text:textLabel, enabled:true})
                }
            }
        }
    }
    if(!buttons.length){
        return
    }
    multichoice(buttons, (index)=>{
        var w1 = createChildWord(id, options[index][0].join(""), options[index][0])
        var w2 = createChildWord(id, options[index][1].join(""), options[index][1])
        var w1Offset = getOffset(buttonDict[w1].elem)
        buttonDict[w2].elem.style.left = Number(buttonDict[w1].elem.style.left.slice(0,-2)) + (w1Offset.width+5)/zoomScale + "px"
        var w2Offset = getOffset(buttonDict[w2].elem)
        var moveDirection = w2Offset.width/2/zoomScale
        buttonDict[w1].elem.style.left = (Number(buttonDict[w1].elem.style.left.slice(0,-2)) - moveDirection) + "px"
        buttonDict[w2].elem.style.left = (Number(buttonDict[w2].elem.style.left.slice(0,-2)) - moveDirection) + "px"
        moveLines(w1)
        moveLines(w2)
    })
}

function splitWordOrth(orth, id){
    if(!orthToIpa[orth]){
        return
    }
    var options = []
    var buttons = []
    var wordList = Object.keys(orthToIpa)
    for(var startWord of wordList){
        if(!orth.startsWith(startWord)){
            continue
        }
        for(var endWord of wordList){
            if(orth.slice(startWord.length)==endWord){
                options.push([startWord, endWord])
                var textLabel = startWord+" "+endWord
                if(wordsInPlay.has(startWord)){
                    buttons.push({text:textLabel, enabled:false, hoverText:"You have already used '"+startWord+"'"})
                }else if(wordsInPlay.has(endWord)){
                    buttons.push({text:textLabel, enabled:false, hoverText:"You have already used '"+endWord+"'"})
                }else{
                    buttons.push({text:textLabel, enabled:true})
                }
            }
        }
    }
    if(!buttons.length){
        return
    }
    multichoice(buttons, (index)=>{
        var w1 = createChildWord(id, options[index][0])
        var w2 = createChildWord(id, options[index][1])
        var w1Offset = getOffset(buttonDict[w1].elem)
        buttonDict[w2].elem.style.left = Number(buttonDict[w1].elem.style.left.slice(0,-2)) + (w1Offset.width+5)/zoomScale + "px"
        var w2Offset = getOffset(buttonDict[w2].elem)
        var moveDirection = w2Offset.width/2/zoomScale
        buttonDict[w1].elem.style.left = (Number(buttonDict[w1].elem.style.left.slice(0,-2)) - moveDirection) + "px"
        buttonDict[w2].elem.style.left = (Number(buttonDict[w2].elem.style.left.slice(0,-2)) - moveDirection) + "px"
        moveLines(w1)
        moveLines(w2)
    })
}

function deletePhonemeOrLetter(id){
    data = buttonDict[id].data
    orth = buttonDict[id].orth
    if(typeof(data)=="string"){
        deleteLetter(orth, id)
    }else{
        deletePhoneme(data,id)
    }
}

function deletePhoneme(data,id){
    ipa = [...data]
    data = [...data]
    for(var i = 0; i<data.length;i++){
        data[i] = addTieBar(data[i])
    }
    manySelect(data, 
        (indexes)=>{
            removed = []
            for(var i=0; i<ipa.length;i++){
                if(!indexes.has(i)){
                    removed.push(ipa[i])
                }
            }        
            createChildWord(id, removed.join(""),removed)
        },
        (indexes)=>{
            removed = []
            orth = ""
            for(var i=0; i<ipa.length;i++){
                if(!indexes.has(i)){
                    removed.push(ipa[i])
                    orth += addTieBar(ipa[i])
                }
            } 
            if(!removed.length){
                return({wordOk:false, hoverText:"You must keep at least one phoneme"})
            }
            if(wordsInPlay.has(orth)){
                return({wordOk:false, hoverText:"You have already used /"+removed.join("")+"/"})
            }
            return({wordOk:true})
        }
    )
}

function deleteLetter(orth, id){
    // closePopupMenu()
    manySelect(orth.split(""), 
        (indexes)=>{
            orig = orth.split("")
            removed = []
            for(var i=0; i<orig.length;i++){
                if(!indexes.has(i)){
                    removed.push(orig[i])
                }
            }
            createChildWord(id,removed.join(""))
        },
        (indexes)=>{
            orig = orth.split("")
            removed = []
            for(var i=0; i<orig.length;i++){
                if(!indexes.has(i)){
                    removed.push(orig[i])
                }
            }
            if(!removed.length){
                return({wordOk:false, hoverText:"You must keep at least one letter"})
            }
            if(wordsInPlay.has(removed.join(""))){
                return({wordOk:false, hoverText:"You have already used '"+removed.join("")+"'"})
            }
            return({wordOk:true})
        }
    )
}

function mergeMenu(id){
    buttons = Object.keys(buttonDict)
    possibleMerges = []
    for(button of buttons){
        if(!buttonDict[button].enabled){
            continue
        }
        if(button==id){
            continue
        }
        if(typeof(buttonDict[button].data) != typeof(buttonDict[id].data)){
            continue
        }
        possibleMerges.push(button)
    }
    var buttons = []
    for(var btn of possibleMerges){
        if(wordsInPlay.has(buttonDict[id].orth+buttonDict[btn].orth)){
            if(typeof(buttonDict[id].data)=="string"){
                var mergeWord = "'"+buttonDict[id].orth+buttonDict[btn].orth+"'"
            }else{
                var mergeWord = "/"+buttonDict[id].orth+buttonDict[btn].orth+"/"
            }
            buttons.push({text:buttonDict[btn].orth, enabled:false, hoverText:"You have already used "+mergeWord})
        }else{
            buttons.push({text:buttonDict[btn].orth, enabled:true})   
        }
    }
    multichoice(buttons, (index)=>{merge(id, possibleMerges[index])})
}

function merge(w1,w2){
    w1data = buttonDict[w1].data
    w1orth = buttonDict[w1].orth
    w2data = buttonDict[w2].data
    w2orth = buttonDict[w2].orth
    mergedOrth = w1orth + w2orth
    if(typeof(w1data)=="string"){
        mergedData = w1data + w2data
    }else{
        mergedData = w1data.concat(w2data)
    }
    newWordId = createChildWord(w1, mergedOrth, mergedData, w2)

    closePopupMenu()
}

function multichoiceBigMenu(choices, func){
    multichoiceMenu.style.display = "initial"
    for(let i = 0; i<choices.length;i++){
        btn = document.createElement("button")
        btn.innerHTML = choices[i]
        btn.onclick = ()=>{
            func(i)
            multichoiceMenu.style.display = "none"
            multichoicesDiv.innerHTML = ""
        }
        multichoicesDiv.appendChild(btn)
    }
}

function multichoice(choices, func){
    div = document.getElementById("customButtons")
    div.style.display = "initial"
    document.getElementById("standardPopupButtons").style.display = "none"
    for(let i = 0; i<choices.length;i++){
        btn = document.createElement("button")
        btn.classList.add("popupBtn")
        if(choices[i].enabled){
            btn.innerHTML = choices[i].text
            btn.onclick = ()=>{
                func(i)
                closePopupMenu()
            }
        }else{
            btn.innerHTML = "<span class='hoverText'>"+choices[i].hoverText+"</span>" + choices[i].text
            btn.disabled = "true"
        }
        div.appendChild(btn)
        div.appendChild(document.createElement("br"))
    }
    makeElemOnscreen(document.getElementById("popupMenu"))
}

selectedIds = new Set()
function manySelect(choices,func, verifyFunc){
    selectedIds = new Set()
    document.getElementById("standardPopupButtons").style.display = "none"
    multichoiceMenu.style.display = "initial"
    document.getElementById("doneBtn").style.display = "initial"
    document.getElementById("doneBtn").innerHTML = "Done"
    document.getElementById("doneBtn").disabled = "true"
    document.getElementById("manySelectHover").innerHTML = ""
    document.getElementById("doneBtn").onclick = ()=>{
        closePopupMenu()
        func(selectedIds)            
    }
    for(let i = 0; i<choices.length;i++){
        let btn = document.createElement("button")
        btn.classList.add("canScroll")
        btn.classList.add("popupBtnMultiSelect")
        btn.innerHTML = choices[i]
        let clickFunction = ()=>{
            if(!selectedIds.delete(i)){
                selectedIds.add(i)
                btn.style.color = "red"
            }else{
                btn.style.color = "black"
            }
            var verify = verifyFunc(selectedIds)
            if(verify.wordOk){
                document.getElementById("doneBtn").disabled = null
                document.getElementById("doneBtn").innerHTML = "Done"
                document.getElementById("manySelectHover").innerHTML = ""
            }else{
                document.getElementById("doneBtn").disabled = "true"
                document.getElementById("manySelectHover").innerHTML = verify.hoverText
            }
        }
        btn.onpointerenter = ()=>{            
            if(clicking){
                clickFunction()
            }
        }
        btn.onmousedown = clickFunction
        // btn.ontouchstart = clickFunction
        multichoicesDiv.appendChild(btn)
    }
    makeElemOnscreen(document.getElementById("popupMenu"))
}

function manySelectTouchDrag(e){
    if(e.changedTouches.length!=1){
        return
    }
    var touch = e.changedTouches[0]
    var lastPos = touchDict[e.changedTouches[0].identifier]
    for(var button of multichoicesDiv.childNodes){
        var offset = getOffset(button)
        var lastPosOverlapping = (lastPos.lastX > offset.left && lastPos.lastX < offset.left + offset.width && lastPos.lastY > offset.top && lastPos.lastY < offset.top + offset.height)
        var currentPosOverlapping = (touch.clientX > offset.left && touch.clientX < offset.left + offset.width && touch.clientY > offset.top && touch.clientY < offset.top + offset.height)
        if((currentPosOverlapping && !lastPosOverlapping)||(lastPosOverlapping&&!lastPos.firstButtonSelected)){
            button.onmousedown()
        }
    }
    touchDict[e.changedTouches[0].identifier] = {lastX:touch.clientX, lastY:touch.clientY,firstButtonSelected:true}
}

function popupMenu(id){
    popupMenuWordId = id
    clickOpenedPopupMenu = true
    popupMenuDiv = document.getElementById("popupMenu")
    popupMenuDiv.style.display = "initial"
    pos = getOffset(buttonDict[id].elem)
    popupMenuDiv.style.top = pos.top+10+"px"
    popupMenuDiv.style.left = pos.left+10+"px"
    if(typeof(buttonDict[id].data)=="string"){
        isIpa = false
    }else{
        isIpa = true
    }
    document.getElementById("customButtons").style.display = "none"
    document.getElementById("customButtons").innerHTML = ""
    document.getElementById("standardPopupButtons").style.display = (buttonDict[id].enabled) ? "initial" : "none"
    document.getElementById("revert").style.display = (!buttonDict[id].enabled) ? "initial" : "none"

    if(isIpa){
        document.getElementById("toIPA").style.display = "none"
        document.getElementById("changeForm").style.display = "none"
        document.getElementById("deleteLetter").style.display = "none"

        document.getElementById("deletePhoneme").style.display = "initial"
        document.getElementById("toOrth").style.display = "initial"
        document.getElementById("merge").style.display = "initial"
        document.getElementById("split").style.display = "initial"

        if(ipaToOrth[buttonDict[id].data.join(",")]){
            document.getElementById("toOrth").disabled = null
            if(getIPASplits(buttonDict[id].data).length){
                document.getElementById("split").disabled = null
            }else{
                document.getElementById("split").disabled = "true"
                document.getElementById("splitHover").innerHTML = "No splits found for /" + buttonDict[id].orth + "/"
            }
        }else{
            document.getElementById("toOrth").disabled = "true"
            document.getElementById("toOrthHover").innerHTML = "/" + buttonDict[id].orth + "/ is not a word"
            document.getElementById("split").disabled = "true"
            document.getElementById("splitHover").innerHTML = "/" + buttonDict[id].orth + "/ is not a word"
        }

        var ipaWordCount = 0
        for(var word of Object.values(buttonDict)){
            if(typeof(word.data) != "string" && word.enabled){
                ipaWordCount += 1
            }
        }
        if(ipaWordCount > 1){
            document.getElementById("merge").disabled = null
        }else{
            document.getElementById("merge").disabled = "true"
            document.getElementById("mergeHover").innerHTML = "There are no other IPA words to merge with"
        }
    }else{
        document.getElementById("deletePhoneme").style.display = "none"
        document.getElementById("merge").style.display = "none"
        document.getElementById("toOrth").style.display = "none"
        document.getElementById("toIPA").style.display = "initial"
        document.getElementById("deleteLetter").style.display = "initial"
        document.getElementById("changeForm").style.display = "initial"
        document.getElementById("merge").style.display = "initial"
        document.getElementById("split").style.display = "initial"

        if(orthToIpa[buttonDict[id].data]){
            document.getElementById("toIPA").disabled = null
            if(conjDict[buttonDict[id].orth] && conjDict[buttonDict[id].orth].size > 1){
                document.getElementById("changeForm").disabled = null
            } else {
                document.getElementById("changeForm").disabled = true
                document.getElementById("changeFormHover").innerHTML = "No inflectional variants of '" + buttonDict[id].orth + "'"
            }
            if(getOrthSplits(buttonDict[id].orth).length){
                document.getElementById("split").disabled = null
            }else{
                document.getElementById("split").disabled = "true"
                document.getElementById("splitHover").innerHTML = "No splits found for '" + buttonDict[id].orth + "'"
            }
        }else{
            document.getElementById("toIPA").disabled = "true"
            document.getElementById("toIPAHover").innerHTML = "'"+buttonDict[id].orth + "' is not a word"
            document.getElementById("changeForm").disabled = true
            document.getElementById("changeFormHover").innerHTML = "'"+buttonDict[id].orth + "' is not a word"
            document.getElementById("split").disabled = "true"
            document.getElementById("splitHover").innerHTML = "'"+buttonDict[id].orth + "' is not a word"
        }

        var orthWordCount = 0
        for(var word of Object.values(buttonDict)){
            if(typeof(word.data) == "string" && word.enabled){
                orthWordCount += 1
            }
        }
        if(orthWordCount > 1){
            document.getElementById("merge").disabled = null
        }else{
            document.getElementById("merge").disabled = "true"
            document.getElementById("mergeHover").innerHTML = "There are no other spelled out words to merge with"
        }
    }
    hiddenButtonsForTutorial.forEach((id)=>{
        document.getElementById(id).style.display = "none"
    })
    makeElemOnscreen(popupMenuDiv)
}

function closePopupMenu(){
    document.getElementById("popupMenu").style.display = "none"
    document.getElementById("customButtons").innerHTML = ""
    document.getElementById("customButtons").style.display = "none"
    document.getElementById("multichoice").style.display = "none"
    document.getElementById("choices").innerHTML = ""
}

function closePopupMenuWhenClickedOffOf(event){
    if(event.target.className.indexOf("popupBtn") == -1 && (!event.target.parentNode.className || event.target.parentNode.className.indexOf("popupBtn") == -1)){
        closePopupMenu()
    }
    if(event.target.parentNode.id != "mobileMenu" && (!event.target.parentNode.parentNode || event.target.parentNode.parentNode.id != "mobileMenu") && event.target.parentNode.id != "closeMobileMenuButton" && event.target.parentNode.id != "mobileButtonBox"){
        closeMobileMenu()
    }
}

function makeElemOnscreen(elem){
    const html = document.getElementById("html")    
    pos = getOffset(elem)
    toolBarPos = getOffset(document.getElementById("toolBar"))
    if(pos.left<0){
        elem.style.left = "5px"
    }
    if(pos.top<0+toolBarPos.height){
        elem.style.top = 5+toolBarPos.height+"px"
    }
    pos = getOffset(elem)
    if(pos.top + pos.height > html.clientHeight){
        elem.style.top = html.clientHeight-pos.height + "px"
    }
    if(pos.left + pos.width > html.clientWidth){
        elem.style.left = html.clientWidth-pos.width + "px"
    }
}
function moveWordSoNotIntersecting(id){
    var elem = buttonDict[id].elem
    scaleFontUnder(elem)
    var pos = getOffset(elem)
    for(var button of Object.values(buttonDict)){
        if(button.elem==elem){
            continue
        }
        var pos2 = getOffset(button.elem)
        if(pos.left > pos2.left+pos2.width || pos2.left > pos.left + pos.width){
            continue
        }
        if(pos.top > pos2.top+pos2.height || pos2.top > pos.top + pos.height){
            continue
        }
        elem.style.left = pos2.left + pos2.width + 10 + "px"
        pos = getOffset(elem)
        moveLines(id)
    }
}

function elemsIntersecting(elem1, elem2){
    var pos = getOffset(elem1)
    var pos2 = getOffset(elem2)
    if(pos.left > pos2.left+pos2.width || pos2.left > pos.left + pos.width){
        return(false)
    }
    if(pos.top > pos2.top+pos2.height || pos2.top > pos.top + pos.height){
        return(false)
    }
    return(true)
}

function makeAllOnscreen(){
    for(var id of Object.keys(buttonDict)){
        makeElemOnscreen(buttonDict[id].elem)
        moveLines(id)
    }
}

function updateGoalText(){
    goalText = [...goalWords]
    var completedWordCount = 0
    for(var word of Object.values(buttonDict)){
        if(!word.enabled){
            continue
        }
        var index = goalText.indexOf(word.orth)
        if(index != -1){
            completedWordCount ++
            goalText[index] = "<span class='completedGoal' onclick='searchWord(\""+goalText[index]+"\")'>"+goalText[index]+"</span>"
        }
    }
    for(var i = 0; i<goalText.length; i++){
        if(goalText[i].indexOf("<")==-1){
            goalText[i] = "<span onclick='searchWord(\""+goalText[i]+"\")'>"+goalText[i]+"</span>"
        }
    }
    console.log(goalText)
    goalPrefix = "GOAL"
    if(puzzle.goal.length > 1){
        goalPrefix += "S"
    }
    goalPrefix += ": "

    document.getElementById("goalText").innerHTML = goalPrefix + goalText.join(", ")
    if(completedWordCount == goalText.length && !answerShown){
        document.getElementById("toolBar").style.backgroundColor = "green"
        document.getElementById("goalText").style.color = "white" 
        for(var elem of document.getElementsByClassName("completedGoal")){
            elem.style.color="white"
        }
        if(lastTutorialQuestion){
            document.getElementById("showAnswer").style.display = "none"
            document.getElementById("nextTutorial").style.display = "none"
            document.getElementById("menuButtonTutorial").innerHTML = "Finish"
        }else if(tutorial){
            document.getElementById("nextTutorial").style.display = "initial"
            document.getElementById("showAnswer").style.display = "none"
        }else{
            if(!daily){
                document.getElementById("mobileReplayButton").style.display = "initial"
            }
            document.getElementById("openShareMenu").style.display = "initial"
            document.getElementById("mobileShareButton").style.display = "initial"
        }
    }else{
        document.getElementById("toolBar").style.backgroundColor = "white"
        document.getElementById("goalText").style.color = "black" 
        document.getElementById("mobileReplayButton").style.display = "none"
        document.getElementById("openShareMenu").style.display = "none"
        document.getElementById("mobileShareButton").style.display = "none"
    }
    if(!tutorial){
        updateBrowserHistory()
    }
}

function selectDifficulty(dif){
    document.getElementById("lvl0").classList.add("disabled")
    document.getElementById("lvl1").classList.add("disabled")
    document.getElementById("lvl2").classList.add("disabled")
    document.getElementById("lvl3").classList.add("disabled")
    document.getElementById("lvl4").classList.add("disabled")
    document.getElementById("lvl5").classList.add("disabled")
    document.getElementById("custom").classList.add("disabled")

    document.getElementById(dif).classList.remove("disabled")
    document.getElementById("customDificulty").style.display = "none"
    localStorage.setItem("difficulty", dif)
    switch(dif){
        case "lvl0":
            puzzleSettings=["0",10]
            break
        case "lvl1":
            puzzleSettings=["1",10]
            break
        case "lvl2":
            puzzleSettings=["2",20]
            break
        case "lvl3":
            puzzleSettings=["3",20]
            break
        case "lvl4":
            puzzleSettings=["4",20]
            break
        case "lvl5":
            puzzleSettings=["5",20]
            break
        case "custom":
            document.getElementById("customDificulty").style.display = "flex"
            puzzleSettings="custom"
            break
    }
}

function selectStepNum(dif){
    document.getElementById("veryFewSteps").classList.add("disabled")
    document.getElementById("fewSteps").classList.add("disabled")
    document.getElementById("mediumSteps").classList.add("disabled")
    document.getElementById("manySteps").classList.add("disabled")
    document.getElementById(dif).classList.remove("disabled")
    localStorage.setItem("customStepNum", dif)
    switch(dif){
        case "veryFewSteps":
            customDiff = "2"
            customTryNum = 5
            break
        case "fewSteps":
            customDiff = "3"
            customTryNum = 10
            break
        case "mediumSteps":
            customDiff = "4"
            customTryNum = 20
            break
        case "manySteps":
            customDiff = "5"
            customTryNum = 20
            break
    }

}

function getDifferanceBetweenPoints(x1,y1,x2,y2){
    var xdistance = x1-x2
    var ydistance = y1-y2
    return(Math.pow((Math.pow(xdistance,2) + Math.pow(ydistance,2)),0.5))
}

function getZoomChange(e){
    var p1 = e.touches[0]
    var p2 = e.touches[1]
    var oldDistance = getDifferanceBetweenPoints(touchDict[p1.identifier].lastX,touchDict[p1.identifier].lastY,touchDict[p2.identifier].lastX,touchDict[p2.identifier].lastY)
    var newDistance = getDifferanceBetweenPoints(p1.clientX, p1.clientY, p2.clientX, p2.clientY)

    var oldCenterX = (touchDict[p1.identifier].lastX + touchDict[p2.identifier].lastX)/2
    var oldCenterY = (touchDict[p1.identifier].lastY + touchDict[p2.identifier].lastY)/2
    var centerX = (p1.clientX + p2.clientX)/2
    var centerY = (p1.clientY + p2.clientY)/2

    for(var touch of e.touches){
        touchDict[touch.identifier].lastX = touch.clientX
        touchDict[touch.identifier].lastY = touch.clientY
    }
    var scale = newDistance/oldDistance
    if(scale*zoomScale > 5){
        scale = 1
    }
    if(scale*zoomScale < 0.1){
        scale = 1
    }
    var pan = {x: centerX - oldCenterX, y: centerY - oldCenterY}
    // adjust for offset when zooming
    var centerXOffset = window.innerWidth/2 - centerX
    var centerYOffset = - centerY
    pan.x += (panAmount.x + centerXOffset)*scale - (panAmount.x + centerXOffset)
    pan.y += (panAmount.y + centerYOffset)*scale - (panAmount.y + centerYOffset)
    return({scale: scale, pan:pan})
}
function zoomEnd(e){
    touchDict = {}
    startPanOrZoom(e)
}
function startPanOrZoom(e){
    for(var touch of e.touches){
        if(!touchDict[touch.identifier]){
            touchDict[touch.identifier] = {lastX: touch.clientX, lastY: touch.clientY}
        }
    }
}
function getPanChange(e){
    touch = e.touches[0]
    change = {
        x: touch.clientX - touchDict[touch.identifier].lastX,
        y: touch.clientY - touchDict[touch.identifier].lastY
    }
    touchDict[touch.identifier] = {lastX: touch.clientX, lastY: touch.clientY}
    return(change)
}

function panMouse(e){
    if(e.target.parentNode.className && e.target.parentNode.className.indexOf("canScroll")!=-1){
        return
    }
    if(e.target.className.indexOf("canScroll")!=-1){
        return
    }
    if(!lastDrag){
        lastDrag = {x: e.clientX, y:e.clientY}
        return({x:0, y:0})
    }
    panAmount.x += e.clientX - lastDrag.x
    panAmount.y += e.clientY - lastDrag.y
    lastDrag.x = e.clientX
    lastDrag.y = e.clientY
    wordDiv.style.translate = panAmount.x + "px " + panAmount.y + "px"
    moveAllLines()
    limitPan()
}

function zoomMouse(e){
    if(e.target.parentNode.className && e.target.parentNode.className.indexOf("canScroll")!=-1){
        return
    }
    if(e.target.className.indexOf("canScroll")!=-1){
        return
    }
    if(e.target.className.indexOf("Btn")!=-1){
        return
    }
    var scaleChange = 1 - e.deltaY/1000
    zoomScale *= scaleChange
    if(zoomScale > 5){
        zoomScale = 5
        scaleChange = 1
    }
    if(zoomScale < 0.1){
        zoomScale = 0.1
        scaleChange = 1
    }
    wordDiv.style.transform = "scale("+zoomScale+")"
    var centerXOffset = window.innerWidth/2 - e.clientX
    var centerYOffset = - e.clientY
    panAmount.x += (panAmount.x + centerXOffset)*scaleChange - (panAmount.x + centerXOffset)
    panAmount.y += (panAmount.y + centerYOffset)*scaleChange - (panAmount.y + centerYOffset)
    wordDiv.style.translate = panAmount.x + "px " + panAmount.y + "px"
    moveAllLines()
    limitPan()
}

function panAndZoom(e){
    for(var touch of e.touches){
        if(touch.target.className.indexOf("Word")!=-1 || touch.target.className.indexOf("Btn")!=-1 || touch.target.className.indexOf("canScroll")!=-1){
            return
        }
        if(touch.target.parentNode.className && touch.target.parentNode.className.indexOf("canScroll")){
            return
        }
    }
    e.preventDefault()
    if(e.touches.length == 2){
        var zoomInfo = getZoomChange(e)
        zoomScale *= zoomInfo.scale
        var panChange = zoomInfo.pan
    }else if(e.touches.length == 1){
        var panChange = getPanChange(e)
    }
    panAmount.x += panChange.x
    panAmount.y += panChange.y
    wordDiv.style.transform = "scale("+zoomScale+")"
    wordDiv.style.translate = panAmount.x + "px " + panAmount.y + "px"
    moveAllLines()
    limitPan()
}

function getWordBounds(){
    for(var word of Object.values(buttonDict)){
        var offset = getOffset(word.elem)
        if(!bounds){
            var bounds = {left:offset.left,top:offset.top,right:offset.left+offset.width,bottom:offset.top+offset.height}
            continue
        }
        bounds.left = Math.min(bounds.left, offset.left)
        bounds.top = Math.min(bounds.top, offset.top)
        bounds.right = Math.max(bounds.right, offset.left+offset.width)
        bounds.bottom = Math.max(bounds.bottom, offset.top+offset.height)
    }
    return(bounds)
}

function limitPan(){
    var bounds = getWordBounds()
    if(bounds.right < 0){
        panAmount.x -= bounds.right
    }
    if(bounds.bottom < 0){
        panAmount.y -= bounds.bottom
    }
    if(bounds.left > window.innerWidth){
        panAmount.x -= bounds.left - window.innerWidth
    }
    if(bounds.top > window.innerHeight){
        panAmount.y -= bounds.top - window.innerHeight
    }
    wordDiv.style.translate = panAmount.x + "px " + panAmount.y + "px"
    moveAllLines()
}

function searchWord(word){
    openDictionary()
    document.getElementById("dictionarySearch").value = word
    searchDictionary()
}

function openDictionary(){
    document.getElementById("dictionary").style.display = "flex"
    document.getElementById("showDictionary").style.display = "none"
    document.getElementById("searchFailed").innerHTML = "Type something"
    document.getElementById("dictionarySearch").value = ""
    document.getElementById("searchResults").innerHTML = ""
    document.getElementById("dictionarySearch").focus()
}
function closeDictionary(){
    document.getElementById("dictionary").style.display = "none"
    document.getElementById("showDictionary").style.display = "initial"
}
function searchDictionary(){
    var search = document.getElementById("dictionarySearch").value
    search = search.toLowerCase()
    search = search.replaceAll(" ", "")
    document.getElementById("searchResults").innerHTML = ""
    if(!search){
        document.getElementById("searchFailed").innerHTML = "Type something"
        document.getElementById("searchFailed").style.display = "initial"
        return
    }
    displaySearchResults(search)
}

function getBestSearchResults(word){
    var currentSearchNode = orthTree
    word = [...word]
    for(var letter of word){
        currentSearchNode = currentSearchNode[letter]
        if(!currentSearchNode){
            return([])
        }
    }
    outlist = []
    if(currentSearchNode.canEnd){
        outlist.push(word.join(""))
    }
    var maxSearchResults = 20
    var currentPaths = []
    for(var key of Object.keys(currentSearchNode)){
        if(key != "canEnd"){
            currentPaths.push([word.join("")+key, currentSearchNode[key]])
        }
    }
    while(currentPaths.length && outlist.length < maxSearchResults){
        currentPathsNextIter = []
        for(var path of currentPaths){
            if(path[1].canEnd){
                outlist.push(path[0])
            }
            for(var key of Object.keys(path[1])){
                if(key != "canEnd"){
                    currentPathsNextIter.push([path[0]+key, path[1][key]])
                }
            }
        }
        currentPaths = currentPathsNextIter
    }
    return(outlist)
}
function displaySearchResults(word){
    var searchResults = getBestSearchResults(word)
    if(searchResults.length){
        document.getElementById("searchFailed").style.display = "none"
        searchResults.forEach((result)=>{
            displaySearchResult(result)
        })
    }else{
        document.getElementById("searchFailed").style.display = "initial"   
        document.getElementById("searchFailed").innerHTML = "No results"
    }
}
function displaySearchResult(word){
    var searchResult = document.createElement("div")
    searchResult.classList.add("searchResult")
    searchResult.classList.add("canScroll")
    var title = document.createElement("span")
    title.classList.add("searchHeader")
    title.classList.add("canScroll")
    title.innerHTML = "<span class='searchTitle'>"+word+"</span>"
    var ipaWordsFormated = []
    for(var ipaWord of orthToIpa[word]){
        var ipaWordFormated = ""
        for(var sound of ipaWord){
            ipaWordFormated += addTieBar(sound)
        }
        ipaWordsFormated.push("/"+ipaWordFormated+"/")
    }
    title.innerHTML += "<span class='transcriptions'>" + ipaWordsFormated.join(", ") + "</span>"
    searchResult.appendChild(title)
    // searchResult.appendChild(ipaList)

    var conjList = document.createElement("span")
    conjList.classList.add("canScroll")
    conjList.classList.add("conjList")
    if(conjDict[word] && conjDict[word].size > 1){
        conjList.innerHTML = [...getForms(word)].join(", ")
    }else{
        conjList.innerHTML = "No inflections"
    }
    searchResult.appendChild(conjList)

    document.getElementById("searchResults").appendChild(searchResult)
}

function getScrollTopMax(elem){
    return(elem.scrollHeight - elem.clientHeight)
}

function scrollFunc(e){
    e.target.style.boxShadow = "0px -3px 3px grey"
    if(e.target.scrollTop != 0){
        e.target.style.boxShadow += ",0px 10px 10px grey inset"
    }
    if(e.target.scrollTop < getScrollTopMax(e.target)-10){
        e.target.style.boxShadow += ", 0px -10px 10px grey inset"
    }
}

function openMobileMenu(){
    document.getElementById("mobileMenu").style.display = "flex"
    document.getElementById("openMobileMenuButton").style.display = "none"
    document.getElementById("closeMobileMenuButton").style.display = "initial"
}
function closeMobileMenu(){
    if(tutorial){
        return
    }
    document.getElementById("mobileMenu").style.display = "none"
    document.getElementById("openMobileMenuButton").style.display = "initial"
    document.getElementById("closeMobileMenuButton").style.display = "none"
}

function constrainInputNumber(id){
    var value = document.getElementById(id).value
    var min = Number(document.getElementById(id).min)
    var max = Number(document.getElementById(id).max)

    value = value.replaceAll(/[^\d]/g,"")
    value = Number(value)
    value = Math.max(min, value)
    value = Math.min(max, value)
    document.getElementById(id).value = value
    switch(id){
        case "startCountCustom":
            localStorage.setItem("customStartCount", document.getElementById("startCountCustom").value)
        break
        case "goalCountCustom":
            localStorage.setItem("customGoalCount", document.getElementById("goalCountCustom").value)
        break
    }
}

function boardToCanvas(solutionHidden){
    const canvas = document.createElement("canvas")
    const bounds = getWordBounds()
    const padding = 40
    const goalRes = 1080
    const width = bounds.right - bounds.left
    const height = bounds.bottom - bounds.top
    const scale = Math.max(width, height)/(goalRes-padding)
    const borderScale = 0.05 //0.1*word box height
    const verticalOffset = padding/2 + ((goalRes-padding)/2 - height/scale/2)
    const horizontalOffset = padding/2 + ((goalRes-padding)/2 - width/scale/2)
    canvas.width = goalRes
    canvas.height = goalRes
    globalToLocal = (x, y) => {
        x -= bounds.left
        x /= scale
        y -= bounds.top
        y /= scale
        return({x:x,y:y})
    }
    var ctx = canvas.getContext("2d")
    ctx.fillStyle = "green"
    ctx.fillRect(0,0,goalRes,goalRes)
    ctx.fillStyle = "white"
    ctx.fillRect(padding/4,padding/4,goalRes-padding*0.5,goalRes-padding*0.5)
    ctx.textBaseline = "top"
    ctx.textAlign = "left"
    var fontSet = false
    ctx.strokeStyle = "black"
    ctx.lineWidth = 5
    for(var word of Object.values(buttonDict)){
        var globalPos = getOffset(word.elem)
        var localPos = globalToLocal(globalPos.left, globalPos.top)
        var localSize = {width: globalPos.width/scale, height:globalPos.height/scale}
        for(var line of word.lines){
            var connectGlobalPos = getOffset(buttonDict[line.connectedToId].elem)
            var connectedLocalPos = globalToLocal(connectGlobalPos.left, connectGlobalPos.top)
            var connectedLocalSize = {width: connectGlobalPos.width/scale, height:connectGlobalPos.height/scale}

            ctx.beginPath()
            ctx.moveTo(localPos.x+localSize.width/2 + horizontalOffset, localPos.y+localSize.height/2 + verticalOffset)
            ctx.lineTo(connectedLocalPos.x+connectedLocalSize.width/2 + horizontalOffset, connectedLocalPos.y+connectedLocalSize.height/2 + verticalOffset)
            ctx.stroke()
        }
    }
    for(var word of Object.values(buttonDict)){
        var globalPos = getOffset(word.elem)    
        var orth = word.orth
        if(!fontSet){
            var fontSize = Math.floor(globalPos.height/scale*0.74)
            ctx.font = fontSize + "px ipa"
        }
        if(typeof(word.data)=="string"){
            ctx.letterSpacing = "-0.05em"
            orth = orth
        }else{
            ctx.letterSpacing = "0.05em"
            orth = "/"+orth+"/"
        }
        var localPos = globalToLocal(globalPos.left, globalPos.top)
        var localSize = {width: globalPos.width/scale, height:globalPos.height/scale}
        var textWidth = ctx.measureText(orth).width
        fontSize *= (globalPos.width/scale - 2/scale)/textWidth
        fontSize = Math.floor(fontSize)
        ctx.font = fontSize + "px ipa"
        ctx.fillStyle = "black"
        var borderThickness = Math.ceil(globalPos.height/scale*borderScale)
        if(goalWords.indexOf(word.orth)==-1 && solutionHidden && startWords.indexOf(word.orth)==-1){
            var raduis = globalPos.height/scale/2
            ctx.lineWidth = borderThickness/2
            ctx.beginPath()
            ctx.arc(localPos.x + localSize.width/2 + horizontalOffset, localPos.y + localSize.height/2 + verticalOffset, raduis,0,2*Math.PI)
            ctx.fillStyle = "lightgrey"
            ctx.fill()
            ctx.stroke()
        }else{
            ctx.fillRect(localPos.x + horizontalOffset -borderThickness/2, localPos.y+verticalOffset-borderThickness/2, Math.floor(globalPos.width/scale)+borderThickness, Math.floor(globalPos.height/scale) +borderThickness)
            if(word.enabled){
                if(puzzle.goal.indexOf(word.orth)!=-1){
                    ctx.fillStyle = "green"
                }else{
                    ctx.fillStyle = "white"
                }
            }else{
                ctx.fillStyle = "lightgrey"
            }
            ctx.fillRect(localPos.x+horizontalOffset, localPos.y+verticalOffset, Math.floor(globalPos.width/scale), Math.floor(globalPos.height/scale))
            if(word.enabled && puzzle.goal.indexOf(word.orth)!=-1){
                ctx.fillStyle = "white"
            }else{
                ctx.fillStyle = "black"
            }
            var xOffset = globalPos.width/scale/2 - ctx.measureText(orth).width/2
            var yOffset = globalPos.height/scale/2 - (ctx.measureText(orth).fontBoundingBoxDescent-ctx.measureText(orth).fontBoundingBoxAscent)/2
    
            ctx.fillText(orth, Math.floor(localPos.x + xOffset)+horizontalOffset, Math.floor(localPos.y+yOffset)+verticalOffset)    
        }
    }
    return(addExtraInfo(canvas))
}

async function openShareMenu(){
    shareImage = boardToCanvas(daily)
    document.getElementById("shareMenu").style.display = "flex"
    document.getElementById("copyButton").innerHTML = "Copy Image"
    document.getElementById("sharePreview").src = shareImage.toDataURL()
    if(!daily){
        document.getElementById("shareTypeSelector").style.display = "initial"
        changeShareType("solution")
    }else{
        document.getElementById("shareTypeSelector").style.display = "none"
        document.getElementById("puzzleLink").innerHTML = ""
        document.getElementById("copyLinkButton").style.display = "none"
    }
    const shareData = await getShareData() 
    if(navigator.canShare && navigator.canShare(shareData)){
        document.getElementById("copyButtons").style.display = "none"
        document.getElementById("shareImageButton").style.display = "initial"
    }else{
        document.getElementById("copyButtons").style.display = "initial"
        document.getElementById("shareImageButton").style.display = "none"
        document.getElementById("copyButton").onclick = ()=>{
            copyCanvasContentsToClipboard(shareImage)
        }    
        document.getElementById("copyLinkButton").onclick = ()=>{
            navigator.clipboard.writeText(generateChallangeLink())
        }
    }
}

function openCopyMenu(){
    var shareImage = boardToCanvas()
    document.getElementById("shareMenu").style.display = "flex"
    document.getElementById("copyButton").innerHTML = "Copy"
    document.getElementById("sharePreview").src = shareImage.toDataURL()
    document.getElementById("copyButton").onclick = ()=>{
        document.getElementById("copyButton").innerHTML = "Copied"
        copyCanvasContentsToClipboard(shareImage)
    }
}
async function getShareData(){
    var shareImage = boardToCanvas(copyType=="puzzle")
    var blob = await getBlobFromCanvas(shareImage)
    var fileArray = [
        new File(
            [blob],
            "inflect_share.png",
            {
                type:"image/png",
                lastModified: new Date().getTime()
            }
        )
    ]
    const shareData = {
        title: "Share Solution",
        files: fileArray,
        url: "https://greybeetle213.github.io/inflect",
      };
    return(shareData)
}
async function shareBoard(){
    const shareData = await getShareData()
    if(copyType == "puzzle"){
        shareData.text = generateChallangeLink()
        shareData.url = generateChallangeLink()
    }
    if(navigator.canShare(shareData)){
        navigator.share(shareData)
    } else {
        openCopyMenu()
    }

}

function addExtraInfo(board){
    const topBorder = 80
    const canvas = document.createElement("canvas")
    canvas.width = board.width
    canvas.height = board.height + topBorder
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = "green"
    ctx.fillRect(0,0,canvas.width, canvas.height)
    ctx.drawImage(board, 0, topBorder)
    ctx.font = "60px ipa"
    ctx.textBaseline = "top"
    ctx.fillStyle = "white"
    var date = getStrDate(new Date())
    const stepCount = Object.keys(buttonDict).length - goalWords.length - startWords.length
    var stepCountText = stepCount + " Step" + ((stepCount > 1) ? "s" : "")
    ctx.textAlign = "left"
    if(puzzleSettings!="custom"){
        ctx.fillText("Lvl "+puzzleSettings[0],10,20)
    }else[
        ctx.fillText("Custom",10,20)
    ]
    if(daily){
        ctx.textAlign = "center"
        ctx.fillText(date, canvas.width/2, 20)
    }
    ctx.textAlign = "right"
    ctx.fillText(stepCountText,canvas.width-10,20)
    return(canvas)
}

function getStrDate(date){
    var strDate = ""
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    strDate += date.getUTCDate()
    switch (strDate[strDate.length-1]){
        case "1":
            strDate += "st "
            break
        case "2":
            strDate += "nd "
            break
        case "3":
            strDate += "rd "
            break
        default:
            strDate += "th "
    }
    strDate += months[date.getUTCMonth()] + " " + (date.getUTCFullYear() - 2000)
    return(strDate)
}

function addToBrowserHistory(){
    history.pushState({}, "")
    updateBrowserHistory()
}

function updateBrowserHistory(){
    var boardState = []
    for(var key of Object.keys(buttonDict)){
        buttonDict[key].elem.id = "wordBtn"+key
        var lines = []
        for(var line of buttonDict[key].lines){
            var ids = [key, line.connectedToId]
            ids.sort()
            line.line.id = "line"+ids.join("-")
            lines.push({connectedToId:line.connectedToId, lineId:line.line.id})
        }
        boardState.push({id:key, orth:buttonDict[key].orth, data:buttonDict[key].data, lines:lines, enabled:buttonDict[key].enabled, children:buttonDict[key].children, parents:buttonDict[key].parents})
    }
    var words = document.getElementById("words").innerHTML
    history.replaceState({
        isOldPuzzle:true,
        boardState: boardState,
        words: words,
        lines: document.getElementById("lines").innerHTML,
        panAmount: panAmount,
        zoomScale:zoomScale,
        puzzle:puzzle,
        currentIdMax:currentIdMax,
        tutorial:tutorial,
        currentLevel:currentLevel,
        daily: daily,
        startWords: startWords,
        goalWords: goalWords
    }, "")
}

function restoreFromHistory(e){
    if(document.getElementById("dictionary").style.display == "flex"){
        closeDictionary()
        addToBrowserHistory()
        return
    }
    restored = true
    if(e.state.mainMenu){
        openMainMenu()
        return
    }
    if(e.state.tutorial){
        if(tutorial){
            deleteAll()
        }
        initTutorial()
        tutorialLevels[e.state.currentLevel-1]()
        return
    }
    if(!e.state.isOldPuzzle){
        return
    }
    if(daily = e.state.daily){
        document.getElementById("newPuzzle").style.display = "none"
        document.getElementById("newPuzzleMobile").style.display = "none"
    }else{
        document.getElementById("newPuzzle").style.display = "initial"
        document.getElementById("newPuzzleMobile").style.display = "initial"
    }
    openGame()
    document.getElementById("words").innerHTML = e.state.words
    document.getElementById("lines").innerHTML = e.state.lines
    requestAnimationFrame(()=>{
        currentIdMax = e.state.currentIdMax
        puzzle = e.state.puzzle
        zoomScale = e.state.zoomScale
        panAmount = e.state.panAmount
        goalWords = puzzle.goal
        startWords = e.state.startWords
        wordsInPlay = new Set()
        buttonDict = {}
        for(let word of e.state.boardState){
            buttonDict[word.id] = {
                elem:document.getElementById("wordBtn"+word.id),
                orth: word.orth,
                data: word.data,
                enabled: word.enabled,
                parents: word.parents,
                children: word.children,
                lines: []
            }
            for(var line of word.lines){
                buttonDict[word.id].lines.push({line:document.getElementById(line.lineId), connectedToId:line.connectedToId})
            }
            dragElement(buttonDict[word.id].elem, ()=>{
                requestAnimationFrame(()=>(popupMenu(word.id)))
            }, ()=>{
                moveLines(word.id)
            })
            if(word.enabled){
                wordsInPlay.add(word.orth)
            }
        }
        wordDiv.style.transform = "scale("+zoomScale+")"
        wordDiv.style.translate = panAmount.x + "px " + panAmount.y + "px"
        moveAllLines()
        updateGoalText()
    })
}

function replay(){
    play()
}
function backToMainMenu(){
    openMainMenu()
    history.pushState({mainMenu:true, america:america},"")
}
function openMainMenu(){
    if(tutorial){
        document.getElementById("mainMenu").removeAttribute("style")
        document.getElementById("openMobileMenuButton").removeAttribute("style")
        document.getElementById("toolBarButtons").removeAttribute("style")
        document.getElementById("mobileButtonBox").removeAttribute("style")
        document.getElementById("newPuzzle").removeAttribute("style")
        document.getElementById("tutorialButtons").style.display = "none"
        hiddenButtonsForTutorial = []
        tutorial = false
        lastTutorialQuestion = false
        answerShown = false
        currentLevel = 1
    }
    document.getElementById("game").style.display = "none"
    document.getElementById("mainMenu").style.display = "flex"
    document.getElementById("playButton").innerHTML = "Play"
    for(var elem of document.getElementsByClassName("tutorialInfo")){
        elem.style.display = "none"
    }
    closeDictionary()
    tutorial = false
    lastTutorialQuestion = false
}

function scaleFont(textNode){
    if(textNode.data.replace(/[\n ]/g,"").length==0){
        return
    }

    var scaler = document.createElement("span")
    scaler.classList.add("fontSizeScale")
    if(textNode.parentNode.classList.contains("word")){
        scaler.classList.add("fontScaleWord")   
    }
    scaler.innerHTML = textNode.data
    textNode.parentNode.insertBefore(scaler, textNode)
    textNode.remove()
}

function scaleFontUnder(elem){
    var allText = textNodesUnder(elem)
    for(var textNode of allText){
        if(!textNode.parentNode.classList.contains("fontSizeScale") && !textNode.parentNode.classList.contains("popupBtnMultiSelect")){
            scaleFont(textNode)
        }
    }
}

function scaleFontAllElems(){
    var styleSheet = document.styleSheets[0]
    fontSizeClass = styleSheet.cssRules[styleSheet.insertRule(".fontSizeScale{font-size:100%}")]
    scaleFontUnder(document.body)
    observer = new MutationObserver((e)=>{
        for(var mutation of e){
            scaleFontUnder(mutation.target)
        }
    })
    observer.observe(document.body, {childList:true, subtree:true, characterData:true})
}

function increaseFontSize(){
    currentFontSize = Number(fontSizeClass.style.fontSize.replaceAll("%",""))
    currentFontSize += 5
    if(currentFontSize >= 200){
        return
    }
    fontSizeClass.style.fontSize = currentFontSize + "%"
    localStorage.setItem("fontSize", currentFontSize)
}

function decreaseFontSize(){
    currentFontSize = Number(fontSizeClass.style.fontSize.replaceAll("%",""))
    currentFontSize -= 5
    if(currentFontSize <= 80){
        return
    }
    fontSizeClass.style.fontSize = currentFontSize + "%"
    localStorage.setItem("fontSize", currentFontSize)
}

function initStorage(){
    if(window.matchMedia('(display-mode: standalone)').matches){
        navigator.storage.persist()
    }
    localStorage.setItem("notFirstLoad", "true")
    localStorage.setItem("dialect", "rp")
    localStorage.setItem("difficulty", "lvl0")
    localStorage.setItem("fontSize", "100")
    localStorage.setItem("customStepNum", "mediumSteps")
    localStorage.setItem("customStartCount", document.getElementById("startCountCustom").value)
    localStorage.setItem("customGoalCount", document.getElementById("goalCountCustom").value)
}

function updateCustomCounts(){
    localStorage.setItem("customStartCount", document.getElementById("startCountCustom").value)
    localStorage.setItem("customGoalCount", document.getElementById("goalCountCustom").value)
}

function loadStorage(){
    if(window.matchMedia('(display-mode: standalone)').matches){
        navigator.storage.persist()
    }
    var dialect = localStorage.getItem("dialect")
    if(!location.search.length){
        if (dialect == "american" && !america){
            window.location.href = "american.html"
        }
        if(dialect == "rp" && america){
            window.location.href = "index.html"
        }
    }
    selectDifficulty(localStorage.getItem("difficulty"))
    selectStepNum(localStorage.getItem("customStepNum"))
    document.getElementById("startCountCustom").value = Number(localStorage.getItem("customStartCount"))
    document.getElementById("goalCountCustom").value = Number(localStorage.getItem("customGoalCount"))
    fontSizeClass.style.fontSize = localStorage.getItem("fontSize") + "%"
    document.getElementById("mainMenu").style.visibility = "visible"
}

letters = "abcdefghijklmnopqrstuvwxyz,-"
encoding = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"
function encode(msg){
    var binary = ""
    for (var char of msg){
        var index = letters.indexOf(char)
        index = index.toString(2)
        index = "0".repeat(5-index.length) + index
        binary += index
    }
    b64 = ""
    while(binary.length){
        bits = binary.slice(0,6)
        bits += "0".repeat(6-bits.length)
        binary = binary.slice(6)
        bits = parseInt(bits, 2)
        b64 += encoding[bits]
    }
    return(b64)
}
function decode(b64){
    var binary = ""
    for (var char of b64){
        var index = encoding.indexOf(char)
        index = index.toString(2)
        index = "0".repeat(6-index.length) + index
        binary += index
    }
    msg = ""
    while(binary.length >= 5){
        bits = binary.slice(0,5)
        binary = binary.slice(5)
        bits = parseInt(bits, 2)
        msg += letters[bits]
    }
    return(msg)
}

function generateChallangeLink(){
    if(puzzleSettings=="custom"){
        diffCode = "z"
    }else{
        diffCode = "abcdef"[puzzleSettings[0]]
    }
    path = startWords.join(",")+ "-" + goalWords.join(",") + "-" + (america ? "a" : "r") + diffCode
    pathCompressed = encode(path)
    shortendPathname = location.pathname
    if(shortendPathname.indexOf("american.html")!=-1){
        shortendPathname = shortendPathname.slice(0,shortendPathname.indexOf("american.html"))
    }
    if(shortendPathname.indexOf("index.html")!=-1){
        shortendPathname = shortendPathname.slice(0,shortendPathname.indexOf("index.html"))
    }
    return(location.origin + shortendPathname + "?"+pathCompressed)
}

function loadChallange(){
    pathCompressed = location.search.slice(1)
    path = decode(pathCompressed).split("-")
    challangeStart = path[0].split(",")
    challangeEnd = path[1].split(",")
    challange = {activeWords:[], roots:[]}
    challangeDiff = path[2][1]
    if(challangeDiff=="z"){
        selectDifficulty("custom")
    }else{
        selectDifficulty("lvl"+"abcdef".indexOf(challangeDiff))
    }
    challangeAmerican = path[2][0] == "a"
    if (challangeAmerican && !america){
        window.location.href = "american.html" + location.search
    }
    if(!challangeAmerican && america){
        window.location.href = "index.html" + location.search
    }
    for(var word of challangeStart){
        challange.roots.push({orth:word})
    }
    for(var word of challangeEnd){
        challange.activeWords.push({orth:word})
    }
    init(challange)
}

function playDaily(){
    daily = true
    seededRandom = new Math.seedrandom(Math.floor(Date.now()/86400000))
    requestAnimationFrame(play)
    document.getElementById("newPuzzle").style.display = "none"
    document.getElementById("newPuzzleMobile").style.display = "none"
}

function changeShareType(type){
    if(type == "solution"){
        document.getElementById("copySolution").classList.remove("disabled")
        document.getElementById("copyPuzzle").classList.add("disabled")
        copyType = "solution"
        shareImage = boardToCanvas(false)
        document.getElementById("puzzleLink").innerHTML = ""
        document.getElementById("copyLinkButton").style.display = "none"
    }else{
        document.getElementById("copyPuzzle").classList.remove("disabled")
        document.getElementById("copySolution").classList.add("disabled")
        copyType = "puzzle"
        shareImage = boardToCanvas(true)
        document.getElementById("puzzleLink").innerHTML = generateChallangeLink()
        document.getElementById("copyLinkButton").style.display = "initial"
    }
    document.getElementById("sharePreview").src = shareImage.toDataURL()
}