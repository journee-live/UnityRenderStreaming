const InputEvent = {
  Keyboard: 0,
  Mouse: 1,
  MouseWheel: 2,
  Touch: 3,
  ButtonClick: 4
};

const KeyboardEventType = {
  Up: 0,
  Down: 1
}

const PointerPhase = {
  None: 0,
  Began: 1,
  Moved: 2,
  Ended: 3,
  Canceled: 4,
  Stationary: 5
}

const Keymap = {
  "Space": 1,
  "Enter": 2,
  "Tab": 3,
  "Backquote": 4,
  "Quote": 5,
  "Semicolon": 6,
  "Comma": 7,
  "Period": 8,
  "Slash": 9,
  "Backslash": 10,
  "LeftBracket": 11,
  "RightBracket": 12,
  "Minus": 13,
  "Equals": 14,
  "KeyA": 15,
  "KeyB": 16,
  "KeyC": 17,
  "KeyD": 18,
  "KeyE": 19,
  "KeyF": 20,
  "KeyG": 21,
  "KeyH": 22,
  "KeyI": 23,
  "KeyJ": 24,
  "KeyK": 25,
  "KeyL": 26,
  "KeyM": 27,
  "KeyN": 28,
  "KeyO": 29,
  "KeyP": 30,
  "KeyQ": 31,
  "KeyR": 32,
  "KeyS": 33,
  "KeyT": 34,
  "KeyU": 35,
  "KeyV": 36,
  "KeyW": 37,
  "KeyX": 38,
  "KeyY": 39,
  "KeyZ": 40,
  "Digit1": 41,
  "Digit2": 42,
  "Digit3": 43,
  "Digit4": 44,
  "Digit5": 45,
  "Digit6": 46,
  "Digit7": 47,
  "Digit8": 48,
  "Digit9": 49,
  "Digit0": 50,
  "ShiftLeft": 51,
  "ShiftRight": 52,
  "AltLeft": 53,
  "AltRight": 54,
  // "AltGr": 54,
  "ControlLeft": 55,
  "ControlRight": 56,
  "MetaLeft": 57,
  "MetaRight": 58,
  // "LeftWindows": 57,
  // "RightWindows": 58,
  // "LeftApple": 57,
  // "RightApple": 58,
  // "LeftCommand": 57,
  // "RightCommand": 58,
  "ContextMenu": 59,
  "Escape": 60,
  "ArrowLeft": 61,
  "ArrowRight": 62,
  "ArrowUp": 63,
  "ArrowDown": 64,
  "Backspace": 65,
  "PageDown": 66,
  "PageUp": 67,
  "Home": 68,
  "End": 69,
  "Insert": 70,
  "Delete": 71,
  "CapsLock": 72,
  "NumLock": 73,
  "PrintScreen": 74,
  "ScrollLock": 75,
  "Pause": 76,
  "NumpadEnter": 77,
  "NumpadDivide": 78,
  "NumpadMultiply": 79,
  "NumpadPlus": 80,
  "NumpadMinus": 81,
  "NumpadPeriod": 82,
  "NumpadEquals": 83,
  "Numpad0": 84,
  "Numpad1": 85,
  "Numpad2": 86,
  "Numpad3": 87,
  "Numpad4": 88,
  "Numpad5": 89,
  "Numpad6": 90,
  "Numpad7": 91,
  "Numpad8": 92,
  "Numpad9": 93,
  "F1": 94,
  "F2": 95,
  "F3": 96,
  "F4": 97,
  "F5": 98,
  "F6": 99,
  "F7": 100,
  "F8": 101,
  "F9": 102,
  "F10": 103,
  "F11": 104,
  "F12": 105,
  // "OEM1": 106,
  // "OEM2": 107,
  // "OEM3": 108,
  // "OEM4": 109,
  // "OEM5": 110,
  // "IMESelected": 111,
}


let isPlayMode = false;

export function registerKeyboardEvents(videoPlayer) {
  const _videoPlayer = videoPlayer;
  document.addEventListener('keyup', sendKeyUp, false);
  document.addEventListener('keydown', sendKeyDown, false);

  function sendKeyUp(e) {
    sendKey(e, KeyboardEventType.Up);
  }

  function sendKeyDown(e) {
    sendKey(e, KeyboardEventType.Down);
  }

  function sendKey(e, type) {
    const key = Keymap[e.code];
    const character = e.key.length == 1 ? e.key.charCodeAt(0) : 0;
    console.log("key down " + key + ", repeat = " + e.repeat + ", character = " + character);
    _videoPlayer && _videoPlayer.sendMsg(new Uint8Array([InputEvent.Keyboard, type, e.repeat, key, character]).buffer);
  }
}

