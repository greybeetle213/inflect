puzzleSettings = ["easy",10]
firstGame = true
function play(){
    document.getElementById("progressNewPuzzle").style.display="initial"
    document.getElementById("playButton").innerHTML = "Generating Puzzle..."
    requestAnimationFrame(playRandomPuzzle)
}
function playRandomPuzzle(){
    init(getBestPuzzle(...puzzleSettings))
}
function init(tree){
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
}

function beginGame(puzzleLocal){
    zoomScale = 1
    panAmount = {x:0, y:0}
    wordDiv.style.transform = "scale("+zoomScale+")"
    wordDiv.style.translate = panAmount.x + "px " + panAmount.y + "px"
    document.getElementById("progressNewPuzzle").style.display="none"
    puzzle = puzzleLocal
    document.getElementById("mainMenu").style.display = "none"
    document.getElementById("game").style.display = "initial"
    goalWords = puzzle.goal
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
    clickOpenedPopupMenu = false
    popupMenuWordId = 0
    clickFunction = (id)=>{popupMenu(id)}
    if(firstGame){
        document.addEventListener("mousedown", closePopupMenuWhenClickedOffOf)
        document.addEventListener("touchstart", closePopupMenuWhenClickedOffOf)
        document.addEventListener("touchstart", startPanOrZoom, {passive: false})
        document.addEventListener("gesturestart", (e)=>{
            if(e.target.className.indexOf("canScroll")==-1||e.target.parentNode.className.indexOf("canScroll")){
                e.preventDefault()
            }
        }, {passive: false})
        document.addEventListener("touchmove", panAndZoom, {passive: false})
        document.addEventListener("touchend", zoomEnd)
        document.addEventListener("wheel", zoomMouse)
        document.addEventListener("mousedown", (e)=>{
            if(e.target.className.indexOf("Word")==-1 && e.target.className.indexOf("Btn")==-1){
                draging = true
            }
        })
        document.addEventListener("mouseup", (e)=>{
            draging = false
            lastDrag = 0
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
    console.log(Number(buttonDict[parentId].elem.style.top.slice(0,-2)), buttonDict[parentId].elem.style.top)
    buttonDict[newWordId].elem.style.top = (Number(buttonDict[parentId].elem.style.top.slice(0,-2)) + offset.height*2/zoomScale) + "px"
    buttonDict[newWordId].elem.style.left = buttonDict[parentId].elem.style.left
    line = connectLine(buttonDict[parentId].elem, buttonDict[newWordId].elem)
    buttonDict[parentId].lines.push({line:line,connectedToId:newWordId})
    buttonDict[newWordId].lines.push({line:line,connectedToId:parentId})
    buttonDict[parentId].children.push(newWordId)
    buttonDict[newWordId].parents.push(parentId)
    moveLines(newWordId)
    updateGoalText()
    if(parentId2){
        secondLine = connectLine(buttonDict[parentId2].elem, buttonDict[newWordId].elem)
        buttonDict[parentId2].lines.push({line:secondLine, connectedToId:newWordId})
        buttonDict[parentId2].enabled = false
        buttonDict[parentId2].elem.classList.add("disabled")
        buttonDict[parentId2].children.push(newWordId)
        buttonDict[newWordId].lines.push({line:secondLine, connectedToId:parentId2})
        buttonDict[newWordId].parents.push(parentId2)
    }
    return(newWordId)
}


function changeForm(id){
    data = buttonDict[id].data
    orth = buttonDict[id].orth
    if(typeof(data)!="string"){
        return
    }
    forms = new Set()
    for(word of conjs.concat(extras)){
        if(word.indexOf(orth) != -1){
            forms = forms.union(new Set(word))
        }
    }
    forms.delete(orth)
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
    closePopupMenu()
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
            for(var i=0; i<ipa.length;i++){
                if(!indexes.has(i)){
                    removed.push(ipa[i])
                }
            } 
            if(!removed.length){
                return({wordOk:false, hoverText:"You must keep at least one phoneme"})
            }
            if(wordsInPlay.has(removed.join(""))){
                return({wordOk:false, hoverText:"You have already used /"+removed.join("")+"/"})
            }
            return({wordOk:true})
        }
    )
}

function deleteLetter(orth, id){
    closePopupMenu()
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
    multichoiceMenu.style.display = "initial"
    document.getElementById("doneBtn").style.display = "initial"
    document.getElementById("doneBtn").innerHTML = "Done"
    document.getElementById("doneBtn").disabled = "true"
    document.getElementById("doneBtn").onclick = ()=>{
        multichoiceMenu.style.display = "none"
        multichoicesDiv.innerHTML = ""
        multichoiceMenu.style.display = "none"
        func(selectedIds)            
    }
    for(let i = 0; i<choices.length;i++){
        let btn = document.createElement("button")
        btn.innerHTML = choices[i]
        btn.onclick = ()=>{
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
        multichoicesDiv.appendChild(btn)
    }
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
                document.getElementById("changeFormHover").innerHTML = "No other forms of '" + buttonDict[id].orth + "'"
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
}

function closePopupMenuWhenClickedOffOf(event){
    if(event.target.className != "popupBtn"){
        closePopupMenu()
    }
    if(event.target.parentNode.id != "mobileMenu" && event.target.parentNode.id != "closeMobileMenuButton" && event.target.parentNode.id != "mobileButtonBox"){
        closeMobileMenu()
    }
}

function makeElemOnscreen(elem){
    pos = getOffset(elem)
    toolBarPos = getOffset(document.getElementById("toolBar"))
    if(pos.left<0){
        elem.style.left = "5px"
    }
    if(pos.top<0+toolBarPos.height){
        elem.style.top = 5+toolBarPos.height+"px"
    }
    pos = getOffset(elem)
    if(pos.top + pos.height > window.innerHeight){
        elem.style.top = window.innerHeight-pos.height + "px"
    }
    if(pos.left + pos.width > window.innerWidth){
        elem.style.left = window.innerWidth-pos.width + "px"
    }
}
function moveWordSoNotIntersecting(id){
    var elem = buttonDict[id].elem
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
            goalText[index] = "<span class='completedGoal'>"+goalText[index]+"</span>"
        }
    }

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
            lastTutorialQuestion = false
            tutorial = false
            document.getElementById("showAnswer").style.display = "none"
            document.getElementById("nextTutorial").style.display = "none"
            document.getElementById("menuButton").innerHTML = "Finish"
        }
        if(tutorial){
            document.getElementById("nextTutorial").style.display = "initial"
            document.getElementById("showAnswer").style.display = "none"
        }else{
            document.getElementById("mobileReplayButton").style.display = "initial"
        }
    }else{
        document.getElementById("toolBar").style.backgroundColor = "white"
        document.getElementById("goalText").style.color = "black" 
        document.getElementById("mobileReplayButton").style.display = "none"
    }
}

