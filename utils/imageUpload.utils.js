const cloudinary = require("cloudinary").v2;

// const imageUploader = async (file, folder, height, quality) => {
//     console.log("folder ", file)
//     const options = { folder };
//     if (height) options.height = height;

//     if (quality) options.quality = quality;

//     options.resource_type = "auto";
//     if (Array.isArray(file)) {
//         let uploadedFiles = [];
//         // If File is Arrat That Mean There Was Multiple File. Then Upload All Files
//         for (const item of file) {
//             const res = await cloudinary.uploader.upload(
//                 item.tempFilePath,
//                 options
//             );
//             uploadedFiles.push(res.secure_url);
//         }
//         return uploadedFiles;
//     }

//     const result = await cloudinary.uploader.upload(file.tempFilePath, options);
//     return result.secure_url;
// };



const imageUploader = async (files, folder, height, quality) => {
    const options = {
        folder,
        resource_type: "auto",
    };

    if (height) options.height = height;
    if (quality) options.quality = quality;

    // If multiple files
    if (Array.isArray(files)) {
        const uploadedFiles = [];

        for (const file of files) {
            if (!file?.tempFilePath) continue; // Skip if tempFilePath missing

            const uploadRes = await cloudinary.uploader.upload(
                file.tempFilePath,
                options
            );

            uploadedFiles.push(uploadRes.secure_url);
        }

        return uploadedFiles;
    }

    // If single file
    if (files?.tempFilePath) {
        const result = await cloudinary.uploader.upload(
            files.tempFilePath,
            options
        );
        return result.secure_url;
    }

    // If no valid file
    throw new Error("No valid file provided for upload.");
};


module.exports = imageUploader;
