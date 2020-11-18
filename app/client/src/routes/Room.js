import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import * as tf from "@tensorflow/tfjs";
const cv = require("./opencv.js");
cv["onRuntimeInitialized"] = () => {
	let mat = new cv.Mat();
	console.log(mat.size());
	mat.delete();
};

const maxVideoSize = 224;
const LETTERS = [
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
	"O",
	"P",
	"Q",
	"R",
	"S",
	"T",
	"U",
	"V",
	"W",
	"X",
	"Y",
	"Z",
	"_NOTHING",
	"_SPACE",
];
const THRESHOLD = 5;

const THRESHOLDS = {
	S: 3,
	E: 5,
	A: 5,
	N: 6,
	R: 5,
};

const model = tf.loadLayersModel("../tfjs/model.json");

function predict({ msg, payload }) {
	const tensor = tf.browser
		.fromPixels(payload)
		.div(tf.scalar(127.5))
		.sub(tf.scalar(1))
		.expandDims();
	const prediction = model.predict(tensor);
	const predictedLetter = prediction.argMax(1).dataSync();
	const confidence = prediction.dataSync()[0];
	postMessage({ msg, payload: predictedLetter });
	tensor.dispose();
	prediction.dispose();
}

function imageProcessing({ msg, payload }) {
	const img = cv.matFromImageData(payload);
	let result = new cv.Mat();

	cv.cvtColor(img, result, cv.COLOR_BGR2GRAY);
	cv.adaptiveThreshold(
		result,
		result,
		255,
		cv.ADAPTIVE_THRESH_GAUSSIAN_C,
		cv.THRESH_BINARY,
		21,
		2
	);
	cv.cvtColor(result, result, cv.COLOR_GRAY2RGB);

	postMessage({ msg, payload: imageDataFromMat(result) });
}

function imageDataFromMat(mat) {
	// convert the mat type to cv.CV_8U
	const img = new cv.Mat();
	const depth = mat.type() % 8;
	const scale =
		depth <= cv.CV_8S ? 1.0 : depth <= cv.CV_32S ? 1.0 / 256.0 : 255.0;
	const shift = depth === cv.CV_8S || depth === cv.CV_16S ? 128.0 : 0.0;
	mat.convertTo(img, cv.CV_8U, scale, shift);

	// convert the img type to cv.CV_8UC4
	switch (img.type()) {
		case cv.CV_8UC1:
			cv.cvtColor(img, img, cv.COLOR_GRAY2RGBA);
			break;
		case cv.CV_8UC3:
			cv.cvtColor(img, img, cv.COLOR_RGB2RGBA);
			break;
		case cv.CV_8UC4:
			break;
		default:
			throw new Error(
				"Bad number of channels (Source image must have 1, 3 or 4 channels)"
			);
	}
	const clampedArray = new ImageData(
		new Uint8ClampedArray(img.data),
		img.cols,
		img.rows
	);
	img.delete();
	return clampedArray;
}

