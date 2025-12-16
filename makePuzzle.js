function proccessDictFiles(){
    wordSet = new Set(wordList)

    ipaWordSet = new Set()

    alreadyComptedVarientsDict = {}

    alreadyComptedVarientsSet = new Set()

    for(var word of wordSet){
        if(!orthToIpa[word]){
            continue
        }
        for(var ipaWord of orthToIpa[word]){
            ipaWordSet.add(ipaWord.join())
        }
    }

    conjDict = {}
    conjDict.constructor = undefined
    for(var forms of conjs){
        for(var form of forms){
            if(!conjDict[form]){
                conjDict[form] = new Set(forms)
            }else{
                conjDict[form] = conjDict[form].union(new Set(forms))
            }
        }
    }

    orthToIpaSetValues = {}
    for(var key of Object.keys(orthToIpa)){
        orthToIpaSetValues[key] = new Set()
        for(var word of orthToIpa[key]){
            orthToIpaSetValues[key].add(word.join(","))        
        }
    }

    badWordRoots = ["ring", "inning", "is", "ding", "dings", "did", "sing", "sings", "die", "died", "dies", "read", "is", "whir", "ted"]
    badWords = new Set()
    for(var word of badWordRoots){
        badWords.add(word)
    }
}

function applyRandomFunction(functions, args=[]){
    var out
    var i=0
    while(!out && i<10){
        i++
        out = randomFromList(functions)(...args)
    }
    return(out)
}

function getPossibleDeletions(word, orthTree, joiner=""){
    var out = new Set()
    var options = [[word,orthTree,[]]]
    nextOptions = []
    while(options.length){
        for(var option of options){
            if(option[1].canEnd){
                out.add(option[2].join(joiner))
            }
            for(var letter of new Set(option[0])){
                if(option[1][letter]){
                    nextOptions.push([
                        option[0].slice(option[0].indexOf(letter)+1),
                        option[1][letter],
                        option[2].concat([letter])
                    ])
                }
            }
        }
        options = nextOptions
        nextOptions = []
    }
    return(out)
}

function getRandomFromKey(key, set, usedWordsSet){
    if(!set[key]){
        return
    }
    possibleWords = new Set([...set[key]]).difference(usedWordsSet)
    if(!possibleWords.size){
        return(undefined)
    }
    return(randomFromSet(possibleWords))
}

function randomFromList(l){
    return(l[Math.floor(Math.random()*l.length)])
}

function randomFromSet(word){
    return(randomFromList([...word]))
}

function deleteFromList(obj, list){
    var index = list.indexOf(obj)
    if(index!=-1){
        list.splice(index,1)
    }
}

class wordTree{
    constructor(difficulty){
        this.usedWordsSet = new Set()
        this.roots = []
        this.activeWords = []
        switch(difficulty){
            case "begginer":
                this.mergeChance = 0
                this.splitChance = 0
                this.maxIter = 2
                this.startWordNum = 3
                this.endWordNum = 1
                break
            case "easy":
                this.mergeChance = 0
                this.splitChance = 0
                this.maxIter = 2
                this.startWordNum = 2
                this.endWordNum = 1
                break
            case "medium":
                this.mergeChance = 0.1
                this.splitChance = 0.5
                this.maxIter = 10
                this.startWordNum = 2
                this.endWordNum = 1
                break
            case "hard":
                this.mergeChance = 0.1
                this.splitChance = 0.5
                this.maxIter = 50
                this.startWordNum = 2
                this.endWordNum = 2
                break
            case "harder":
                this.mergeChance = 0.1
                this.splitChance = 0.5
                this.maxIter = 100
                this.startWordNum = 3
                this.endWordNum = 4
                break
        }
    }

    toString(){
        return(this.roots.join(", ") + " --> " + this.activeWords.join(", "))
    }

    generatePuzzle(){
        this.createRandomWords(this.startWordNum)
        for(var i = 0; i < this.maxIter; i++){
            this.mutateAllWords()
            if(this.activeWords.length < this.endWordNum || Math.random() < this.splitChance){
                this.splitWords(1)
            }
            if(this.activeWords.length > this.endWordNum && Math.random() < this.mergeChance){
                this.mergeWords(2)
            }else if(this.activeWords.length >= this.endWordNum + (this.maxIter - i)){
                this.mergeWords(2)
            }
        }
        this.spellAllActiveWords()
    }
    mutateAllWords(){
        [...this.activeWords].forEach(
            (word)=>{
                var mutation = word.getRandomMutation()
                if(!mutation){
                    word.delete()
                }
            }
        )
    }

