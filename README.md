![ASL-Translator](https://socialify.git.ci/nathanlm511/ASLTranslator/image?font=Raleway&forks=1&issues=1&language=1&owner=1&pattern=Charlie%20Brown&pulls=1&stargazers=1&theme=Dark)

## Inspiration

Sign Language is an efficient way of communicating for people with disabilities.
But people who don't understand sign language can find it quite difficult to comprehend it and communicate with them.

In today's day and age of communication via web conferencing, the communication can become even more difficult without having a translator around to help people assist in ensuring communication.

## What it does

ASL-Translator is a video conferencing application built using webrtc and tensorflow.js that detects sign language and converts it into English text.
The web cam stream is set up between two people using socket.io and the stream which detects sign language sends the frames to a machine learning model using tf.js and it helps detect the signs and these get converted into text.
A grammar API analyzes the collection of letters and converts them into meaningful words.

## How we built it

We have created a WebRTC based video conferencing application using SocketJS and WebRTC.
We trained a machine learning model using CNN with American Sign Language Dataset from Kaggle in Python.
And then converted this into TensorFlowJS model using TFJS converter.
Then we captured the frames from the video stream and sent them to the TFJS model to predict the sign from the frame and send them as a collection of letters which are then displayed on the screen to the person who isnt using the sign language as a means to understand the sign language.

## Challenges we ran into

The biggest challenge was definitely implementing TF.JS by first converting the Python based model into Javascript and then capturing the frames and analyzing them.
Setting up web rtc connection with Flask also appeared to be quite challenging.

## Accomplishments that we are proud of

We were able to get decent accuracy on our American Sign Language model and successfully able to integrate TF.JS with our webrtc web stream.

## What We learned

WebRtc, TF.JS, Socketio connectivity.

<!-- ACKNOWLEDGEMENTS -->

## Acknowledgements

- [MLH-Fellowship](https://fellowship.mlh.io/)

<!-- LICENSE -->

## License

Distributed under the MIT License.

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Built With

- [TF.JS](https://tensorflow.org/js)
- [Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