export function registerMouseEvents(videoPlayer, playerElement) {
  const _videoPlayer = videoPlayer;
  const _playerElement = playerElement;
  const _document = document;
  playerElement.requestPointerLock = playerElement.requestPointerLock ||
    playerElement.mozRequestPointerLock || playerElement.webkitRequestPointerLock;

  // Listen to lock state change events
  document.addEventListener('pointerlockchange', pointerLockChange, false);
  document.addEventListener('mozpointerlockchange', pointerLockChange, false);
  document.addEventListener('webkitpointerlockchange', pointerLockChange, false);

  // Listen to mouse events
  playerElement.addEventListener('click', playVideo, false);
  playerElement.addEventListener('mousedown', sendMouse, false);
  playerElement.addEventListener('mouseup', sendMouse, false);
  playerElement.addEventListener('wheel', sendMouseWheel, false);

  // ios workaround for not allowing auto-play

  // Listen to touch events based on "Touch Events Level1" TR.
  //
  // Touch event Level1 https://www.w3.org/TR/touch-events/
  // Touch event Level2 https://w3c.github.io/touch-events/
  //
  playerElement.addEventListener('touchend', playVideoWithTouch, false);
  playerElement.addEventListener('touchstart', sendTouchStart, false);
  playerElement.addEventListener('touchcancel', sendTouchCancel, false);
  playerElement.addEventListener('touchmove', sendTouchMove, false);

  function pointerLockChange() {
    if (_document.pointerLockElement === playerElement ||
      _document.mozPointerLockElement === playerElement ||
      _document.webkitPointerLockElement === playerElement) {
      isPlayMode = false;
      console.log('Pointer locked');

      document.addEventListener('mousemove', sendMouse, false);
    } else {
      console.log('The pointer lock status is now unlocked');
      document.removeEventListener('mousemove', sendMouse, false);
    }
  }

  function playVideo() {
    if (_playerElement.paused) {
      _playerElement.play();
    }
    if (!isPlayMode) {
      _playerElement.requestPointerLock();
      isPlayMode = true;
    }
  }

  function playVideoWithTouch() {
    if (_playerElement.paused) {
      _playerElement.play();
    }
    isPlayMode = true;
    playerElement.removeEventListener('touchend', playVideoWithTouch);
    playerElement.addEventListener('touchend', sendTouchEnd, false);
  }

  function sendTouch(e, phase) {
    const changes = e.changedTouches;
    console.log("touch phase:" + phase + " length:" + changes.length + " pageX" + changes[0].pageX + ", pageX: " + changes[0].pageY + ", force:" + changes[0].force);

    let data = new DataView(new ArrayBuffer(3 + 12 * changes.length));
    data.setUint8(0, InputEvent.Touch);
    data.setUint8(1, phase);
    data.setUint8(2, changes.length);
    let byteOffset = 3;
    for (let i = 0; i < changes.length; i++) {
      data.setInt32(byteOffset, changes[i].identifier, true);
      byteOffset += 4;
      data.setInt16(byteOffset, changes[i].pageX, true);
      byteOffset += 2;
      data.setInt16(byteOffset, changes[i].pageY, true);
      byteOffset += 2;
      data.setFloat32(byteOffset, changes[i].force, true);
      byteOffset += 4;
    }
    _videoPlayer && _videoPlayer.sendMsg(data.buffer);
  }

  function sendTouchMove(e) {
    sendTouch(e, PointerPhase.Moved);
    e.preventDefault();
  }

  function sendTouchStart(e) {
    sendTouch(e, PointerPhase.Began);
    e.preventDefault();
  }

  function sendTouchEnd(e) {
    sendTouch(e, PointerPhase.Ended);
    e.preventDefault();
  }

  function sendTouchCancel(e) {
    sendTouch(e, PointerPhase.Canceled);
    e.preventDefault();
  }

  function sendMouse(e) {
    console.log("deltaX: " + e.movementX + ", deltaY: " + e.movementY + " mouse button:" + e.buttons);
    let data = new DataView(new ArrayBuffer(6));
    data.setUint8(0, InputEvent.Mouse);
    data.setInt16(1, e.movementX, true);
    data.setInt16(3, e.movementY, true);
    data.setUint8(5, e.buttons);
    _videoPlayer && _videoPlayer.sendMsg(data.buffer);
  }

  function sendMouseWheel(e) {
    console.log("mouse wheel with delta " + e.wheelDelta);
    let data = new DataView(new ArrayBuffer(9));
    data.setUint8(0, InputEvent.MouseWheel);
    data.setFloat32(1, e.deltaX, true);
    data.setFloat32(5, e.deltaY, true);
    _videoPlayer && _videoPlayer.sendMsg(data.buffer);
  }
}

export function sendClickEvent(videoPlayer, elementId) {
  let data = new DataView(new ArrayBuffer(3));
  data.setUint8(0, InputEvent.ButtonClick);
  data.setInt16(1, elementId, true);
  videoPlayer && videoPlayer.sendMsg(data.buffer);
}