    spellAllActiveWords(){
        var attemptAgain = false
        for(var word of [...this.activeWords]){
            if(word.type == "ipa"){
                var attempt = word.getRandomFromIPA()
                if(!attempt){
                    word.delete()
                    attemptAgain = true
                }
            }
        }
        if(attemptAgain){
            this.spellAllActiveWords()
        }
    }

    mergeWords(count){
        count = Math.min(count, this.activeWords.length-1)
        var unmergedWords = [...this.activeWords]
        shuffle(unmergedWords)
        var merged = unmergedWords.shift()
        for(var i = 0;i<count;i++){
            var mergeWith = unmergedWords.shift()
            var newMerged = merged.getMergedWith(mergeWith)
            if(newMerged){
                merged = newMerged
            }
        }
        if(!merged.isWord()){
            merged.getRandomDeletion()
        }
    }

    splitWords(maxSplitCount){
        var unsplitWords = [...this.activeWords]
        var splitCount = 0
        while(splitCount < maxSplitCount && unsplitWords.length){
            var word = unsplitWords.shift()
            var splitWords = word.getRandomSplit()
            if(splitWords){
                splitCount ++
            }
        }
    }

    createWord(orth){
        var newNode = new wordNodeOrth(orth, this)
        this.roots.push(newNode)
        return(newNode)
    }
    createRandomWords(num){
        for(var i = 0; i<num; i++){
            var newWord
            while(!newWord || this.usedWordsSet.has(newWord)){
                newWord = randomFromList(wordList)
            }
            this.createWord(newWord)
        }
    }
    showAnswer(){
        for(var word of this.roots){
            word.display()
        }
    }
}

class wordNodeOrth{
    constructor(orth, tree, parents=[], fromSplit=false){
        this.orth = orth
        this.tree = tree
        this.parents = parents
        this.children = []
        this.type = "orth"
        this.wordsReachableFromParent = new Set()

        for(var parent of this.parents){
            if(!fromSplit){
                this.wordsReachableFromParent = this.wordsReachableFromParent.union(parent.getOneStepReachableWords()).union(parent.wordsReachableFromParent)
            }
            parent.children.push(this)
            deleteFromList(parent, this.tree.activeWords)
        }
        this.tree.usedWordsSet.add(this.orth)
        this.tree.activeWords.push(this)
    }
    toString(){
        return(this.orth)
    }
    deleteChildren(){
        [...this.children].forEach((child)=>{
            deleteFromList(this, child.parents)
            child.delete()
        })
        this.children = []
        if(this.tree.activeWords.indexOf(this)==-1){
            this.tree.activeWords.push(this)
        }
    }
    delete(){
        [...this.parents].forEach((parent)=>{
            deleteFromList(this, parent.children)
            parent.deleteChildren()
        })
        this.parents = []
        this.deleteChildren()
        deleteFromList(this, this.tree.activeWords)
    }
    getOneStepReachableWords(){
        return(getPossibleDeletions([...this.orth], orthTree).union(conjDict[this.orth]||new Set()).union(orthToIpaSetValues[this.orth]||new Set()))
    }
    getBannedWords(){
        return(this.wordsReachableFromParent.union(this.tree.usedWordsSet))
    }
    display(){
        if(this.beenDisplayed){
            return
        }
        for(var parent of this.parents){
            if(parent.displayId == undefined){
                if(this.parents.length == 1){
                    console.log(parent.toString(), this.toString())
                }
                return
            }
        }
        this.beenDisplayed = true
        var formatedOrth
        if(this.type == "ipa"){
            formatedOrth = this.orth.join("")
        }else{
            formatedOrth = this.orth
        }
        if(!this.parents.length){
            this.displayId = createWord(formatedOrth, this.orth)
            makeElemOnscreen(buttonDict[this.displayId].elem)
            moveWordSoNotIntersecting(this.displayId)
        }else{
            if(this.parents.length == 1){
                this.displayId = createChildWord(this.parents[0].displayId, formatedOrth, this.orth)
                moveWordSoNotIntersecting(this.displayId)
            }else{
                var parent1elem = buttonDict[this.parents[0].displayId].elem
                var parent2elem = buttonDict[this.parents[1].displayId].elem
                if(getOffset(parent1elem).top <  getOffset(parent2elem).top){
                    this.displayId = createChildWord(this.parents[1].displayId, formatedOrth, this.orth, this.parents[0].displayId)
                }else{
                    this.displayId = createChildWord(this.parents[0].displayId, formatedOrth, this.orth, this.parents[1].displayId)
                }
            }
        }
        for(var child of this.children){
            child.display()
        }
    }
    getRandomMutation(){
        return(
            applyRandomFunction([()=>(this.getRandomDeletion()), ()=>(this.getRandomConj()), ()=>(this.getRandomToIPA())])
        )
    }
    getRandomDeletion(){
        var set = getPossibleDeletions([...this.orth], orthTree).difference(this.getBannedWords()) 
        if(!set.size){
            return
        }
        var longest = ""
        for(var i = 0; i < 5; i++){
            var newAttempt = randomFromSet(set)
            if(newAttempt.length > longest.length){
                longest = newAttempt
            }
        }
        return(this.createChild(
            longest
        ))
    }
    getRandomConj(){
        var conj = getRandomFromKey(this.orth, conjDict, this.getBannedWords())
        if(conj){
            return(this.createChild(conj))
        }
    }
    getRandomToIPA(){
        var ipaOrth = getRandomFromKey(this.orth, orthToIpaSetValues, this.getBannedWords())
        if(!ipaOrth){
            return
        }
        return(this.createChild(ipaOrth.split(",")))
    }
    createChild(word, extraParents=[], fromSplit=false){
        if(word == undefined || word.length == 0){
            return
        }
        if(typeof(word) == "string"){
            return(
                new wordNodeOrth(word, this.tree, [this, ...extraParents], fromSplit)
            )
        }
        return(
            new wordNodeIPA(word, this.tree, [this, ...extraParents], fromSplit)
        )
    }
    getMergedWith(word){
        if(word.type == "ipa"){
            word = word.getRandomFromIPA()
            if(!word){
                return
            }
        }
        if(this.getBannedWords().has(this.orth + word.orth)){
            return
        }
        var merged = this.createChild(this.orth+word.orth, [word])
        return(merged)
    }

