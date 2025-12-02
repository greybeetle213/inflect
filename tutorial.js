hiddenButtonsForTutorial = []
tutorial = false
lastTutorialQuestion = false
answerShown = false
function startTutorial(){
    tutorial = true
    makeScrollShadows()
    document.getElementById("mainMenu").style.display = "none"
    document.getElementById("tutorialInfo1").style.display = "flex"
    playLevel1()
}

function makeScrollShadows(){
    var tutorialBoxes = document.getElementsByClassName("tutorialInfo")
    for(var tutorialBox of tutorialBoxes){
        var scrollFunc = (e)=>{
            e.target.style.boxShadow = "0px -3px 3px grey"
            if(e.target.scrollTop != 0){
                e.target.style.boxShadow += ",0px 10px 10px grey inset"
            }
            if(e.target.scrollTop != e.target.scrollTopMax){
                e.target.style.boxShadow += ", 0px -10px 10px grey inset"
            }
        }
        tutorialBox.style.display = "flex"
        scrollFunc({target:tutorialBox})
        tutorialBox.style.display = "none"
        tutorialBox.addEventListener("scroll", scrollFunc)
    }
}

function playLevel1(){
    answerShown = false
    hiddenButtonsForTutorial = ["toIPA", "merge", "changeForm", "split", "toOrth", "deletePhoneme", "deleteLetter"]
    var level1 = new wordTree()
    level1.createWord("hello")
    level1.createWord("world")
    init(level1)
    updateGoalText()
    document.getElementById("newPuzzle").style.display = "none"
    document.getElementById("showAnswer").style.display = "none"
    document.getElementById("nextTutorial").onclick = ()=>{
        document.getElementById("tutorialInfo1").style.display = "none"
        document.getElementById("tutorialInfo2").style.display = "flex"
        playLevel2()
    }
}
function playLevel2(attempt=0){
    deleteAll()
    answerShown = false
    hiddenButtonsForTutorial = ["toIPA", "merge", "changeForm", "split", "toOrth", "deletePhoneme"]
    document.getElementById("nextTutorial").style.display = "none"
    document.getElementById("simalarPuzzle").style.display = "none"
    attempt %= 3
    switch(attempt){
        case 0:
            var level2 = new wordTree()
            var lv2_thing = level2.createWord("thing")
            lv2_thing.createChild("thin")
            break
        case 1:
            var level2 = new wordTree()
            var lv2_thing = level2.createWord("that")
            lv2_thing.createChild("hat")
            break
        case 2:
            var level2 = new wordTree()
            var lv2_thing = level2.createWord("boat")
            lv2_thing.createChild("bot")
            break
    }

    init(level2)
    document.getElementById("newPuzzle").style.display = "none"
    document.getElementById("showAnswer").style.display = "initial"
    document.getElementById("showAnswer").onclick = ()=>{showAnswerTutorial(level2, playLevel2, attempt)}
    document.getElementById("nextTutorial").onclick = ()=>{
        document.getElementById("tutorialInfo2").style.display = "none"
        document.getElementById("tutorialInfo3").style.display = "flex"
        playLevel3()
    }
}

function playLevel3(attempt=0){
    deleteAll()
    answerShown = false
    hiddenButtonsForTutorial = ["toIPA", "merge", "split", "toOrth", "deletePhoneme"]
    document.getElementById("nextTutorial").style.display = "none"
    document.getElementById("simalarPuzzle").style.display = "none"
    attempt %= 3
    switch(attempt){
        case 0:
            var level3 = new wordTree()
            var lv3_thing = level3.createWord("do")
            lv3_thing.createChild("did")
            break
        case 1:
            var level3 = new wordTree()
            var lv3_thing = level3.createWord("goose")
            lv3_thing.createChild("geese")
            break
        case 2:
            var level3 = new wordTree()
            var lv3_thing = level3.createWord("make")
            lv3_thing.createChild("makes")
            break
    }

    init(level3)
    document.getElementById("newPuzzle").style.display = "none"
    document.getElementById("showAnswer").style.display = "initial"
    document.getElementById("showAnswer").onclick = ()=>{showAnswerTutorial(level3, playLevel3, attempt)}

    document.getElementById("nextTutorial").onclick = ()=>{
        document.getElementById("tutorialInfo3").style.display = "none"
        document.getElementById("tutorialInfo4").style.display = "flex"
        playLevel4()
    }
}

