// Real WebRTC P2P implementation with Socket.IO

let localStream = null;
let peerConnection = null;
let currentRole = null;
let currentSessionId = null;
let socket = null;
let isMuted = false;
let isCameraOff = false;
let isAiDoctorSession = false;
let aiAudioElement = null;
let aiAudioListenerAttached = false;
let patientAudioRecorder = null;
let patientAudioSendingActive = false;
let aiIsSpeaking = false;

let aiAudioQueue = [];
let aiAudioPlaying = false;

const PATIENT_AUDIO_CHUNK_MS = 6000;

const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

function getTokenFromURL() {
  return new URLSearchParams(window.location.search).get('token');
}

function decodeJWT(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error('Invalid token', e);
    return null;
  }
}

function getAiConsultationFromURL() {
  const v = new URLSearchParams(window.location.search).get('aiConsultation');
  return v === 'true' || v === '1';
}

function displayAiAvatar(placement) {
  const container = document.getElementById('videoContainer');
  const existing = container.querySelector('.ai-avatar-placeholder');
  if (existing) existing.remove();

  const isRemote = placement === 'remote';
  const wrapper = document.createElement('div');
  wrapper.className = 'video-participant ai-avatar-placeholder ' + (isRemote ? 'remote' : 'local');
  wrapper.innerHTML = `
    <div class="ai-avatar">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1c2.76 0 5 2.24 5 5v1h1c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1h-1v1c0 2.76-2.24 5-5 5h-2c-2.76 0-5-2.24-5-5v-1H4c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1h1v-1c0-2.76 2.24-5 5-5h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" fill="currentColor"/>
        <circle cx="9" cy="13" r="1.5" fill="var(--background)"/>
        <circle cx="15" cy="13" r="1.5" fill="var(--background)"/>
      </svg>
    </div>
    <div class="participant-info">
      <div class="participant-name">${isRemote ? 'AI Doctor' : 'You (AI)'}</div>
      <div class="participant-role">${isRemote ? 'Listening...' : 'Connected'}</div>
    </div>
  `;
  if (isRemote) {
    wrapper.id = 'remoteVideoContainer';
    const first = container.querySelector('.local') || container.firstElementChild;
    if (first) container.insertBefore(wrapper, first);
    else container.appendChild(wrapper);
  } else {
    container.insertBefore(wrapper, container.firstElementChild);
  }
}

// Autoplay unlock
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const buf = ctx.createBuffer(1, 1, 22050);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  src.start(0);
  ctx.close();
  const overlay = document.getElementById('audioUnlockOverlay');
  if (overlay) overlay.remove();
  drainAiAudioQueue();
}

