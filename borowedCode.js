function dragElement(elmnt, clickFunction, moveFunction) { //https://www.w3schools.com/howto/howto_js_draggable.asp
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    var startPos = {x:0,y:0}
    elmnt.onmousedown = dragMouseDown;
    elmnt.ontouchstart = dragTouchDown;
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        startPos = {x:elmnt.offsetLeft, y:elmnt.offsetTop}
        document.onmouseup = closeDragElement;
        document.ontouchend = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
        document.ontouchmove = elementDragTouch;
    }

    function elementDragTouch(e){
        e.clientX = e.changedTouches[0].clientX
        e.clientY = e.changedTouches[0].clientY
        elementDrag(e)
    }

    function dragTouchDown(e){
        // e.clientX = e.changedTouches[0].clientX
        // e.clientY = e.changedTouches[0].clientY
        dragMouseDown(e)
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2/zoomScale) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1/zoomScale) + "px";
        moveFunction()
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        console.log(startPos, elmnt.offsetLeft, elmnt.offsetTop)
        if(Math.abs(startPos.x-elmnt.offsetLeft)<3 && Math.abs(startPos.y-elmnt.offsetTop)<3){
            clickFunction()
        }
        moved = false
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchmove = null;
        document.ontouchend = null;
    }
}


  function getOffset(el) { // https://thewebdev.info/2021/09/12/how-to-draw-a-line-between-two-divs-with-javascript/
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.pageXOffset,
      top: rect.top + window.pageYOffset,
      width: rect.width || el.offsetWidth,
      height: rect.height || el.offsetHeight
    };
}

function updateLine(line,div1,div2){
    const off1 = getOffset(div1);
    const off2 = getOffset(div2);
    const x1 = off1.left + off1.width/2;
    const y1 = off1.top + off1.height/2;

    const x2 = off2.left + off2.width/2;
    const y2 = off2.top + off2.height/2;

    const length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));

    const cx = ((x1 + x2) / 2) - (length / 2);
    const cy = ((y1 + y2) / 2) - (1 / 2);

    const angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
    line.style.left = cx+"px"
    line.style.top = cy+"px"
    line.style.width = length+"px"
    line.style.transform = "rotate(" + angle + "deg)"
}

function connectLine(div1, div2){ //https://thewebdev.info/2021/09/12/how-to-draw-a-line-between-two-divs-with-javascript/
    const line = document.createElement("div")//"<div style='padding:0px; margin:0px; height:" + thickness + "px; background-color:" + color + "; line-height:1px; position:absolute; left:" + cx + "px; top:" + cy + "px; width:" + length + "px; -moz-transform:rotate(" + angle + "deg); -webkit-transform:rotate(" + angle + "deg); -o-transform:rotate(" + angle + "deg); -ms-transform:rotate(" + angle + "deg); transform:rotate(" + angle + "deg);' />";
    updateLine(line,div1,div2)
    line.classList.add("joinLine")
    document.body.appendChild(line);
    return(line)
}

function permutator(inputArr) { //https://stackoverflow.com/questions/9960908/permutations-in-javascript
    var results = [];
    
    function permute(arr, memo) {
        var cur, memo = memo || [];
    
        for (var i = 0; i < arr.length; i++) {
        cur = arr.splice(i, 1);
        if (arr.length === 0) {
            results.push(memo.concat(cur));
        }
        permute(arr.slice(), memo.concat(cur));
        arr.splice(i, 0, cur[0]);
        }
    
        return results;
    }
    
    return permute(inputArr);
    }
function shuffle(array) {//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    let currentIndex = array.length;
    
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
    
        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
    
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    }

function levenshtein(a, b) { //https://www.slingacademy.com/article/evaluating-similarity-between-strings-using-basic-distance-measures-in-javascript/
    const matrix = [];
    
    let i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    
    let j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
        } else {
            matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
            );
        }
        }
    }
    
    return matrix[b.length][a.length];
}
async function getBlobFromCanvas(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
        if (blob) {
            resolve(blob);
        } else {
            reject(new Error("Canvas toBlob failed"));
        }
        });
    });
    }
async function copyCanvasContentsToClipboard(canvas) {
    // Copy canvas to blob
    try {
        const blob = await getBlobFromCanvas(canvas);
        // Create ClipboardItem with blob and it's type, and add to an array
        const data = [new ClipboardItem({
            [blob.type]: blob
        })];
        // Write the data to the clipboard
        await navigator.clipboard.write(data);
    } catch (error) {
        document.getElementById("sharePreview").select()
        document.execCommand("copy")
    }
}