function playLevel4(attempt=0){
    deleteAll()
    answerShown = false
    hiddenButtonsForTutorial = ["toIPA", "merge", "split", "toOrth", "deletePhoneme"]
    document.getElementById("nextTutorial").style.display = "none"
    document.getElementById("simalarPuzzle").style.display = "none"
    attempt %= 3
    switch(attempt){
        case 0:
            var level4 = new wordTree()
            var lv4_thing = level4.createWord("draw")
            var lv4_thing2 = lv4_thing.createChild("drawing")
            lv4_thing2.createChild("wing")
            break
        case 1:
            var level4 = new wordTree()
            var lv4_thing = level4.createWord("met")
            var lv4_thing2 = lv4_thing.createChild("meeting")
            lv4_thing2.createChild("men")
            break
        case 2:
            var level4 = new wordTree()
            var lv4_thing = level4.createWord("house")
            var lv4_thing2 = lv4_thing.createChild("housing")
            lv4_thing2.createChild("sing")
            break
    }

    init(level4)
    document.getElementById("newPuzzle").style.display = "none"
    document.getElementById("showAnswer").style.display = "initial"
    document.getElementById("showAnswer").onclick = ()=>{showAnswerTutorial(level4, playLevel4, attempt)}

    document.getElementById("nextTutorial").onclick = ()=>{
        document.getElementById("tutorialInfo4").style.display = "none"
        document.getElementById("tutorialInfo5").style.display = "flex"
        playLevel5()
    }
}

function playLevel5(attempt=0){
    deleteAll()
    answerShown = false
    hiddenButtonsForTutorial = ["merge", "split", "deletePhoneme"]
    document.getElementById("nextTutorial").style.display = "none"
    document.getElementById("simalarPuzzle").style.display = "none"
    attempt %= 3
    switch(attempt){
        case 0:
            var level5 = new wordTree()
            var lv5_thing = level5.createWord("reed")
            if(america){
                var lv5_thing2 = lv5_thing.createChild(["ɹ","i","d"])
            }else{
                var lv5_thing2 = lv5_thing.createChild(["ɹ","iː","d"])
            }
            lv5_thing2.createChild("read")
            break
        case 1:
            var level5 = new wordTree()
            var lv5_thing = level5.createWord("cite")
            var lv5_thing2 = lv5_thing.createChild(["s","aɪ","t"])
            lv5_thing2.createChild("sight")
            break
        case 2:
            var level5 = new wordTree()
            var lv5_thing = level5.createWord("right")
            var lv5_thing2 = lv5_thing.createChild(["ɹ","aɪ","t"])
            lv5_thing2.createChild("write")
            break
    }

    init(level5)
    document.getElementById("newPuzzle").style.display = "none"
    document.getElementById("showAnswer").style.display = "initial"
    document.getElementById("showAnswer").onclick = ()=>{showAnswerTutorial(level5, playLevel5, attempt)}

    document.getElementById("nextTutorial").onclick = ()=>{
        document.getElementById("tutorialInfo5").style.display = "none"
        document.getElementById("tutorialInfo6").style.display = "flex"
        playLevel6()
    }
}

function playLevel6(attempt=0){
    deleteAll()
    answerShown = false
    hiddenButtonsForTutorial = ["merge", "split"]
    document.getElementById("nextTutorial").style.display = "none"
    document.getElementById("simalarPuzzle").style.display = "none"
    attempt %= 3
    switch(attempt){
        case 0:
            var level6 = new wordTree()
            var lv6_thing = level6.createWord("funny")
            if(america){
                var lv6_thing = lv6_thing.createChild(["f","ə","n", "i"])
                var lv6_thing = lv6_thing.createChild(["n", "i"])
            }else{
                var lv6_thing = lv6_thing.createChild(["f","ʌ","n", "iː"])
                var lv6_thing = lv6_thing.createChild(["n", "iː"])
            }
            lv6_thing.createChild("knee")
            break
        case 1:
            var level6 = new wordTree()
            var lv6_thing = level6.createWord("lies")
            if(america){
                var lv6_thing = lv6_thing.createChild(["ɫ","aɪ","z"])
            }else{
                var lv6_thing = lv6_thing.createChild(["l","aɪ","z"])
            }
            var lv6_thing = lv6_thing.createChild(["aɪ"])
            lv6_thing.createChild("eye")
            break
        case 2:
            var level6 = new wordTree()
            var lv6_thing = level6.createWord("bait")
            var lv6_thing = lv6_thing.createChild(["b","eɪ","t"])
            var lv6_thing = lv6_thing.createChild(["eɪ","t"])
            lv6_thing.createChild("ate")
            break
    }

    init(level6)
    document.getElementById("newPuzzle").style.display = "none"
    document.getElementById("showAnswer").style.display = "initial"
    document.getElementById("showAnswer").onclick = ()=>{showAnswerTutorial(level6, playLevel6, attempt)}

    document.getElementById("nextTutorial").onclick = ()=>{
        document.getElementById("tutorialInfo6").style.display = "none"
        document.getElementById("tutorialInfo7").style.display = "flex"
        playLevel7()
    }
}