function showAudioUnlockOverlay() {
  if (document.getElementById('audioUnlockOverlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'audioUnlockOverlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: rgba(5,5,5,0.85);
    backdrop-filter: blur(12px);
    cursor: pointer;
  `;
  overlay.innerHTML = `
    <div style="text-align:center; padding: 2.5rem; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; max-width: 360px;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🎙️</div>
      <h2 style="font-family: 'Syne', sans-serif; font-size: 1.5rem; margin-bottom: 0.75rem; color: #fff;">
        Ready to connect?
      </h2>
      <p style="color: #a1a1aa; font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.6;">
        Click below to start your session with the AI Doctor. This also enables audio playback.
      </p>
      <button style="background: #3b4bf8; color: white; border: none; border-radius: 12px;
        padding: 0.875rem 2rem; font-size: 1rem; font-weight: 600; cursor: pointer;
        font-family: 'Inter', sans-serif; width: 100%;">
        Start Session
      </button>
    </div>
  `;
  overlay.addEventListener('click', unlockAudio, { once: true });
  document.body.appendChild(overlay);
}

document.addEventListener('click', unlockAudio, { once: true });
document.addEventListener('touchstart', unlockAudio, { once: true });

function updateAiStatus(text) {
  const avatarRole = document.querySelector('.ai-avatar-placeholder.remote .participant-role');
  if (avatarRole) avatarRole.textContent = text;
}

function releaseMic() {
  aiIsSpeaking = false;
  aiAudioPlaying = false;
  updateAiStatus('Listening...');
  showStatus('Speak now — the AI will respond in a few seconds.');
  console.log('[AI Audio] Mic released');
}

function drainAiAudioQueue() {
  if (aiAudioPlaying || aiAudioQueue.length === 0 || !audioUnlocked) return;
  const url = aiAudioQueue.shift();
  aiAudioPlaying = true;
  aiIsSpeaking = true;

  updateAiStatus('Speaking...');
  showStatus('AI is speaking...');

  if (!aiAudioElement) {
    aiAudioElement = new Audio();
    document.body.appendChild(aiAudioElement);
  }

  // Safety timeout — force release mic after 30 seconds no matter what
  const safetyTimer = setTimeout(() => {
    console.warn('[AI Audio] Safety timeout — force releasing mic');
    releaseMic();
    drainAiAudioQueue();
  }, 30000);

  aiAudioElement.src = url;
  aiAudioElement.play()
    .then(() => console.log('[AI Audio] Playing chunk'))
    .catch((e) => {
      clearTimeout(safetyTimer);
      console.warn('[AI Audio] play() failed:', e.message);
      URL.revokeObjectURL(url);
      releaseMic();
      drainAiAudioQueue();
    });

  aiAudioElement.onended = () => {
    clearTimeout(safetyTimer);
    URL.revokeObjectURL(url);
    aiAudioPlaying = false;
    if (aiAudioQueue.length > 0) {
      drainAiAudioQueue();
    } else {
      // Increased to 1500ms to let room echo fully die down
      setTimeout(() => releaseMic(), 1500);
    }
  };

  aiAudioElement.onerror = () => {
    clearTimeout(safetyTimer);
    console.warn('[AI Audio] Error playing audio');
    URL.revokeObjectURL(url);
    releaseMic();
    drainAiAudioQueue();
  };
}

function setupAiAudioListener() {
  if (aiAudioListenerAttached || !socket) return;
  aiAudioListenerAttached = true;

  socket.on('ai-audio', (audioBase64) => {
    if (!audioBase64) return;
    try {
      const binaryStr = atob(audioBase64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      aiAudioQueue.push(url);
      console.log('[AI Audio] Queued chunk, queue length:', aiAudioQueue.length);
      drainAiAudioQueue();
    } catch (e) {
      console.error('[AI Audio] decode error:', e);
    }
  });
}

// Safe base64 encode for large buffers
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

// Patient audio sender
function startPatientAudioSend() {
  if (!isAiDoctorSession || !localStream || !socket || !socket.connected) return;
  if (localStream.getAudioTracks().length === 0) return;
  if (patientAudioSendingActive) return;

  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm';

  function scheduleChunk() {
    if (!patientAudioSendingActive || !localStream || !socket || !socket.connected) return;

    if (aiIsSpeaking) {
      console.log('[Patient Audio] AI speaking — skipping this chunk');
      setTimeout(scheduleChunk, 500);
      return;
    }

    const stream = new MediaStream(localStream.getAudioTracks());
    const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 });

    recorder.ondataavailable = (e) => {
      if (e.data.size === 0 || isMuted || aiIsSpeaking) return;
      // Skip very small chunks — likely silence or echo after AI finishes speaking
      if (e.data.size < 8000) {
        console.log('[Patient Audio] Chunk too small, likely silence — skipping');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (aiIsSpeaking) return;
        const base64 = arrayBufferToBase64(reader.result);
        socket.emit('patient-audio', { audio: base64 });
        console.log('[Patient Audio] Sent chunk, size:', e.data.size, 'bytes');
      };
      reader.readAsArrayBuffer(e.data);
    };

    recorder.onstop = () => {
      patientAudioRecorder = null;
      if (patientAudioSendingActive) setTimeout(scheduleChunk, 100);
    };

    patientAudioRecorder = recorder;
    recorder.start();
    setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop();
    }, PATIENT_AUDIO_CHUNK_MS);
  }

  try {
    patientAudioSendingActive = true;
    scheduleChunk();
    showStatus('Speak now — the AI will respond in a few seconds.');
    console.log('[AI Session] Sending audio every', PATIENT_AUDIO_CHUNK_MS / 1000, 's');
  } catch (e) {
    console.error('Failed to start patient audio send', e);
  }
}

function stopPatientAudioSend() {
  patientAudioSendingActive = false;
  if (patientAudioRecorder && patientAudioRecorder.state !== 'inactive') {
    patientAudioRecorder.stop();
    patientAudioRecorder = null;
  }
}

// Main init
async function initializeCall() {
  const token = getTokenFromURL();
  if (!token) return showError('No token found');

  const payload = decodeJWT(token);
  if (!payload) return showError('Invalid token');

  currentRole = payload.role;
  currentSessionId = payload.sessionId;
  isAiDoctorSession = currentRole === 'ai-doctor' || getAiConsultationFromURL();

  const sessionInfoEl = document.getElementById('sessionInfo');
  if (sessionInfoEl) {
    sessionInfoEl.textContent = `Session: ${currentSessionId.substr(0, 8)}... | Role: ${currentRole}${isAiDoctorSession ? ' (AI)' : ''}`;
  }

  if (currentRole === 'ai-doctor') {
    updateStatus('Connecting...');
    displayAiAvatar('local');
    socket = io();
    socket.on('connect', () => {
      updateStatus('Connected');
      socket.emit('join-room', currentSessionId, currentRole);
      setupAiAudioListener();
    });
    document.getElementById('toggleMic')?.setAttribute('disabled', 'true');
    document.getElementById('toggleCamera')?.setAttribute('disabled', 'true');
    return;
  }

  updateStatus('Requesting Media Access...');

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true
    });

    displayLocalVideo(localStream);

    if (isAiDoctorSession) {
      displayAiAvatar('remote');
      showAudioUnlockOverlay();
    }

    updateStatus('Connecting to Server...');
    socket = io();

    socket.on('connect', () => {
      updateStatus('Connected to Signaling Server');
      console.log('Socket connected:', socket.id);
      socket.emit('join-room', currentSessionId, currentRole);
      if (isAiDoctorSession) {
        setupAiAudioListener();
        startPatientAudioSend();
      }
    });

    socket.on('user-connected', (userId) => {
      console.log('User connected:', userId);
      if (isAiDoctorSession && typeof userId === 'string' && userId.startsWith('ai-doctor')) {
        showStatus('AI Doctor is here. You can speak.');
        return;
      }
      showStatus('Peer joined. Connecting...');
      createPeerConnection();
      createOffer();
    });

    socket.on('signal', async (data) => {
      const { type, sdp, candidate } = data;
      if (isAiDoctorSession && !peerConnection) return;
      if (!peerConnection) createPeerConnection();

      if (type === 'offer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        createAnswer();
      } else if (type === 'answer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      } else if (candidate) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ICE candidate', e);
        }
      }
    });

  } catch (err) {
    console.error(err);
    showError('Media Access Denied or Error: ' + err.message);
  }
}

// WebRTC
function createPeerConnection() {
  if (peerConnection) return;
  peerConnection = new RTCPeerConnection(rtcConfig);

  if (localStream) {
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
  }

  peerConnection.ontrack = (event) => {
    const [remoteStream] = event.streams;
    displayRemoteVideo(remoteStream);
    showStatus('Connected');
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('signal', { room: currentSessionId, candidate: event.candidate });
    }
  };

  peerConnection.onconnectionstatechange = () => {
    const state = peerConnection.connectionState;
    updateStatus(state.charAt(0).toUpperCase() + state.slice(1));
    if (state === 'disconnected' || state === 'failed') {
      document.getElementById('remoteVideoContainer').innerHTML = '';
      showStatus('Peer disconnected');
      peerConnection.close();
      peerConnection = null;
    }
  };
}

async function createOffer() {
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('signal', { room: currentSessionId, type: 'offer', sdp: offer });
  } catch (err) {
    console.error('Error creating offer', err);
  }
}

async function createAnswer() {
  try {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('signal', { room: currentSessionId, type: 'answer', sdp: answer });
  } catch (err) {
    console.error('Error creating answer', err);
  }
}

// UI helpers
function displayLocalVideo(stream) {
  const container = document.getElementById('videoContainer');
  const existingLocal = container.querySelector('.local');
  if (existingLocal) existingLocal.remove();

  const wrapper = document.createElement('div');
  wrapper.className = 'video-participant local';
  wrapper.innerHTML = `
    <video autoplay playsinline muted></video>
    <div class="participant-info">
      <div class="participant-name">You</div>
    </div>
  `;
  wrapper.querySelector('video').srcObject = stream;
  container.appendChild(wrapper);

  if (!document.getElementById('remoteVideoContainer')) {
    const remoteWrapper = document.createElement('div');
    remoteWrapper.id = 'remoteVideoContainer';
    remoteWrapper.className = 'video-participant remote';
    remoteWrapper.style.display = 'none';
    container.insertBefore(remoteWrapper, wrapper);
  }
}

function displayRemoteVideo(stream) {
  const container = document.getElementById('videoContainer');
  let wrapper = document.getElementById('remoteVideoContainer');

  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'remoteVideoContainer';
    wrapper.className = 'video-participant remote';
    container.insertBefore(wrapper, container.querySelector('.local'));
  }

  wrapper.style.display = 'block';
  wrapper.innerHTML = `
    <video autoplay playsinline></video>
    <div class="participant-info">
      <div class="participant-name">Remote Peer</div>
      <div class="participant-role">Connected</div>
    </div>
  `;
  wrapper.querySelector('video').srcObject = stream;
}

function updateStatus(msg) {
  const el = document.getElementById('connectionStatus');
  if (el) el.textContent = msg;
}

function showStatus(msg) {
  const el = document.getElementById('statusMessage');
  if (el) {
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
  }
}

function showError(msg) {
  alert(msg);
}

// Controls
document.getElementById('toggleMic')?.addEventListener('click', (e) => {
  isMuted = !isMuted;
  if (localStream) localStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
  e.currentTarget.innerHTML = `<span>🎤</span> ${isMuted ? 'Unmute' : 'Mute'}`;
});

document.getElementById('toggleCamera')?.addEventListener('click', (e) => {
  isCameraOff = !isCameraOff;
  if (localStream) localStream.getVideoTracks().forEach(t => t.enabled = !isCameraOff);
  e.currentTarget.innerHTML = `<span>📹</span> ${isCameraOff ? 'Camera On' : 'Camera Off'}`;
});

document.getElementById('leaveCall')?.addEventListener('click', () => {
  stopPatientAudioSend();
  if (confirm('Leave call?')) window.close();
});

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCall);
} else {
  initializeCall();
}