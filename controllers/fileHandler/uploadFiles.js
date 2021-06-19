const fs = require("fs-extra");
var path = require("path");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function uploadImages(files, folder) {
  var images = [];
  let pciturePath = `./uploads/${folder}/`;

  try {
    if (!fs.existsSync(pciturePath)) {
      fs.mkdirSync(pciturePath, {
        recursive: true
      });
    }
    //getting time & date
    var today = new Date();
    var date =
      today.getFullYear() +
      "_" +
      (today.getMonth() + 1) +
      "_" +
      today.getDate();
    var time =
      today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    var dateTime = date + "_" + time;

    if (typeof files.name == "undefined" && files.length > 0) {
      //for multi file upload.
      await asyncForEach(files, async (file, index) => {
        let fileType = file.mimetype.split("/")[1];
        fileType = fileType == "octet-stream" ? "jpg" : fileType;

        let newName =
          String.fromCharCode(index + 65) +
          "_" +
          dateTime +
          Math.floor(Math.random() * 1000000000) +
          "." +
          fileType;
        let imageFile = pciturePath + newName;
        // console.log("called");
        fs.writeFileSync(imageFile, file.data);
        images.push(newName);
      });
    } else if (typeof files.name !== "undefined") {
      //fore single file upload
      let fileType = files.mimetype.split("/")[1];
      fileType = fileType == "octet-stream" ? "jpg" : fileType;

      let newName =
        String.fromCharCode(0 + 65) +
        "_" +
        dateTime +
        Math.floor(Math.random() * 1000000000) +
        "." +
        fileType;

      let imageFile = pciturePath + newName;

      fs.writeFileSync(imageFile, files.data);
      images.push(newName);
    }
    return {
      success: true,
      images: images,
      message: "Successfully saved images!",
    };
  } catch (error) {
    return { success: false, images: images, message: error.message };
  }
}

async function uploadCsv(files, folder) {
  var images = [];
  let csvFolder = `./uploads/${folder}/`;

  try {
    if (!fs.existsSync(csvFolder)) {
      fs.mkdirSync(csvFolder,{
        recursive: true
      });
    }
    //getting time & date
    var today = new Date();
    var date =
      today.getFullYear() +
      "_" +
      (today.getMonth() + 1) +
      "_" +
      today.getDate();
    var time =
      today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    var dateTime = date + "_" + time;

    if (typeof files.name == "undefined" && files.length > 0) {
      //for multi file upload.
      await asyncForEach(files, async (file, index) => {
        let fileType = file.mimetype.split("/")[1];
        fileType = fileType == "csv" ? "csv" : fileType;

        let newName =
          String.fromCharCode(index + 65) +
          "_" +
          dateTime +
          Math.floor(Math.random() * 1000000000) +
          "." +
          fileType;
        let imageFile = csvFolder + newName;
        // console.log("called");
        fs.writeFileSync(imageFile, file.data);
        images.push(newName);
      });
    } else if (typeof files.name !== "undefined") {
      //fore single file upload
      let fileType = files.mimetype.split("/")[1];
      fileType = fileType == "octet-stream" ? "jpg" : fileType;

      let newName =
        String.fromCharCode(0 + 65) +
        "_" +
        dateTime +
        Math.floor(Math.random() * 1000000000) +
        "." +
        fileType;

      let imageFile = csvFolder + newName;

      fs.writeFileSync(imageFile, files.data);
      images.push(newName);
    }
    return {
      success: true,
      images: images,
      message: "Successfully saved images!",
    };
  } catch (error) {
    return { success: false, images: images, message: error.message };
  }
}

async function uploadVideo(files, folder) {
  var assetNames = [];
  try {
    // if (typeof files.name == "undefined" && files.length > 0) {
    //     //for multi file upload.
    //     await asyncForEach(files, async (file, index) => {

    //         let fileType = file.mimetype.split("/")[1];
    //         fileType = fileType == "octet-stream" ? "jpg" : fileType;

    //         let newName =
    //             String.fromCharCode(index + 65) +
    //             "_" +
    //             Math.floor(Math.random() * 1000000000) +
    //             "." + fileType;
    //         let imageFile = `./uploads/${folder}/` + newName;

    //         fs.writeFileSync(imageFile, file.data);
    //         images.push(newName);

    //     });
    // } else
    if (typeof files.name != "undefined") {
      //fore single file upload
      let fileType = files.mimetype.split("/")[1];
      fileType = fileType == "octet-stream" ? "mp4" : fileType;

      let newName =
        String.fromCharCode(0 + 65) +
        "_" +
        Math.floor(Math.random() * 1000000000) +
        "." +
        fileType;

      let imageFile = `./uploads/${folder}/` + newName;

      fs.writeFileSync(imageFile, files.data);
      assetNames.push(newName);
    }
    return {
      success: true,
      assetNames: assetNames,
      message: "Successfully saved images!",
    };
  } catch (error) {
    console.log(error);
    return { success: false, assetNames: assetNames, message: error.message };
    // return res.status(200).json({ message: "error" });
  }
}
async function uploadAudio(files, folder) {
  var assetNames = [];
  try {
    // if (typeof files.name == "undefined" && files.length > 0) {
    //     //for multi file upload.
    //     await asyncForEach(files, async (file, index) => {

    //         let fileType = file.mimetype.split("/")[1];
    //         fileType = fileType == "octet-stream" ? "jpg" : fileType;

    //         let newName =
    //             String.fromCharCode(index + 65) +
    //             "_" +
    //             Math.floor(Math.random() * 1000000000) +
    //             "." + fileType;
    //         let imageFile = `./uploads/${folder}/` + newName;

    //         fs.writeFileSync(imageFile, file.data);
    //         images.push(newName);

    //     });
    // } else
    if (typeof files.name != "undefined") {
      //fore single file upload
      let fileType = files.mimetype.split("/")[1];
      fileType = fileType == "octet-stream" ? "mp3" : fileType;

      let newName =
        String.fromCharCode(0 + 65) +
        "_" +
        Math.floor(Math.random() * 1000000000) +
        "." +
        fileType;

      let imageFile = `./uploads/${folder}/` + newName;

      fs.writeFileSync(imageFile, files.data);
      assetNames.push(newName);
    }
    return {
      success: true,
      assetNames: assetNames,
      message: "Successfully saved images!",
    };
  } catch (error) {
    console.log(error);
    return { success: false, assetNames: assetNames, message: error.message };
    // return res.status(200).json({ message: "error" });
  }
}

function deleteFile(fileName, folder) {
  try {
    return new Promise((resolve, reject) => {
      var appDir = path.dirname(require.main.filename);
      let fullPath = appDir + "/uploads/" + folder + "/" + fileName + "";
      console.log(fullPath);
      if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.log(err);
            reject("error");
          }

          resolve("success");
        });
      } else {
        resolve("not_exist");
      }
    });
  } catch (error) {
    console.log(error);
    return "error";
  }
}
module.exports.uploadImages = uploadImages;
module.exports.uploadCsv = uploadCsv;
module.exports.uploadVideo = uploadVideo;
module.exports.uploadAudio = uploadAudio;
module.exports.deleteFile = deleteFile;
