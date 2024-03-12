const formatData = (data = []) => {
    return data?.map((blog) => {
        return {
            ...blog,
            blogImage: blog?.blogImage ? process.env.AWS_OBJECT_URL + blog?.blogImage : null,
        }
    });
}

const ResponseObj = (res, status, data) => {
    return res.status(status).json(data);
}

module.exports = {formatData, ResponseObj}
