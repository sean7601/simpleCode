var editor = {}

editor.instance = {}
editor.openFile = async function(uuid){

    //go over loadFolder.fileStructure array and find the file with the uuid
    let file = loadFolder.fileStructure.find(file => file.uuid == uuid)
    if(editor.instance.hasOwnProperty(uuid)){
        //if the file is already open, just switch to it
        $(".nav-link").removeClass("active")
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
    file = file.contents
    if(file.hasOwnProperty("text")){
        //hide all editors
        $(".editor").hide()
        $("#editor").append("<div class='editor' id='editor-"+uuid+"'></div>")
        $(".nav").append(`<li class="nav-item">
            <a class="nav-link active" id="nav-${uuid}" aria-current="page" href="#">
                <span onclick=editor.openFile('${uuid}')>${file.name}</span>
                <span class='m-3' onclick=editor.deleteTab('${uuid}')>&#10006;</span>
            </a>
        </li>`)
        editor.instance[uuid] = CodeMirror(document.getElementById("editor-"+uuid), {
            value: file.text,
            mode:  mode,
            lineNumbers: true,
            height: "auto",
            theme: "material",
        });

        editor.instance[uuid].on("change",function(){
            //save the file
            let file = loadFolder.fileStructure.find(file => file.uuid == uuid)
            let fileHandle = file.entry
            let contents = editor.instance[uuid].getValue()
            file.text = contents
            fileHandle.createWritable().then(writable => {
                writable.write(contents);
                writable.close();
            })
            //re read the file from loadFolder.fileHandle object and update the loadFolder.fileStructure object

            
        })
    }
    else{
        
        let reader = new FileReader();
        reader.onload = function(e) {
            //hide all editors
            $(".editor").hide()
            file.text = e.target.result
            $("#editor").append("<div class='editor' id='editor-"+uuid+"'></div>")
            $(".nav").append(`<li class="nav-item">
                <a class="nav-link active" id="nav-${uuid}" aria-current="page" href="#">
                    <span onclick=editor.openFile('${uuid}')>${file.name}</span>
                    <span class='m-3' onclick=editor.deleteTab('${uuid}')>&#10006;</span>
                </a>
            </li>`)
            editor.instance[uuid] = CodeMirror(document.getElementById("editor-"+uuid), {
                value: e.target.result,
                mode:  mode,
                lineNumbers: true,
                height: "auto",
                theme: "material",
            });

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
        }
        reader.readAsText(file);
    }
}

editor.deleteTab = function(uuid){
    $(`#nav-${uuid}`).remove()
    $(`#editor-${uuid}`).remove()
    delete editor.instance[uuid]
}