let inputArr = process.argv.slice(2);
let fs = require("fs");
let path = require("path");
// console.log(inputArr);
// node fileSystemOrganizer.js tree "directoryPath"
// node fileSystemOrganizer.js organize "directoryPath"
// node fileSystemOrganizer.js help

let types = {
    archives: ["zip", "7z", "rar", "tar", "gz", "ar", "iso", "xz"],
    media: ["mp4", "mkv", "mp3"],
    documents: ["docx", "doc", "pdf", "xlsx", "xls", "odt", "ods", "odg", "odf", "txt", "ps", "tex", "csv"],
    app: ["exe", "dmg", "pkg", "deb", "apk"]
}

let command = inputArr[0];
switch (command) {
    case "tree":
        treeFn(inputArr[1])
        break;
    case "organize":
        organizeFn(inputArr[1])
        break;
    case "help":
        helpFn()
        break;
    default:
        console.log("Please input a valid command or type \"node fileSystemOrganizer.js help\" ")
        break;
}

function treeFn (dirPath) {
    if (dirPath == undefined) {
        treeMaker(process.cwd(), "");
        return;
    }else if (!fs.existsSync(dirPath)) {
        console.log("Please enter a valid path!")
    }else{
        treeMaker(dirPath, "");
        console.log("Tree command implemented for ", dirPath);
    }
}

function treeMaker (dirPath, intend) {
    if (fs.lstatSync(dirPath).isFile()) {
        console.log(intend + "├───" + path.basename(dirPath));
    }else if (fs.lstatSync(dirPath).isDirectory()) {
        console.log(intend + "└───" + path.basename(dirPath));
        let children = fs.readdirSync(dirPath);
        for (let i=0;i<children.length;i++) {
            let childPath = path.join(dirPath, children[i]);
            treeMaker(childPath, intend + "\t");
        }
    }
}

function organizeFn (dirPath) {
    if (dirPath == undefined) {
        console.log("You must enter a path!");
        return;
    }else if (!fs.existsSync(dirPath)) {
        console.log("Please enter a valid path!")
    }else {
        let destPath = path.join(dirPath, "organized_files");
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath);
        }
        organizer(dirPath, destPath);
        console.log("Organize command implemented for", dirPath);
    }
}

function organizer (src, dest) {
    let childs = fs.readdirSync(src);   //reads path and lists the files and folders
    for (let i=0; i<childs.length; i++) {
        let childAddress = path.join(src, childs[i]);
        if (fs.lstatSync(childAddress).isFile()) {   //lstatSync() sends info about file/dir. isFile() checks if it is a file
            let category = getCategory(childs[i]);
            moveFiles(childAddress, dest, category);
            // console.log("Moved", childAddress, "to", dest);
        } else if (fs.lstatSync(childAddress).isDirectory() && childAddress!=dest) {   //isDirectory() check if it is a folder ......... childAddress!=dest makes sure that after organizing <folder1> in the given <src> it will not move to <organized_files> and start organizing it again, i.e. moving it to current path(no change) and then deleting the files. So in the end, it will just delete already organized files from <folder1>
            // console.log(childAddress)
            organizer(childAddress, dest);
            // console.log(childAddress)
            fs.rmdirSync(childAddress);
        }
    }
}

function moveFiles (srcFile, dest, category) {
    let categoryPath = path.join(dest, category);
    if (!fs.existsSync(categoryPath)) {
        fs.mkdirSync(categoryPath);
    }
    let filename = path.basename(srcFile);
    let destFilePath = path.join(categoryPath, filename);
    fs.copyFileSync(srcFile, destFilePath);  //copies file
    fs.unlinkSync(srcFile);     // deletes file
}

function getCategory (name) {
    let ext = path.extname(name);
    ext = ext.slice(1);
    for (let type in types) {
        let cTypeArray = types[type];
        for (let i=0; i<cTypeArray.length; i++) {
            if (ext==cTypeArray[i]) {
                return type;
            }
        }
    }
    return "others";
}

function helpFn () {
    console.log(`
    List of all the commands:
            node fileSystemOrganizer.js tree <directoryPath>
            node fileSystemOrganizer.js organize <directoryPath></directoryPath>
            `);              // backtic  " ` " shows the output in the same format/line/spacing as written in the code just like ''' in python
}