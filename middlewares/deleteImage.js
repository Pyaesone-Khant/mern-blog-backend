const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const deleteImage = async (imageName) => {
    try {
        await s3.deleteObject({Bucket : process.env.AWS_BUCKET_NAME, Key : imageName}).promise();
        return true;
    } catch (error) {
        console.log(error)
    }
}

module.exports = deleteImage;