const Room = (props) => {
	const userVideo = useRef();
	let [fps, setFps] = useState(0);
	const partnerVideo = useRef();
	const peerRef = useRef();
	const socketRef = useRef();
	let [letter, setLetter] = useState(null);
	const otherUser = useRef();
	const userStream = useRef();
	const [words, setWords] = useState("");

	const canvasEl = useRef(null);
	const outputCanvasEl = useRef(null);

	useEffect(() => {
		console.log(words);
	}, [words]);

	async function processImage() {
		if (
			partnerVideo !== null &&
			canvasEl !== null &&
			typeof partnerVideo.current !== "undefined" &&
			partnerVideo.current !== null
		) {
			let frames = 0;
			let start = Date.now();
			let prevLetter = "";
			let count = 0;
			let _words = "";

			const processWord = () => {
				let wordsSplit = _words.split(" ");
				fetch(`/api/autocorrect?word=${wordsSplit[wordsSplit.length - 1]}`)
					.then((res) => res.json())
					.then((json) => {
						const correctedWord = json["correctedWord"];
						speechSynthesis.speak(new SpeechSynthesisUtterance(correctedWord));
						wordsSplit.pop();
						_words =
							wordsSplit.join(" ") + " " + correctedWord.toUpperCase() + " ";
						setWords(
							wordsSplit.join(" ") + " " + correctedWord.toUpperCase() + " "
						);
					});
			};

			partnerVideo.current.addEventListener("ended", () => processWord());

			while (true) {
				const ctx = canvasEl.current.getContext("2d");
				ctx.drawImage(partnerVideo.current, 0, 0, maxVideoSize, maxVideoSize);
				const image = ctx.getImageData(0, 0, maxVideoSize, maxVideoSize);
				// Processing image
				const processedImage = await imageProcessing(image);
				// Render the processed image to the canvas
				const ctxOutput = outputCanvasEl.current.getContext("2d");
				ctxOutput.putImageData(processedImage.data.payload, 0, 0);

				const prediction = await predict(processedImage.data.payload);

				const predictedLetter = prediction.data.payload;
				const letterValue = LETTERS[predictedLetter];

				setLetter(letterValue);
				if (letterValue !== prevLetter) {
					if (
						!THRESHOLDS[prevLetter]
							? count > THRESHOLD
							: count > THRESHOLDS[prevLetter]
					) {
						if (prevLetter === "_SPACE") processWord();
						else {
							_words = _words + (prevLetter === "_NOTHING" ? "" : prevLetter);
							setWords(
								(state, props) =>
									state + (prevLetter === "_NOTHING" ? "" : prevLetter)
							);
						}
					}
					count = 0;
				} else {
					count++;
				}
				prevLetter = letterValue;
				frames++;
				if (frames === 10) {
					setFps(10 / ((Date.now() - start) / 1000));
					frames = 0;
					start = Date.now();
				}
			}
		}
	}

	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({ audio: true, video: true })
			.then((stream) => {
				userVideo.current.srcObject = stream;
				userStream.current = stream;
				processImage();
				socketRef.current = io.connect("/");
				socketRef.current.emit("join room", props.match.params.roomID);

				socketRef.current.on("other user", (userID) => {
					callUser(userID);
					otherUser.current = userID;
				});

				socketRef.current.on("user joined", (userID) => {
					otherUser.current = userID;
				});

				socketRef.current.on("offer", handleRecieveCall);

				socketRef.current.on("answer", handleAnswer);

				socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
			});
	}, []);

	function callUser(userID) {
		peerRef.current = createPeer(userID);
		userStream.current
			.getTracks()
			.forEach((track) => peerRef.current.addTrack(track, userStream.current));
	}

	function createPeer(userID) {
		const peer = new RTCPeerConnection({
			iceServers: [
				{
					urls: "stun:stun.stunprotocol.org",
				},
				{
					urls: "turn:numb.viagenie.ca",
					credential: "muazkh",
					username: "webrtc@live.com",
				},
			],
		});

		peer.onicecandidate = handleICECandidateEvent;
		peer.ontrack = handleTrackEvent;
		peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

		return peer;
	}

	function handleNegotiationNeededEvent(userID) {
		peerRef.current
			.createOffer()
			.then((offer) => {
				return peerRef.current.setLocalDescription(offer);
			})
			.then(() => {
				const payload = {
					target: userID,
					caller: socketRef.current.id,
					sdp: peerRef.current.localDescription,
				};
				socketRef.current.emit("offer", payload);
			})
			.catch((e) => console.log(e));
	}

	function handleRecieveCall(incoming) {
		peerRef.current = createPeer();
		const desc = new RTCSessionDescription(incoming.sdp);
		peerRef.current
			.setRemoteDescription(desc)
			.then(() => {
				userStream.current
					.getTracks()
					.forEach((track) =>
						peerRef.current.addTrack(track, userStream.current)
					);
			})
			.then(() => {
				return peerRef.current.createAnswer();
			})
			.then((answer) => {
				return peerRef.current.setLocalDescription(answer);
			})
			.then(() => {
				const payload = {
					target: incoming.caller,
					caller: socketRef.current.id,
					sdp: peerRef.current.localDescription,
				};
				socketRef.current.emit("answer", payload);
			});
	}

	function handleAnswer(message) {
		const desc = new RTCSessionDescription(message.sdp);
		peerRef.current.setRemoteDescription(desc).catch((e) => console.log(e));
	}

	function handleICECandidateEvent(e) {
		if (e.candidate) {
			const payload = {
				target: otherUser.current,
				candidate: e.candidate,
			};
			socketRef.current.emit("ice-candidate", payload);
		}
	}

	function handleNewICECandidateMsg(incoming) {
		const candidate = new RTCIceCandidate(incoming);

		peerRef.current.addIceCandidate(candidate).catch((e) => console.log(e));
	}

	function handleTrackEvent(e) {
		partnerVideo.current.srcObject = e.streams[0];
	}

	return (
		<>
			<canvas
				style={{ display: "none" }}
				ref={canvasEl}
				width={maxVideoSize}
				height={maxVideoSize}
			></canvas>
			<canvas
				className="col-xs-12"
				style={{ display: "none" }}
				ref={outputCanvasEl}
				width={maxVideoSize}
				height={maxVideoSize}
			></canvas>
			<div>
				<video autoPlay ref={userVideo} />
				<video autoPlay ref={partnerVideo} />
			</div>
		</>
	);
};

export default Room;