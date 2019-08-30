module.exports = (blob) => {
    return new Buffer(blob).toString('base64')
}