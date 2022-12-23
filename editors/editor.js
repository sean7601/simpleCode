var editor = {}

editor.instance = null
editor.openFile = async function(uuid){

    //go over loadFolder.fileStructure array and find the file with the uuid
    let file = loadFolder.fileStructure.find(file => file.uuid == uuid)
    console.log(file)
    file = file.contents
    if(file.hasOwnProperty("text")){
        document.getElementById("editor").innerHTML = ""
        console.log(file)
        editor.instance = CodeMirror(document.getElementById("editor"), {
            value: file.text,
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
            console.log(e)
            console.log(e.target.result)
            document.getElementById("editor").innerHTML = ""
            file.text = e.target.result
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