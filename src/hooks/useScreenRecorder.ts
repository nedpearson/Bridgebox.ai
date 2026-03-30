import { useState, useRef, useCallback, useEffect } from "react";

export type RecordingStatus = "idle" | "recording" | "paused" | "stopped";
export type CaptureOptions = "screen" | "camera" | "audio";

export function useScreenRecorder() {
  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(
    async (captureMode: CaptureOptions = "screen") => {
      try {
        setError(null);
        setMediaBlob(null);
        chunksRef.current = [];
        setElapsedTime(0);

        let videoStream: MediaStream | null = null;
        let micStream: MediaStream | null = null;

        if (captureMode === "screen") {
          videoStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });
          screenStreamRef.current = videoStream;
        } else if (captureMode === "camera") {
          videoStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          screenStreamRef.current = videoStream;
        } else if (captureMode === "audio") {
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          micStreamRef.current = micStream;
        }

        if (captureMode === "screen") {
          try {
            micStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: false,
            });
            micStreamRef.current = micStream;
          } catch (err) {
            console.warn("Microphone access unavailable for screen recording.");
          }
        }

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const dest = audioContext.createMediaStreamDestination();
        const tracks: MediaStreamTrack[] = [];

        if (videoStream) {
          tracks.push(...videoStream.getVideoTracks());
          if (videoStream.getAudioTracks().length > 0) {
            const screenSource =
              audioContext.createMediaStreamSource(videoStream);
            screenSource.connect(dest);
          }
        }

        if (micStream) {
          if (captureMode === "audio") {
            tracks.push(...micStream.getAudioTracks());
          } else {
            const micSource = audioContext.createMediaStreamSource(micStream);
            micSource.connect(dest);
          }
        }

        if (
          captureMode !== "audio" &&
          dest.stream.getAudioTracks().length > 0
        ) {
          tracks.push(...dest.stream.getAudioTracks());
        }

        const combinedStream = new MediaStream(tracks);
        streamRef.current = combinedStream;

        if (videoStream && videoStream.getVideoTracks().length > 0) {
          videoStream.getVideoTracks()[0].onended = () => {
            stopRecording();
          };
        }

        let mimeType = "video/webm";
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
          mimeType = "video/webm;codecs=vp9,opus";
        } else if (
          MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ) {
          mimeType = "video/webm;codecs=vp8,opus";
        }

        const mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType: mimeType,
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          setMediaBlob(blob);
          chunksRef.current = [];

          // Cleanup all tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }

          if (screenStreamRef.current) {
            screenStreamRef.current
              .getTracks()
              .forEach((track) => track.stop());
            screenStreamRef.current = null;
          }

          if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach((track) => track.stop());
            micStreamRef.current = null;
          }

          if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(1000); // chunk every second
        setStatus("recording");
        startTimer();
      } catch (err: any) {
        setError(
          err.message || "Failed to start recording. Please check permissions.",
        );
        setStatus("idle");
      }
    },
    [startTimer],
  );

  const pauseRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause();
      setStatus("paused");
      stopTimer();
    }
  }, [stopTimer]);

  const resumeRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused"
    ) {
      mediaRecorderRef.current.resume();
      setStatus("recording");
      startTimer();
    }
  }, [startTimer]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setStatus("stopped");
      stopTimer();
    }
  }, [stopTimer]);

  const clearBlob = useCallback(() => {
    setMediaBlob(null);
    setStatus("idle");
    setElapsedTime(0);
  }, []);

  // Ensure robust unmount cleanup
  useEffect(() => {
    return () => {
      stopTimer();
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stopTimer]);

  return {
    status,
    error,
    mediaBlob,
    elapsedTime,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearBlob,
  };
}
