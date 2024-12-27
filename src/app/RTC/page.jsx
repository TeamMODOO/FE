"use client";
import "./style.css";

import { Mic, MicOff, Phone, PhoneOff, Video } from "lucide-react";
import * as mediasoupClient from "mediasoup-client";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

import ParticipantsList from "./_component/ParticipantsList";

const SERVER_URL = "http://localhost:8080";

function App() {
  const [socket, setSocket] = useState(null);

  const [device, setDevice] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  const [sendTransport, setSendTransport] = useState(null);
  const [recvTransport, setRecvTransport] = useState(null);
  const [videoProducer, setVideoProducer] = useState(null);
  const [audioProducer, setAudioProducer] = useState(null);

  const [roomId, setRoomId] = useState("");
  const [peers, setPeers] = useState([]);

  const [joined, setJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakingStates, setSpeakingStates] = useState({});
  const [localSpeakingState, setLocalSpeakingState] = useState(false);

  const localVideoRef = useRef(null);
  const deviceRef = useRef(null);
  const recvTransportRef = useRef(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);
    newSocket.on("connect", () => {
      console.log("Connected to server:", newSocket.id);
    });

    newSocket.on("new-peer", ({ peerId }) => {
      setPeers((prevPeers) => [...prevPeers, peerId]);
    });

    newSocket.on("peer-left", ({ peerId }) => {
      setPeers((prevPeers) => prevPeers.filter((id) => id !== peerId));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const createDevice = async (rtpCapabilities) => {
    const newDevice = new mediasoupClient.Device();
    await newDevice.load({ routerRtpCapabilities: rtpCapabilities });
    setDevice(newDevice);
    deviceRef.current = newDevice; // deviceRef에 값 할당
    return newDevice;
  };

  const createSendTransport = (device, transportOptions) => {
    console.log(device);
    const newSendTransport = device.createSendTransport(transportOptions);
    newSendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
      try {
        socket.emit("connect-transport", {
          transportId: newSendTransport.id,
          dtlsParameters,
          roomId,
          peerId: socket.id,
        });
        callback();
      } catch (error) {
        errback(error);
      }
    });

    newSendTransport.on(
      "produce",
      ({ kind, rtpParameters }, callback, errback) => {
        try {
          socket.emit(
            "produce",
            {
              transportId: newSendTransport.id,
              kind,
              rtpParameters,
              roomId,
              peerId: socket.id,
            },
            (producerId) => {
              callback({ id: producerId });
            },
          );
        } catch (error) {
          errback(error);
        }
      },
    );
    setSendTransport(newSendTransport);
    return newSendTransport;
  };

  const createRecvTransport = (device, transportOptions) => {
    const newRecvTransport = device.createRecvTransport(transportOptions);
    newRecvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
      try {
        socket.emit("connect-transport", {
          transportId: newRecvTransport.id,
          dtlsParameters,
          roomId,
          peerId: socket.id,
        });
        callback();
      } catch (error) {
        errback(error);
      }
    });
    setRecvTransport(newRecvTransport);
    recvTransportRef.current = newRecvTransport;
    return newRecvTransport;
  };

  const getLocalAudioStreamAndTrack = async () => {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const audioTrack = audioStream.getAudioTracks()[0];
    return audioTrack;
  };

  const joinRoom = () => {
    if (!socket || !roomId) return;

    if (window.confirm("방에 참여하시겠습니까?")) {
      socket.emit(
        "join-room",
        { roomId, peerId: socket.id },
        async (response) => {
          if (response.error) {
            console.error("Error joining room:", response.error);
            return;
          }

          const {
            sendTransportOptions,
            recvTransportOptions,
            rtpCapabilities,
            peerIds,
            existingProducers,
          } = response;

          // Device 생성 및 로드
          const newDevice = await createDevice(rtpCapabilities);

          // 송신용 Transport 생성
          const newSendTransport = createSendTransport(
            newDevice,
            sendTransportOptions,
          );

          // 수신용 Transport 생성
          const newRecvTransport = createRecvTransport(
            newDevice,
            recvTransportOptions,
          );

          socket.on("new-producer", handleNewProducer);

          // 오디오 스트림 캡처 및 Producer 생성
          const audioTrack = await getLocalAudioStreamAndTrack();
          const newAudioProducer = await newSendTransport.produce({
            track: audioTrack,
          });

          setAudioProducer(newAudioProducer);

          // 기존 참여자 목록 업데이트
          setPeers(peerIds.filter((id) => id !== socket.id));

          // 기존 Producer들에 대한 Consumer 생성
          for (const producerInfo of existingProducers) {
            await consume(producerInfo);
          }

          setJoined(true);
        },
      );
    }
  };

  const leaveRoom = () => {
    if (!socket) return;

    socket.emit("leave-room", (response) => {
      if (response && response.error) {
        console.error("Error leaving room:", response.error);
        return;
      }
      // 로컬 상태 초기화
      setJoined(false);
      setPeers([]);
      // 리소스 정리
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      if (sendTransport) {
        sendTransport.close();
        setSendTransport(null);
      }
      if (recvTransport) {
        recvTransport.close();
        setRecvTransport(null);
      }
      if (device) {
        setDevice(null);
      }
      // 이벤트 리스너 제거
      socket.off("new-producer", handleNewProducer);
    });
  };

  const handleNewProducer = async ({ producerId, peerId, kind }) => {
    await consume({ producerId, peerId, kind });
  };

  const consume = async ({ producerId, peerId, kind }) => {
    const device = deviceRef.current;
    const recvTransport = recvTransportRef.current;
    if (!device || !recvTransport) {
      console.log("Device or RecvTransport not initialized");
      return;
    }

    socket.emit(
      "consume",
      {
        transportId: recvTransport.id,
        producerId,
        roomId,
        peerId: socket.id,
        rtpCapabilities: device.rtpCapabilities,
      },
      async (response) => {
        if (response.error) {
          console.error("Error consuming:", response.error);
          return;
        }

        const { consumerData } = response;

        const consumer = await recvTransport.consume({
          id: consumerData.id,
          producerId: consumerData.producerId,
          kind: consumerData.kind,
          rtpParameters: consumerData.rtpParameters,
        });

        await consumer.resume();

        const remoteStream = new MediaStream();
        remoteStream.addTrack(consumer.track);
        if (consumer.kind === "audio") {
          // 오디오 요소 생성 및 숨김 처리
          const audioElement = document.createElement("audio");
          audioElement.srcObject = remoteStream;
          audioElement.autoplay = true;
          audioElement.style.visibility = "hidden";
          document.getElementById("remote-media").appendChild(audioElement);

          // 오디오 시각화 설정
          const audioContext = new AudioContext();
          const source = audioContext.createMediaStreamSource(remoteStream);
          const analyzer = audioContext.createAnalyser();
          source.connect(analyzer);

          // 오디오 레벨 업데이트
          const updateAudioLevel = () => {
            const dataArray = new Uint8Array(analyzer.frequencyBinCount);
            analyzer.getByteFrequencyData(dataArray);
            const volume =
              dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;

            // console.log(volume);

            const isSpeaking = volume > 10;
            setLocalSpeakingState(isSpeaking);
            setSpeakingStates((prev) => ({
              ...prev,
              [peerId]: isSpeaking,
            }));

            requestAnimationFrame(updateAudioLevel);
          };
          updateAudioLevel();

          try {
            await audioElement.play();
          } catch (err) {
            console.error("Audio playback failed:", err);
          }
        }
      },
    );
  };

  // 카메라 시작
  const startCamera = async () => {
    if (!sendTransport) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    setLocalStream(stream);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    const videoTrack = stream.getVideoTracks()[0];

    // 비디오 Producer 생성
    const newVideoProducer = await sendTransport.produce({ track: videoTrack });
    setVideoProducer(newVideoProducer);
  };
  // 카메라 중지
  const stopCamera = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (videoProducer) {
      videoProducer.close();
      setVideoProducer(null);
    }
    if (audioProducer) {
      audioProducer.close();
      setAudioProducer(null);
    }
  };

  // 마이크 토글 함수 추가
  const toggleMicrophone = async () => {
    if (!audioProducer) return;

    if (isMuted) {
      // 음소거 해제
      await audioProducer.resume();
      setIsMuted(false);
    } else {
      // 음소거
      await audioProducer.pause();
      setIsMuted(true);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <div className="card header-card">
          <h1 className="title">Mediasoup Demo</h1>
          <div className="header-info">
            <p className="header-text">
              My ID:
              <span className="mono-text">
                {socket ? socket.id : "Not connected"}
              </span>
            </p>
            <p className="header-text">
              Room: <span className="mono-text">{roomId ? roomId : "-"}</span>
            </p>
          </div>

          {!joined ? (
            <div className="join-container">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="input-room"
              />
              <button onClick={joinRoom} className="btn btn--primary">
                <Phone className="btn__icon" />
                Join Room
              </button>
            </div>
          ) : (
            <div className="control-buttons">
              <button onClick={leaveRoom} className="btn btn--danger">
                <PhoneOff className="btn__icon" />
                Leave Room
              </button>
              <button
                onClick={toggleMicrophone}
                className={`btn ${isMuted ? "btn--warning" : "btn--primary"}`}
              >
                {isMuted ? (
                  <>
                    <MicOff className="btn__icon" />
                    Unmute
                  </>
                ) : (
                  <>
                    <Mic className="btn__icon" />
                    Mute
                  </>
                )}
              </button>

              <button
                onClick={localStream ? stopCamera : startCamera}
                className={`btn ${
                  localStream ? "btn--secondary" : "btn--primary"
                }`}
              >
                <Video className="btn__icon" />
                {localStream ? "Stop Camera" : "Start Camera"}
              </button>
              {/* <button
                onClick={screenProducer ? stopScreenShare : startScreenShare}
                className={`btn ${
                  screenProducer ? 'btn--secondary' : 'btn--primary'
                }`}
              >
                <Monitor className='btn__icon' />
                {screenProducer ? 'Stop Screen Share' : 'Start Screen Share'}
              </button> */}
            </div>
          )}
        </div>

        {joined && (
          <div className="grid">
            <div className="card">
              <h2 className="card__title">Local Video</h2>
              <div className="video-container">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="video"
                ></video>
                {!localStream && (
                  <div className="video-placeholder">
                    <Video className="video-placeholder__icon" />
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="card__title">Participants ({peers.length + 1})</h2>
              <ParticipantsList
                socket={socket}
                peers={peers}
                isMuted={isMuted}
                speakingStates={speakingStates}
              />
            </div>

            <div id="remote-media" className="remote-grid"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
