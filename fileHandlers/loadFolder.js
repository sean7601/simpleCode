var loadFolder = {}

loadFolder.files = []
loadFolder.init = function() {
    var html = '<div class="picker"><input type="file" id="picker" name="fileList" webkitdirectory multiple></div>'
    html += '<ul id="listing"></ul>'
    $('#sidebar').html(html)
    let picker = document.getElementById('picker');
    let listing = document.getElementById('listing');

    picker.addEventListener('change', e => {
        // load the contents of each file into loadFolder.files
        for (let i = 0; i < e.target.files.length; i++) {
            let file = e.target.files[i];
            let reader = new FileReader();
            reader.onload = function(e) {
                let item = document.createElement('li');
                item.textContent = file.webkitRelativePath;
                let fileData = {}
                fileData.name = file.webkitRelativePath
                fileData.path = fileData.name.split('/')
                fileData.type = fileData.name.split('.').pop()
                fileData.file = file
                fileData.contents = e.target.result
                listing.appendChild(item);
                loadFolder.files.push(fileData);
            }
            reader.readAsText(file);
        }

        
    });
}

// store a reference to our file handle
loadFolder.fileHandle;
loadFolder.fileStructure = []
loadFolder.fileStructureObject = {}
loadFolder.getFile = async function() {
  // open file picker
  loadFolder.fileHandle = await window.showDirectoryPicker();

  loadFolder.fileStructure = await loadFolder.recursivelyReadDirectory([],[],await loadFolder.fileHandle.entries())


  //convert fileStructure to an object with directories as keys and files as values
    loadFolder.fileStructureObject = {files:[],directories:{}}
    for(let i = 0; i < loadFolder.fileStructure.length; i++){
        let file = loadFolder.fileStructure[i]
        let path = file.path
        let current = loadFolder.fileStructureObject
        for(let ii = 0; ii < path.length; ii++){
            if(current.directories[path[ii]] == undefined){
                current.directories[path[ii]] = {files:[],directories:{}}
            }
            current = current.directories[path[ii]]
        }
        current.files.push(file)
    }
    console.log(loadFolder.fileStructureObject)
    //write files to html in a nested list with the object
    let html = loadFolder.recursivelyWriteDirectoryHtml("",loadFolder.fileStructureObject)
    $('#sidebar').html(html)

    /*
      const writableStream = await fileStructure[0].entry.createWritable();

  // write our file
  await writableStream.write("test ata \n test again);

  // close the file and write the contents to disk.
  await writableStream.close();
    */
}

loadFolder.recursivelyWriteDirectoryHtml = function(html,directory){
    console.log(directory)
    html += "<ul>"
    for(let i = 0; i < directory.files.length; i++){
        html += "<li onclick=editor.openFile('"+directory.files[i].uuid+"')>" + directory.files[i].name + "</li>"
    }
    for(let key in directory.directories){
        html += "<li>" + key + loadFolder.recursivelyWriteDirectoryHtml("",directory.directories[key]) + "</li>"
    }
    html += "</ul>"
    return html
}

loadFolder.recursivelyReadDirectory = async function(path,fileStruc,entries) {
    if(path.length > 0 && (path.indexOf(".git") != -1 || path.indexOf(".vscode") != -1)){
        return fileStruc
    }
    for await (let entry of entries) {
        entry = entry[1]
        console.log(entry);
        
        //get the file contents, name, and path in an object and push it to fileStructure
        let fileData = {}
        fileData.name = entry.name
        fileData.path = path
        fileData.type = fileData.name.split('.').pop()
        fileData.kind = entry.kind
        fileData.entry = entry
        fileData.uuid = loadFolder.createUuid()
        if(entry.kind == 'file'){
            fileData.contents = await entry.getFile()
            fileStruc.push(fileData)
        }
        else{
            let tempPath = JSON.parse(JSON.stringify(path))
            tempPath.push(entry.name)
            fileStruc = await loadFolder.recursivelyReadDirectory(tempPath,fileStruc,await entry.entries())
        }
        
    }

    return fileStruc
}

loadFolder.createUuid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

