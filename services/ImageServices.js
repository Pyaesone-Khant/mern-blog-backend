const Image = require('../models/Image');

class ImageServices {
  async createImage(imageObj) {
    try {
      const newImage = await Image.create(imageObj);
        return newImage;
    }catch(error){
      throw new Error(error)
    }
  }

  async getAllImages() {
    try {
      const images = await Image.find();
      return images;
    }catch(error){
      throw new Error(error)
    }
  }

  async getImageById(id) {
    try {
      const image = await Image.findById(id);
      return image;
    }catch(error){
        throw new Error(error)
    }
  }

  async updateImage(id, imageData) {
    try {
      const result = await Image.findByIdAndUpdate(id, imageData);
        return result;
    }catch (error){
        throw new Error(error)
    }
  }

  async deleteImage(id) {
    try{
      const result = await Image.findByIdAndDelete(id);
        return result;
    }catch(error){
        throw new Error(error)
    }
  }
}

module.exports = new ImageServices();