    getPossibleSplits(){
        var options = []
        var wordList = getPossibleDeletions([...this.orth], orthTree).union(conjDict[this.orth]||new Set()).difference(this.tree.usedWordsSet)
        for(var unsplitWord of wordList){
            var word = unsplitWord.split("")
            var loopNum = word.length
            var currentStart = ""
            for(var i = 0; i < loopNum; i++){
                currentStart += word.shift()
                if(wordSet.has(currentStart) && wordSet.has(word.join(""))){
                    options.push([unsplitWord, currentStart, word.join("")])
                }
            }
        }
        return(options)
    }
    getRandomSplit(){
        var options = this.getPossibleSplits()
        var filteredOptions = []
        for(var option of options){
            if(!this.tree.usedWordsSet.has(option[1]) && !this.tree.usedWordsSet.has(option[2])){
                filteredOptions.push(option)
            }
        }
        if(!filteredOptions.length){
            return
        }
        var choice = randomFromList(filteredOptions)
        if(choice[0] != this.orth){
            var intermidateWord = this.createChild(choice[0])
        }else{
            var intermidateWord = this
        }
        
        return([intermidateWord.createChild(choice[1],[],true),intermidateWord.createChild(choice[2],[],true)])
    }
    isWord(){
        return(wordSet.has(this.orth))
    }
}

class wordNodeIPA extends wordNodeOrth{
    constructor(data,tree,parents = [], fromSplit=false){
        super(data.join(","), tree, parents, fromSplit)
        this.type = "ipa"
        this.orth = data
        if(!this.orth.length){
            console.warn("EMPTY WORD, ", this.parents)
        }
    }
    toString(){
        return("/"+this.orth.join("")+"/")
    }
    getRandomMutation(){
        return(
            applyRandomFunction([()=>(this.getRandomDeletion()), ()=>(this.getRandomFromIPA())])
        )
    }
    getRandomFromIPA(){
        var orth = getRandomFromKey(this.orth.join(","), ipaToOrth, this.getBannedWords())
        if(!orth){
            return
        }
        return(this.createChild(orth))
    }
    
