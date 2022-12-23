var editor = {}

editor.instance = null
editor.openFile = async function(uuid){
    //go over loadFolder.fileStructure array and find the file with the uuid
    let file = loadFolder.fileStructure.find(file => file.uuid == uuid)
    file = file.contents
    
    let reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById("editor").innerHTML = ""
        editor.instance = CodeMirror(document.getElementById("editor"), {
            value: e.target.result,
            mode:  "javascript",
            lineNumbers: true,
            height: "auto",
        });

        editor.instance.on("change",function(){
            //save the file
            let file = loadFolder.fileStructure.find(file => file.uuid == uuid)
            console.log(file)
            let fileHandle = file.entry
            let contents = editor.instance.getValue()
            fileHandle.createWritable().then(writable => {
                writable.write(contents);
                writable.close();
            })
        })
    }
    reader.readAsText(file);
    
}