function playLevel7(attempt=0){
    deleteAll()
    answerShown = false
    hiddenButtonsForTutorial = ["merge", "split"]
    document.getElementById("nextTutorial").style.display = "none"
    document.getElementById("simalarPuzzle").style.display = "none"
    attempt %= 3
    switch(attempt){
        case 0:
            var level7 = new wordTree()
            var lv7_thing = level7.createWord("bring")
            lv7_thing = lv7_thing.createChild("brings")
            lv7_thing = lv7_thing.createChild("rings")
            
            var lv7_thing2 = level7.createWord("care")
            lv7_thing2 = lv7_thing2.createChild("caring")
            lv7_thing2 = lv7_thing2.createChild("ring")
            break
        case 1:
            var level7 = new wordTree()
            var lv7_thing = level7.createWord("meet")
            if(america){
                lv7_thing = lv7_thing.createChild(["m", "i", "t"])
                lv7_thing = lv7_thing.createChild(["i", "t"])
            }else{
                lv7_thing = lv7_thing.createChild(["m", "iː", "t"])
                lv7_thing = lv7_thing.createChild(["iː", "t"])
            }
            lv7_thing = lv7_thing.createChild("eat")
            
            var lv7_thing2 = level7.createWord("greet")
            lv7_thing2 = lv7_thing2.createChild("greets")
            if(america){
                lv7_thing2 = lv7_thing2.createChild(["g", "ɹ", "i", "t", "s"])
                lv7_thing2 = lv7_thing2.createChild(["i", "t", "s"])
            }else{
                lv7_thing2 = lv7_thing2.createChild(["g", "ɹ", "iː", "t", "s"])
                lv7_thing2 = lv7_thing2.createChild(["iː", "t", "s"])
            }
            lv7_thing2 = lv7_thing2.createChild("eats")
            break
        case 2:
            var level7 = new wordTree()
            var lv7_thing = level7.createWord("need")
            lv7_thing = lv7_thing.createChild("needs")
            if(america){
                lv7_thing = lv7_thing.createChild(["n", "i", "d", "z"])
                lv7_thing = lv7_thing.createChild(["n", "i", "z"])
            }else{
                lv7_thing = lv7_thing.createChild(["n", "iː", "d", "z"])
                lv7_thing = lv7_thing.createChild(["n", "iː", "z"])
            }

            lv7_thing = lv7_thing.createChild("knees")
            
            var lv7_thing2 = level7.createWord("anti")
            if(america){
                lv7_thing2 = lv7_thing2.createChild(["æ", "n", "t", "i"])
                lv7_thing2 = lv7_thing2.createChild(["n", "i"])
            }else{
                lv7_thing2 = lv7_thing2.createChild(["æ", "n", "t", "iː"])
                lv7_thing2 = lv7_thing2.createChild(["n", "iː"])
            }
            lv7_thing2 = lv7_thing2.createChild("knee")
            break
    }

    init(level7)
    document.getElementById("newPuzzle").style.display = "none"
    document.getElementById("showAnswer").style.display = "initial"
    document.getElementById("showAnswer").onclick = ()=>{showAnswerTutorial(level7, playLevel7, attempt)}

    document.getElementById("nextTutorial").onclick = ()=>{
        document.getElementById("tutorialInfo7").style.display = "none"
        document.getElementById("tutorialInfo8").style.display = "flex"
        playLevel8()
    }
}