function selectDifficulty(dif){
    document.getElementById("begginer").classList.add("disabled")
    document.getElementById("easy").classList.add("disabled")
    document.getElementById("medium").classList.add("disabled")
    document.getElementById("hard").classList.add("disabled")
    document.getElementById("harder").classList.add("disabled")
    document.getElementById(dif).classList.remove("disabled")
    //settings: start words, end words, number of steps, number of puzzle to generate before picking hardest
    if(dif=="begginer"){
        puzzleSettings=["begginer",10]
    }
    if(dif=="easy"){
        puzzleSettings=["easy",20]
    }
    if(dif=="medium"){
        puzzleSettings=["medium",20]
    }
    if(dif=="hard"){
        puzzleSettings=["hard",20]
    }
    if(dif=="harder"){
        puzzleSettings=["harder",20]
    }
}

function getDifferanceBetweenPoints(x1,y1,x2,y2){
    var xdistance = x1-x2
    var ydistance = y1-y2
    return(Math.pow((Math.pow(xdistance,2) + Math.pow(ydistance,2)),0.5))
}

function getZoomChange(e){
    var p1 = e.changedTouches[0]
    var p2 = e.changedTouches[1]
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
    // var ipaList = document.createElement("span")
    // ipaList.innerHTML = "Transcriptions: "
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
        conjList.innerHTML = [...conjDict[word]].join(", ")
    }else{
        conjList.innerHTML = "No inflections"
    }
    searchResult.appendChild(conjList)

    document.getElementById("searchResults").appendChild(searchResult)
}

function scrollFunc(e){
    e.target.style.boxShadow = "0px -3px 3px grey"
    if(e.target.scrollTop != 0){
        e.target.style.boxShadow += ",0px 10px 10px grey inset"
    }
    if(e.target.scrollTop != e.target.scrollTopMax){
        e.target.style.boxShadow += ", 0px -10px 10px grey inset"
    }
}

function openMobileMenu(){
    document.getElementById("mobileMenu").style.display = "flex"
    document.getElementById("openMobileMenuButton").style.display = "none"
    document.getElementById("closeMobileMenuButton").style.display = "initial"
}
function closeMobileMenu(){
    document.getElementById("mobileMenu").style.display = "none"
    document.getElementById("openMobileMenuButton").style.display = "initial"
    document.getElementById("closeMobileMenuButton").style.display = "none"
}