const video = document.getElementById("video")

const startVideo = () => {
    navigator.getUserMedia(
        {video:{}},
        stream => {
            video.srcObject = stream
            video.onloadedmetadata = function(e) {
                video.play();
            };
        },
        err => console.log(err)
    )
}


//异步加载模型
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
    faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(() => {
    startVideo()
})


video.addEventListener("play", () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)

    const displaysize = {
        width:video.width,
        height:video.height
    }

    faceapi.matchDimensions(canvas, displaysize)

    setInterval( async () => {
        const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceExpressions()

        const resizedDetections = faceapi.resizeResults(detections, displaysize)
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    },100)
})