function playLevel8(attempt=0){
    deleteAll()
    answerShown = false
    hiddenButtonsForTutorial = ["split"]
    document.getElementById("nextTutorial").style.display = "none"
    document.getElementById("simalarPuzzle").style.display = "none"
    attempt %= 3
    switch(attempt){
        case 0:
            var level8 = new wordTree()
            var lv8_thing = level8.createWord("ban")
            lv8_thing = lv8_thing.createChild("ba")
            
            var lv8_thing2 = level8.createWord("lock")
            lv8_thing2 = lv8_thing2.createChild("locking")
            lv8_thing2 = lv8_thing2.createChild("king")

            lv8_thing.getMergedWith(lv8_thing2)
            break
        case 1:
            var level8 = new wordTree()
            var lv8_thing = level8.createWord("kite")
            lv8_thing = lv8_thing.createChild("ite")
            
            var lv8_thing2 = level8.createWord("round")
            lv8_thing2 = lv8_thing2.createChild("r")

            var merged = lv8_thing2.getMergedWith(lv8_thing)
            merged = merged.createChild(["ɹ","aɪ","t"])
            merged = merged.createChild("right")
            break
        case 2:
            var level8 = new wordTree()
            var lv8_thing = level8.createWord("nod")
            lv8_thing = lv8_thing.createChild("od")
            
            var lv8_thing2 = level8.createWord("like")
            lv8_thing2 = lv8_thing2.createChild("liking")
            lv8_thing2 = lv8_thing2.createChild("g")

            var merged = lv8_thing2.getMergedWith(lv8_thing)
            break
    }

    init(level8)
    document.getElementById("newPuzzle").style.display = "none"
    document.getElementById("showAnswer").style.display = "initial"
    document.getElementById("showAnswer").onclick = ()=>{showAnswerTutorial(level8, playLevel8, attempt)}

    document.getElementById("nextTutorial").onclick = ()=>{
        document.getElementById("tutorialInfo8").style.display = "none"
        document.getElementById("tutorialInfo9").style.display = "flex"
        playLevel9()
    }
}

function playLevel9(attempt=0){
    deleteAll()
    lastTutorialQuestion = true
    answerShown = false
    hiddenButtonsForTutorial = []
    document.getElementById("nextTutorial").style.display = "none"
    document.getElementById("simalarPuzzle").style.display = "none"
    attempt %= 3
    switch(attempt){
        case 0:
            var level9 = new wordTree()
            var lv9_thing = level9.createWord("thought")
            var lv9_thing = lv9_thing.createChild("thinking")

            lv9_split1 = lv9_thing.createChild("thin")
            
            var lv9_split2 = lv9_thing.createChild("king")
            break
        case 1:
            var level9 = new wordTree()
            var lv9_thing = level9.createWord("insider")
            var lv9_thing = lv9_thing.createChild("inside")

            var lv9_split1 = lv9_thing.createChild("in")
            
            var lv9_split2 = lv9_thing.createChild("side")
            break
        case 2:
            var level9 = new wordTree()
            var lv9_thing = level9.createWord("hatred")

            var lv9_split1 = lv9_thing.createChild("hat")
            if(!america){
                lv9_split1 = lv9_split1.createChild("hatted")
                lv9_split1 = lv9_split1.createChild("hate")
            }else{
                lv9_split1 = lv9_split1.createChild("hats")
            }
            
            var lv9_split2 = lv9_thing.createChild("red")
            break
    }

    init(level9)
    document.getElementById("newPuzzle").style.display = "none"
    document.getElementById("showAnswer").style.display = "initial"
    document.getElementById("showAnswer").onclick = ()=>{showAnswerTutorial(level9, playLevel9, attempt);}

    document.getElementById("nextTutorial").onclick = ()=>{
        document.getElementById("tutorialInfo8").style.display = "none"
        document.getElementById("tutorialInfo9").style.display = "flex"
        playLevel9()
    }
}

function showAnswerTutorial(level, levelFunc, attempt){
    answerShown=true
    displayAnswer(level)
    document.getElementById("simalarPuzzle").style.display = "initial"
    document.getElementById("simalarPuzzle").onclick  = ()=>(levelFunc(attempt+1))
    document.getElementById("showAnswer").style.display = "none"
}