    getRandomDeletion(){
        var set = getPossibleDeletions([...this.orth], ipaTree, ",").difference(this.getBannedWords()) 
        if(!set.size){
            return
        }
        var longest = []
        for(var i = 0; i < 5; i++){
            var newAttempt = randomFromSet(set).split(",")
            if(newAttempt.length > longest.length){
                longest = newAttempt
            }
        }
        return(this.createChild(
            longest
        ))
    }
    getMergedWith(word){
        if(word.type == "orth"){
            var word2 = word.getRandomToIPA()
            if(!word2){
                return
            }
            word = word2
        }
        if(this.tree.usedWordsSet.has(this.orth.concat(word.orth).join(","))){
            return
        }
        var merged = this.createChild(this.orth.concat(word.orth), [word])
        return(merged)
    }


    getPossibleSplits(){
        var options = []
        var wordList = getPossibleDeletions([...this.orth], ipaTree, ",").difference(this.tree.usedWordsSet)
        for(var unsplitIpaWord of wordList){
            var currentStart = []
            var ipaWord = unsplitIpaWord.split(",")
            var loopNum = ipaWord.length
            for(var i = 0; i < loopNum; i++){
                currentStart.push(ipaWord.shift())
                if(ipaWordSet.has(currentStart.join()) && ipaWordSet.has(ipaWord.join())){
                    options.push([unsplitIpaWord.split(","), ipaToOrth[currentStart.join()][0], ipaToOrth[ipaWord.join()][0]])
                }
            }
        }
        return(options)
    }

    isWord(){
        return(wordSet.has(this.orth.join(",")))
    }

    getOneStepReachableWords(){
        return(getPossibleDeletions([...this.orth], ipaTree, ",").union(new Set(ipaToOrth[this.orth.join(",")])))
    }
}


function getIPASplits(ipaWord){
    var options = []
    var currentStart = []
    ipaWord = [...ipaWord]
    var loopNum = ipaWord.length
    for(var i = 0; i < loopNum; i++){
        currentStart.push(ipaWord.shift())
        if(ipaWordSet.has(currentStart.join()) && ipaWordSet.has(ipaWord.join())){
            options.push([ipaToOrth[currentStart.join()][0], ipaToOrth[ipaWord.join()][0]])
        }
    }
    return(options)
}

function getOrthSplits(word){
    var options = []
    var loopNum = word.length
    var currentStart = ""
    word = word.split("")
    for(var i = 0; i < loopNum; i++){
        currentStart += word.shift()
        if(wordSet.has(currentStart) && wordSet.has(word.join(""))){
            options.push([currentStart, word.join("")])
        }
    }
    return(options)
}

function getBestPuzzle(difficulty, tries, startWordsCustom, endWordsCustom){
    bestOption = {}
    var bestScore = 0
    for(var i=0;i<tries;i++){
        var puzzle = new wordTree(difficulty)
        if(startWordsCustom&&endWordsCustom){
            puzzle.startWordNum = startWordsCustom
            puzzle.endWordNum = endWordsCustom
        }
        puzzle.generatePuzzle()
        var goal = []
        puzzle.activeWords.forEach((word)=>{
            goal.push(word.orth)
        })
        var startWords = []
        puzzle.roots.forEach((word)=>{
            startWords.push(word.orth)
        })
        var score = 1
        if(puzzle.endWordNum == goal.length){
            score += 50
        }
        if(!goal.length){
            continue
        }
        var wordLengthScore = goal[0].length**0.5
        for(var goalIndx = 1; goalIndx < goal.length; goalIndx++){
            wordLengthScore *= goal[goalIndx].length**0.5
        }
        var wordSimalaratyScore = 0
        for(var goalWord of goal){
            var allScores = []
            for(var startWord of startWords){
                allScores.push(levenshtein(startWord, goalWord))
            }
            wordSimalaratyScore += Math.min(...allScores)
            if(!wordSet.has(goalWord)){
                score = -Infinity
            }
        }
        score *= wordLengthScore * wordSimalaratyScore
        if(score > bestScore){
            bestOption = puzzle
            bestScore = score
        }
    }
    return(bestOption)
}


