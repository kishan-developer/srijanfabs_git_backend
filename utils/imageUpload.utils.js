const cloudinary = require("cloudinary").v2;

const imageUploader = async (file, folder, height, quality) => {
    const options = { folder };
    if (height) options.height = height;

    if (quality) options.quality = quality;

    options.resource_type = "auto";
    if (Array.isArray(file)) {
        let uploadedFiles = [];
        // If File is Arrat That Mean There Was Multiple File. Then Upload All Files
        for (const item of file) {
            const res = await cloudinary.uploader.upload(
                item.tempFilePath,
                options
            );
            uploadedFiles.push(res.secure_url);
        }
        return uploadedFiles;
    }

    const result = await cloudinary.uploader.upload(file.tempFilePath, options);
    return result.secure_url;
};

module.exports = imageUploader;
