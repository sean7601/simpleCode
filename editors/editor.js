var editor = {}

editor.instance = {}
editor.openFile = async function(uuid){
    $(".nav-link").removeClass("active")
    //go over loadFolder.fileStructure array and find the file with the uuid
    let file = loadFolder.fileStructure.find(file => file.uuid == uuid)
    if(editor.instance.hasOwnProperty(uuid)){
        //if the file is already open, just switch to it
        $("#nav-"+uuid).addClass("active")
        $(".editor").hide()
        $("#editor-"+uuid).show()
        return
    }
  
    var mode = file.type
    if(mode == "js"){
        mode = "javascript"
    }
    if(mode == "html"){
        mode = "htmlmixed"
    }
    if(mode == "py"){
        mode = "python"
    }

    //re-read the file from the handle
    var fileObj = await file.entry.getFile()

    //read the fileObj
    fileObj = await fileObj.text()

    file.contents = fileObj
    file.text = fileObj
    console.log(fileObj)
    console.log(file)
        //hide all editors
        $(".editor").hide()
        $("#editor").append("<div class='editor' id='editor-"+uuid+"'></div>")
        $(".nav").append(`<li class="nav-item">
            <a class="nav-link active" id="nav-${uuid}" aria-current="page" href="#">
                <span onclick=editor.openFile('${uuid}')>${file.name}</span>
                <span class='m-3' onclick=editor.deleteTab('${uuid}')>X</span>
            </a>
        </li>`)
        editor.instance[uuid] = CodeMirror(document.getElementById("editor-"+uuid), {
            value: file.text,
            mode:  mode,
            lineNumbers: true,
            height: "auto",
            theme: "material",
            matchBrackets: true,
            autoCloseBrackets: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            lineWrapping: true,
            extraKeys: {"Ctrl-F": "findPersistent","Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
        });

        editor.instance[uuid].on("change",function(){
            $("#saveButton").removeClass("btn-outline-secondary")
            $("#saveButton").removeClass("btn-outline-success")
            $("#saveButton").addClass("btn-outline-danger")

            
        })
    
}

editor.deleteTab = function(uuid){
    $(`#nav-${uuid}`).remove()
    $(`#editor-${uuid}`).remove()
    delete editor.instance[uuid]
}

editor.addFile = async function(){
    //ask for file name
    let name = prompt("Enter file name")
    if(name == null){
        return
    }
    //build with showFileSavePicker
    let handle = await window.showSaveFilePicker({ suggestedName: name })
    console.log(handle)
    //read the file from the handle
    let file = await handle.getFile().then(function(file){
        console.log(file)
        let reader = new FileReader();
        reader.onload = function(e) {
            //hide all editors
            var uuid = loadFolder.createUuid()
            $(".editor").hide()
            $("#editor").append("<div class='editor' id='editor-"+uuid+"'></div>")
            $(".nav").append(`<li class="nav-item">
                <a class="nav-link active" id="nav-${uuid}" aria-current="page" href="#">
                    <span onclick=editor.openFile('${uuid}')>${handle.name}</span>
                    <span class='m-3' onclick=editor.deleteTab('${uuid}')>&#10006;</span>
                </a>
            </li>`)
            editor.instance[uuid] = CodeMirror(document.getElementById("editor-"+uuid), {
                value: "",
                mode:  "javascript",
                lineNumbers: true,
                height: "auto",
                theme: "material",
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]

            });
            /*
            editor.instance[uuid].on("change",function(){
                //save the file
                let file = loadFolder.fileStructure.find(file => file.uuid == uuid)
                let fileHandle = file.entry
                let contents = editor.instance[uuid].getValue()
                file.contents.text = contents
                fileHandle.createWritable().then(writable => {
                    writable.write(contents);
                    writable.close();
                })
            })
            */
        }
        reader.readAsText(file);
    })
    
}

editor.saveAll = function(){
    for(let uuid in editor.instance){
        let file = loadFolder.fileStructure.find(file => file.uuid == uuid)
        let fileHandle = file.entry
        let contents = editor.instance[uuid].getValue()
        file.text = contents
        fileHandle.createWritable().then(writable => {
            writable.write(contents);
            writable.close();
        })
    }

    //change the #saveButton to success for 5 seconds then back to primary
    $("#saveButton").removeClass("btn-outline-primary")
    $("#saveButton").removeClass("btn-outline-danger")
    $("#saveButton").addClass("btn-outline-success")
    setTimeout(function(){
        $("#saveButton").removeClass("btn-outline-success")
        $("#saveButton").addClass("btn-outline-primary")
    },5000)
}