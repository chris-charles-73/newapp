/**
 * App version: 1.0.0
 * SDK version: 4.4.0
 * CLI version: 2.5.0
 * 
 * Generated: Mon, 28 Jun 2021 08:09:18 GMT
 */

var APP_com_metrological_app_newapp = (function () {
  'use strict';

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const settings = {};
  const subscribers = {};

  const initSettings = (appSettings, platformSettings) => {
    settings['app'] = appSettings;
    settings['platform'] = platformSettings;
    settings['user'] = {};
  };

  const publish = (key, value) => {
    subscribers[key] && subscribers[key].forEach(subscriber => subscriber(value));
  };

  const dotGrab = (obj = {}, key) => {
    if (obj === null) return undefined
    const keys = key.split('.');
    for (let i = 0; i < keys.length; i++) {
      obj = obj[keys[i]] = obj[keys[i]] !== undefined ? obj[keys[i]] : {};
    }
    return typeof obj === 'object' && obj !== null ? (Object.keys(obj).length ? obj : undefined) : obj
  };

  var Settings = {
    get(type, key, fallback = undefined) {
      const val = dotGrab(settings[type], key);
      return val !== undefined ? val : fallback
    },
    has(type, key) {
      return !!this.get(type, key)
    },
    set(key, value) {
      settings['user'][key] = value;
      publish(key, value);
    },
    subscribe(key, callback) {
      subscribers[key] = subscribers[key] || [];
      subscribers[key].push(callback);
    },
    unsubscribe(key, callback) {
      if (callback) {
        const index = subscribers[key] && subscribers[key].findIndex(cb => cb === callback);
        index > -1 && subscribers[key].splice(index, 1);
      } else {
        if (key in subscribers) {
          subscribers[key] = [];
        }
      }
    },
    clearSubscribers() {
      for (const key of Object.getOwnPropertyNames(subscribers)) {
        delete subscribers[key];
      }
    },
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const prepLog = (type, args) => {
    const colors = {
      Info: 'green',
      Debug: 'gray',
      Warn: 'orange',
      Error: 'red',
    };

    args = Array.from(args);
    return [
      '%c' + (args.length > 1 && typeof args[0] === 'string' ? args.shift() : type),
      'background-color: ' + colors[type] + '; color: white; padding: 2px 4px; border-radius: 2px',
      args,
    ]
  };

  var Log = {
    info() {
      Settings.get('platform', 'log') && console.log.apply(console, prepLog('Info', arguments));
    },
    debug() {
      Settings.get('platform', 'log') && console.debug.apply(console, prepLog('Debug', arguments));
    },
    error() {
      Settings.get('platform', 'log') && console.error.apply(console, prepLog('Error', arguments));
    },
    warn() {
      Settings.get('platform', 'log') && console.warn.apply(console, prepLog('Warn', arguments));
    },
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let sendMetric = (type, event, params) => {
    Log.info('Sending metric', type, event, params);
  };

  const initMetrics = config => {
    sendMetric = config.sendMetric;
  };

  // available metric per category
  const metrics$1 = {
    app: ['launch', 'loaded', 'ready', 'close'],
    page: ['view', 'leave'],
    user: ['click', 'input'],
    media: [
      'abort',
      'canplay',
      'ended',
      'pause',
      'play',
      // with some videos there occur almost constant suspend events ... should investigate
      // 'suspend',
      'volumechange',
      'waiting',
      'seeking',
      'seeked',
    ],
  };

  // error metric function (added to each category)
  const errorMetric = (type, message, code, visible, params = {}) => {
    params = { params, ...{ message, code, visible } };
    sendMetric(type, 'error', params);
  };

  const Metric = (type, events, options = {}) => {
    return events.reduce(
      (obj, event) => {
        obj[event] = (name, params = {}) => {
          params = { ...options, ...(name ? { name } : {}), ...params };
          sendMetric(type, event, params);
        };
        return obj
      },
      {
        error(message, code, params) {
          errorMetric(type, message, code, params);
        },
        event(name, params) {
          sendMetric(type, name, params);
        },
      }
    )
  };

  const Metrics = types => {
    return Object.keys(types).reduce(
      (obj, type) => {
        // media metric works a bit different!
        // it's a function that accepts a url and returns an object with the available metrics
        // url is automatically passed as a param in every metric
        type === 'media'
          ? (obj[type] = url => Metric(type, types[type], { url }))
          : (obj[type] = Metric(type, types[type]));
        return obj
      },
      { error: errorMetric, event: sendMetric }
    )
  };

  var Metrics$1 = Metrics(metrics$1);

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  var events$1 = {
    abort: 'Abort',
    canplay: 'CanPlay',
    canplaythrough: 'CanPlayThrough',
    durationchange: 'DurationChange',
    emptied: 'Emptied',
    encrypted: 'Encrypted',
    ended: 'Ended',
    error: 'Error',
    interruptbegin: 'InterruptBegin',
    interruptend: 'InterruptEnd',
    loadeddata: 'LoadedData',
    loadedmetadata: 'LoadedMetadata',
    loadstart: 'LoadStart',
    pause: 'Pause',
    play: 'Play',
    playing: 'Playing',
    progress: 'Progress',
    ratechange: 'Ratechange',
    seeked: 'Seeked',
    seeking: 'Seeking',
    stalled: 'Stalled',
    // suspend: 'Suspend', // this one is called a looooot for some videos
    timeupdate: 'TimeUpdate',
    volumechange: 'VolumeChange',
    waiting: 'Waiting',
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  var autoSetupMixin = (sourceObject, setup = () => {}) => {
    let ready = false;

    const doSetup = () => {
      if (ready === false) {
        setup();
        ready = true;
      }
    };

    return Object.keys(sourceObject).reduce((obj, key) => {
      if (typeof sourceObject[key] === 'function') {
        obj[key] = function() {
          doSetup();
          return sourceObject[key].apply(sourceObject, arguments)
        };
      } else if (typeof Object.getOwnPropertyDescriptor(sourceObject, key).get === 'function') {
        obj.__defineGetter__(key, function() {
          doSetup();
          return Object.getOwnPropertyDescriptor(sourceObject, key).get.apply(sourceObject)
        });
      } else if (typeof Object.getOwnPropertyDescriptor(sourceObject, key).set === 'function') {
        obj.__defineSetter__(key, function() {
          doSetup();
          return Object.getOwnPropertyDescriptor(sourceObject, key).set.sourceObject[key].apply(
            sourceObject,
            arguments
          )
        });
      } else {
        obj[key] = sourceObject[key];
      }
      return obj
    }, {})
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let timeout = null;

  var easeExecution = (cb, delay) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb();
    }, delay);
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let basePath;
  let proxyUrl;

  const initUtils = config => {
    basePath = ensureUrlWithProtocol(makeFullStaticPath(window.location.pathname, config.path || '/'));

    if (config.proxyUrl) {
      proxyUrl = ensureUrlWithProtocol(config.proxyUrl);
    }
  };

  var Utils = {
    asset(relPath) {
      return basePath + relPath
    },
    proxyUrl(url, options = {}) {
      return proxyUrl ? proxyUrl + '?' + makeQueryString(url, options) : url
    },
    makeQueryString() {
      return makeQueryString(...arguments)
    },
    // since imageworkers don't work without protocol
    ensureUrlWithProtocol() {
      return ensureUrlWithProtocol(...arguments)
    },
  };

  const ensureUrlWithProtocol = url => {
    if (/^\/\//.test(url)) {
      return window.location.protocol + url
    }
    if (!/^(?:https?:)/i.test(url)) {
      return window.location.origin + url
    }
    return url
  };

  const makeFullStaticPath = (pathname = '/', path) => {
    // ensure path has traling slash
    path = path.charAt(path.length - 1) !== '/' ? path + '/' : path;

    // if path is URL, we assume it's already the full static path, so we just return it
    if (/^(?:https?:)?(?:\/\/)/.test(path)) {
      return path
    }

    if (path.charAt(0) === '/') {
      return path
    } else {
      // cleanup the pathname (i.e. remove possible index.html)
      pathname = cleanUpPathName(pathname);

      // remove possible leading dot from path
      path = path.charAt(0) === '.' ? path.substr(1) : path;
      // ensure path has leading slash
      path = path.charAt(0) !== '/' ? '/' + path : path;
      return pathname + path
    }
  };

  const cleanUpPathName = pathname => {
    if (pathname.slice(-1) === '/') return pathname.slice(0, -1)
    const parts = pathname.split('/');
    if (parts[parts.length - 1].indexOf('.') > -1) parts.pop();
    return parts.join('/')
  };

  const makeQueryString = (url, options = {}, type = 'url') => {
    // add operator as an option
    options.operator = 'metrological'; // Todo: make this configurable (via url?)
    // add type (= url or qr) as an option, with url as the value
    options[type] = url;

    return Object.keys(options)
      .map(key => {
        return encodeURIComponent(key) + '=' + encodeURIComponent('' + options[key])
      })
      .join('&')
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const initProfile = config => {
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  var lng = window.lng;

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const events = [
    'timeupdate',
    'error',
    'ended',
    'loadeddata',
    'canplay',
    'play',
    'playing',
    'pause',
    'loadstart',
    'seeking',
    'seeked',
    'encrypted',
  ];

  let mediaUrl$1 = url => url;

  const initMediaPlayer = config => {
    if (config.mediaUrl) {
      mediaUrl$1 = config.mediaUrl;
    }
  };

  class Mediaplayer extends lng.Component {
    _construct() {
      this._skipRenderToTexture = false;
      this._metrics = null;
      this._textureMode = Settings.get('platform', 'textureMode') || false;
      Log.info('Texture mode: ' + this._textureMode);
      console.warn(
        [
          "The 'MediaPlayer'-plugin in the Lightning-SDK is deprecated and will be removed in future releases.",
          "Please consider using the new 'VideoPlayer'-plugin instead.",
          'https://rdkcentral.github.io/Lightning-SDK/#/plugins/videoplayer',
        ].join('\n\n')
      );
    }

    static _template() {
      return {
        Video: {
          VideoWrap: {
            VideoTexture: {
              visible: false,
              pivot: 0.5,
              texture: { type: lng.textures.StaticTexture, options: {} },
            },
          },
        },
      }
    }

    set skipRenderToTexture(v) {
      this._skipRenderToTexture = v;
    }

    get textureMode() {
      return this._textureMode
    }

    get videoView() {
      return this.tag('Video')
    }

    _init() {
      //re-use videotag if already there
      const videoEls = document.getElementsByTagName('video');
      if (videoEls && videoEls.length > 0) this.videoEl = videoEls[0];
      else {
        this.videoEl = document.createElement('video');
        this.videoEl.setAttribute('id', 'video-player');
        this.videoEl.style.position = 'absolute';
        this.videoEl.style.zIndex = '1';
        this.videoEl.style.display = 'none';
        this.videoEl.setAttribute('width', '100%');
        this.videoEl.setAttribute('height', '100%');

        this.videoEl.style.visibility = this.textureMode ? 'hidden' : 'visible';
        document.body.appendChild(this.videoEl);
      }
      if (this.textureMode && !this._skipRenderToTexture) {
        this._createVideoTexture();
      }

      this.eventHandlers = [];
    }

    _registerListeners() {
      events.forEach(event => {
        const handler = e => {
          if (this._metrics && this._metrics[event] && typeof this._metrics[event] === 'function') {
            this._metrics[event]({ currentTime: this.videoEl.currentTime });
          }
          this.fire(event, { videoElement: this.videoEl, event: e });
        };
        this.eventHandlers.push(handler);
        this.videoEl.addEventListener(event, handler);
      });
    }

    _deregisterListeners() {
      Log.info('Deregistering event listeners MediaPlayer');
      events.forEach((event, index) => {
        this.videoEl.removeEventListener(event, this.eventHandlers[index]);
      });
      this.eventHandlers = [];
    }

    _attach() {
      this._registerListeners();
    }

    _detach() {
      this._deregisterListeners();
      this.close();
    }

    _createVideoTexture() {
      const stage = this.stage;

      const gl = stage.gl;
      const glTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      this.videoTexture.options = { source: glTexture, w: this.videoEl.width, h: this.videoEl.height };
    }

    _startUpdatingVideoTexture() {
      if (this.textureMode && !this._skipRenderToTexture) {
        const stage = this.stage;
        if (!this._updateVideoTexture) {
          this._updateVideoTexture = () => {
            if (this.videoTexture.options.source && this.videoEl.videoWidth && this.active) {
              const gl = stage.gl;

              const currentTime = new Date().getTime();

              // When BR2_PACKAGE_GST1_PLUGINS_BAD_PLUGIN_DEBUGUTILS is not set in WPE, webkitDecodedFrameCount will not be available.
              // We'll fallback to fixed 30fps in this case.
              const frameCount = this.videoEl.webkitDecodedFrameCount;

              const mustUpdate = frameCount
                ? this._lastFrame !== frameCount
                : this._lastTime < currentTime - 30;

              if (mustUpdate) {
                this._lastTime = currentTime;
                this._lastFrame = frameCount;
                try {
                  gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
                  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
                  this._lastFrame = this.videoEl.webkitDecodedFrameCount;
                  this.videoTextureView.visible = true;

                  this.videoTexture.options.w = this.videoEl.videoWidth;
                  this.videoTexture.options.h = this.videoEl.videoHeight;
                  const expectedAspectRatio = this.videoTextureView.w / this.videoTextureView.h;
                  const realAspectRatio = this.videoEl.videoWidth / this.videoEl.videoHeight;
                  if (expectedAspectRatio > realAspectRatio) {
                    this.videoTextureView.scaleX = realAspectRatio / expectedAspectRatio;
                    this.videoTextureView.scaleY = 1;
                  } else {
                    this.videoTextureView.scaleY = expectedAspectRatio / realAspectRatio;
                    this.videoTextureView.scaleX = 1;
                  }
                } catch (e) {
                  Log.error('texImage2d video', e);
                  this._stopUpdatingVideoTexture();
                  this.videoTextureView.visible = false;
                }
                this.videoTexture.source.forceRenderUpdate();
              }
            }
          };
        }
        if (!this._updatingVideoTexture) {
          stage.on('frameStart', this._updateVideoTexture);
          this._updatingVideoTexture = true;
        }
      }
    }

    _stopUpdatingVideoTexture() {
      if (this.textureMode) {
        const stage = this.stage;
        stage.removeListener('frameStart', this._updateVideoTexture);
        this._updatingVideoTexture = false;
        this.videoTextureView.visible = false;

        if (this.videoTexture.options.source) {
          const gl = stage.gl;
          gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      }
    }

    updateSettings(settings = {}) {
      // The Component that 'consumes' the media player.
      this._consumer = settings.consumer;

      if (this._consumer && this._consumer.getMediaplayerSettings) {
        // Allow consumer to add settings.
        settings = Object.assign(settings, this._consumer.getMediaplayerSettings());
      }

      if (!lng.Utils.equalValues(this._stream, settings.stream)) {
        if (settings.stream && settings.stream.keySystem) {
          navigator
            .requestMediaKeySystemAccess(
              settings.stream.keySystem.id,
              settings.stream.keySystem.config
            )
            .then(keySystemAccess => {
              return keySystemAccess.createMediaKeys()
            })
            .then(createdMediaKeys => {
              return this.videoEl.setMediaKeys(createdMediaKeys)
            })
            .then(() => {
              if (settings.stream && settings.stream.src) this.open(settings.stream.src);
            })
            .catch(() => {
              console.error('Failed to set up MediaKeys');
            });
        } else if (settings.stream && settings.stream.src) {
          // This is here to be backwards compatible, will be removed
          // in future sdk release
          if (Settings.get('app', 'hls')) {
            if (!window.Hls) {
              window.Hls = class Hls {
                static isSupported() {
                  console.warn('hls-light not included');
                  return false
                }
              };
            }
            if (window.Hls.isSupported()) {
              if (!this._hls) this._hls = new window.Hls({ liveDurationInfinity: true });
              this._hls.loadSource(settings.stream.src);
              this._hls.attachMedia(this.videoEl);
              this.videoEl.style.display = 'block';
            }
          } else {
            this.open(settings.stream.src);
          }
        } else {
          this.close();
        }
        this._stream = settings.stream;
      }

      this._setHide(settings.hide);
      this._setVideoArea(settings.videoPos);
    }

    _setHide(hide) {
      if (this.textureMode) {
        this.tag('Video').setSmooth('alpha', hide ? 0 : 1);
      } else {
        this.videoEl.style.visibility = hide ? 'hidden' : 'visible';
      }
    }

    open(url, settings = { hide: false, videoPosition: null }) {
      // prep the media url to play depending on platform (mediaPlayerplugin)
      url = mediaUrl$1(url);
      this._metrics = Metrics$1.media(url);
      Log.info('Playing stream', url);
      if (this.application.noVideo) {
        Log.info('noVideo option set, so ignoring: ' + url);
        return
      }
      // close the video when opening same url as current (effectively reloading)
      if (this.videoEl.getAttribute('src') === url) {
        this.close();
      }
      this.videoEl.setAttribute('src', url);

      // force hide, then force show (in next tick!)
      // (fixes comcast playback rollover issue)
      this.videoEl.style.visibility = 'hidden';
      this.videoEl.style.display = 'none';

      setTimeout(() => {
        this.videoEl.style.display = 'block';
        this.videoEl.style.visibility = 'visible';
      });

      this._setHide(settings.hide);
      this._setVideoArea(settings.videoPosition || [0, 0, 1920, 1080]);
    }

    close() {
      // We need to pause first in order to stop sound.
      this.videoEl.pause();
      this.videoEl.removeAttribute('src');

      // force load to reset everything without errors
      this.videoEl.load();

      this._clearSrc();

      this.videoEl.style.display = 'none';
    }

    playPause() {
      if (this.isPlaying()) {
        this.doPause();
      } else {
        this.doPlay();
      }
    }

    get muted() {
      return this.videoEl.muted
    }

    set muted(v) {
      this.videoEl.muted = v;
    }

    get loop() {
      return this.videoEl.loop
    }

    set loop(v) {
      this.videoEl.loop = v;
    }

    isPlaying() {
      return this._getState() === 'Playing'
    }

    doPlay() {
      this.videoEl.play();
    }

    doPause() {
      this.videoEl.pause();
    }

    reload() {
      var url = this.videoEl.getAttribute('src');
      this.close();
      this.videoEl.src = url;
    }

    getPosition() {
      return Promise.resolve(this.videoEl.currentTime)
    }

    setPosition(pos) {
      this.videoEl.currentTime = pos;
    }

    getDuration() {
      return Promise.resolve(this.videoEl.duration)
    }

    seek(time, absolute = false) {
      if (absolute) {
        this.videoEl.currentTime = time;
      } else {
        this.videoEl.currentTime += time;
      }
    }

    get videoTextureView() {
      return this.tag('Video').tag('VideoTexture')
    }

    get videoTexture() {
      return this.videoTextureView.texture
    }

    _setVideoArea(videoPos) {
      if (lng.Utils.equalValues(this._videoPos, videoPos)) {
        return
      }

      this._videoPos = videoPos;

      if (this.textureMode) {
        this.videoTextureView.patch({
          smooth: {
            x: videoPos[0],
            y: videoPos[1],
            w: videoPos[2] - videoPos[0],
            h: videoPos[3] - videoPos[1],
          },
        });
      } else {
        const precision = this.stage.getRenderPrecision();
        this.videoEl.style.left = Math.round(videoPos[0] * precision) + 'px';
        this.videoEl.style.top = Math.round(videoPos[1] * precision) + 'px';
        this.videoEl.style.width = Math.round((videoPos[2] - videoPos[0]) * precision) + 'px';
        this.videoEl.style.height = Math.round((videoPos[3] - videoPos[1]) * precision) + 'px';
      }
    }

    _fireConsumer(event, args) {
      if (this._consumer) {
        this._consumer.fire(event, args);
      }
    }

    _equalInitData(buf1, buf2) {
      if (!buf1 || !buf2) return false
      if (buf1.byteLength != buf2.byteLength) return false
      const dv1 = new Int8Array(buf1);
      const dv2 = new Int8Array(buf2);
      for (let i = 0; i != buf1.byteLength; i++) if (dv1[i] != dv2[i]) return false
      return true
    }

    error(args) {
      this._fireConsumer('$mediaplayerError', args);
      this._setState('');
      return ''
    }

    loadeddata(args) {
      this._fireConsumer('$mediaplayerLoadedData', args);
    }

    play(args) {
      this._fireConsumer('$mediaplayerPlay', args);
    }

    playing(args) {
      this._fireConsumer('$mediaplayerPlaying', args);
      this._setState('Playing');
    }

    canplay(args) {
      this.videoEl.play();
      this._fireConsumer('$mediaplayerStart', args);
    }

    loadstart(args) {
      this._fireConsumer('$mediaplayerLoad', args);
    }

    seeked() {
      this._fireConsumer('$mediaplayerSeeked', {
        currentTime: this.videoEl.currentTime,
        duration: this.videoEl.duration || 1,
      });
    }

    seeking() {
      this._fireConsumer('$mediaplayerSeeking', {
        currentTime: this.videoEl.currentTime,
        duration: this.videoEl.duration || 1,
      });
    }

    durationchange(args) {
      this._fireConsumer('$mediaplayerDurationChange', args);
    }

    encrypted(args) {
      const video = args.videoElement;
      const event = args.event;
      // FIXME: Double encrypted events need to be properly filtered by Gstreamer
      if (video.mediaKeys && !this._equalInitData(this._previousInitData, event.initData)) {
        this._previousInitData = event.initData;
        this._fireConsumer('$mediaplayerEncrypted', args);
      }
    }

    static _states() {
      return [
        class Playing extends this {
          $enter() {
            this._startUpdatingVideoTexture();
          }
          $exit() {
            this._stopUpdatingVideoTexture();
          }
          timeupdate() {
            this._fireConsumer('$mediaplayerProgress', {
              currentTime: this.videoEl.currentTime,
              duration: this.videoEl.duration || 1,
            });
          }
          ended(args) {
            this._fireConsumer('$mediaplayerEnded', args);
            this._setState('');
          }
          pause(args) {
            this._fireConsumer('$mediaplayerPause', args);
            this._setState('Playing.Paused');
          }
          _clearSrc() {
            this._fireConsumer('$mediaplayerStop', {});
            this._setState('');
          }
          static _states() {
            return [class Paused extends this {}]
          }
        },
      ]
    }
  }

  class localCookie{constructor(e){return e=e||{},this.forceCookies=e.forceCookies||!1,!0===this._checkIfLocalStorageWorks()&&!0!==e.forceCookies?{getItem:this._getItemLocalStorage,setItem:this._setItemLocalStorage,removeItem:this._removeItemLocalStorage,clear:this._clearLocalStorage}:{getItem:this._getItemCookie,setItem:this._setItemCookie,removeItem:this._removeItemCookie,clear:this._clearCookies}}_checkIfLocalStorageWorks(){if("undefined"==typeof localStorage)return !1;try{return localStorage.setItem("feature_test","yes"),"yes"===localStorage.getItem("feature_test")&&(localStorage.removeItem("feature_test"),!0)}catch(e){return !1}}_getItemLocalStorage(e){return window.localStorage.getItem(e)}_setItemLocalStorage(e,t){return window.localStorage.setItem(e,t)}_removeItemLocalStorage(e){return window.localStorage.removeItem(e)}_clearLocalStorage(){return window.localStorage.clear()}_getItemCookie(e){var t=document.cookie.match(RegExp("(?:^|;\\s*)"+function(e){return e.replace(/([.*+?\^${}()|\[\]\/\\])/g,"\\$1")}(e)+"=([^;]*)"));return t&&""===t[1]&&(t[1]=null),t?t[1]:null}_setItemCookie(e,t){var o=new Date,r=new Date(o.getTime()+15768e7);document.cookie=`${e}=${t}; expires=${r.toUTCString()};`;}_removeItemCookie(e){document.cookie=`${e}=;Max-Age=-99999999;`;}_clearCookies(){document.cookie.split(";").forEach(e=>{document.cookie=e.replace(/^ +/,"").replace(/=.*/,"=;expires=Max-Age=-99999999");});}}

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const initStorage = () => {
    Settings.get('platform', 'id');
    // todo: pass options (for example to force the use of cookies)
    new localCookie();
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const isFunction = v => {
    return typeof v === 'function'
  };

  const isObject$1 = v => {
    return typeof v === 'object' && v !== null
  };

  const isBoolean = v => {
    return typeof v === 'boolean'
  };

  const isPage = v => {
    if (v instanceof lng.Element || isComponentConstructor(v)) {
      return true
    }
    return false
  };

  const isComponentConstructor = type => {
    return type.prototype && 'isComponent' in type.prototype
  };

  const isArray = v => {
    return Array.isArray(v)
  };

  const ucfirst = v => {
    return `${v.charAt(0).toUpperCase()}${v.slice(1)}`
  };

  const isString$1 = v => {
    return typeof v === 'string'
  };

  const isPromise = method => {
    let result;
    if (isFunction(method)) {
      try {
        result = method.apply(null);
      } catch (e) {
        result = e;
      }
    } else {
      result = method;
    }
    return isObject$1(result) && isFunction(result.then)
  };

  const cleanHash = (hash = '') => {
    return hash.replace(/^#/, '').replace(/\/+$/, '')
  };

  const getConfigMap = () => {
    const routerSettings = Settings.get('platform', 'router');
    const isObj = isObject$1(routerSettings);
    return [
      'backtrack',
      'gcOnUnload',
      'destroyOnHistoryBack',
      'lazyCreate',
      'lazyDestroy',
      'reuseInstance',
      'autoRestoreRemote',
      'numberNavigation',
      'updateHash',
    ].reduce((config, key) => {
      config.set(key, isObj ? routerSettings[key] : Settings.get('platform', key));
      return config
    }, new Map())
  };

  const getQueryStringParams = hash => {
    let parse = '';
    const getQuery = /([?&].*)/;
    const matches = getQuery.exec(hash);
    const params = {};

    if (document.location && document.location.search) {
      parse = document.location.search;
    }

    if (matches && matches.length) {
      let hashParams = matches[1];
      if (parse) {
        // if location.search is not empty we
        // remove the leading ? to create a
        // valid string
        hashParams = hashParams.replace(/^\?/, '');
        // we parse hash params last so they we can always
        // override search params with hash params
        parse = `${parse}&${hashParams}`;
      } else {
        parse = hashParams;
      }
    }

    if (parse) {
      const urlParams = new URLSearchParams(parse);
      for (const [key, value] of urlParams.entries()) {
        params[key] = value;
      }
      return params
    } else {
      return false
    }
  };

  const objectToQueryString = obj => {
    if (!isObject$1(obj)) {
      return ''
    }
    return (
      '?' +
      Object.keys(obj)
        .map(key => {
          return `${key}=${obj[key]}`
        })
        .join('&')
    )
  };

  const symbols = {
    route: Symbol('route'),
    hash: Symbol('hash'),
    store: Symbol('store'),
    fromHistory: Symbol('fromHistory'),
    expires: Symbol('expires'),
    resume: Symbol('resume'),
    backtrack: Symbol('backtrack'),
    historyState: Symbol('historyState'),
    queryParams: Symbol('queryParams'),
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const hasRegex = /\{\/(.*?)\/([igm]{0,3})\}/g;
  const isWildcard = /^[!*$]$/;
  const hasLookupId = /\/:\w+?@@([0-9]+?)@@/;
  const isNamedGroup = /^\/:/;

  /**
   * Test if a route is part regular expressed
   * and replace it for a simple character
   * @param route
   * @returns {*}
   */
  const stripRegex = (route, char = 'R') => {
    // if route is part regular expressed we replace
    // the regular expression for a character to
    // simplify floor calculation and backtracking
    if (hasRegex.test(route)) {
      route = route.replace(hasRegex, char);
    }
    return route
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Create a local request register
   * @param flags
   * @returns {Map<any, any>}
   */
  const createRegister = flags => {
    const reg = new Map()
    // store user defined and router
    // defined flags in register
    ;[...Object.keys(flags), ...Object.getOwnPropertySymbols(flags)].forEach(key => {
      reg.set(key, flags[key]);
    });
    return reg
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class Request {
    constructor(hash = '', navArgs, storeCaller) {
      /**
       * Hash we navigate to
       * @type {string}
       * @private
       */
      this._hash = hash;

      /**
       * Do we store previous hash in history
       * @type {boolean}
       * @private
       */
      this._storeCaller = storeCaller;

      /**
       * Request and navigate data
       * @type {Map}
       * @private
       */
      this._register = new Map();

      /**
       * Flag if the instance is created due to
       * this request
       * @type {boolean}
       * @private
       */
      this._isCreated = false;

      /**
       * Flag if the instance is shared between
       * previous and current request
       * @type {boolean}
       * @private
       */
      this._isSharedInstance = false;

      /**
       * Flag if the request has been cancelled
       * @type {boolean}
       * @private
       */
      this._cancelled = false;

      /**
       * if instance is shared between requests we copy state object
       * from instance before the new request overrides state
       * @type {null}
       * @private
       */
      this._copiedHistoryState = null;

      // if there are arguments attached to navigate()
      // we store them in new request
      if (isObject$1(navArgs)) {
        this._register = createRegister(navArgs);
      } else if (isBoolean(navArgs)) {
        // if second navigate() argument is explicitly
        // set to false we prevent the calling page
        // from ending up in history
        this._storeCaller = navArgs;
      }
      // @todo: remove because we can simply check
      // ._storeCaller property
      this._register.set(symbols.store, this._storeCaller);
    }

    cancel() {
      Log.debug('[router]:', `cancelled ${this._hash}`);
      this._cancelled = true;
    }

    get url() {
      return this._hash
    }

    get register() {
      return this._register
    }

    get hash() {
      return this._hash
    }

    set hash(args) {
      this._hash = args;
    }

    get route() {
      return this._route
    }

    set route(args) {
      this._route = args;
    }

    get provider() {
      return this._provider
    }

    set provider(args) {
      this._provider = args;
    }

    get providerType() {
      return this._providerType
    }

    set providerType(args) {
      this._providerType = args;
    }

    set page(args) {
      this._page = args;
    }

    get page() {
      return this._page
    }

    set isCreated(args) {
      this._isCreated = args;
    }

    get isCreated() {
      return this._isCreated
    }

    get isSharedInstance() {
      return this._isSharedInstance
    }

    set isSharedInstance(args) {
      this._isSharedInstance = args;
    }

    get isCancelled() {
      return this._cancelled
    }

    set copiedHistoryState(v) {
      this._copiedHistoryState = v;
    }

    get copiedHistoryState() {
      return this._copiedHistoryState
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class Route {
    constructor(config = {}) {
      // keep backwards compatible
      let type = ['on', 'before', 'after'].reduce((acc, type) => {
        return isFunction(config[type]) ? type : acc
      }, undefined);

      this._cfg = config;
      if (type) {
        this._provider = {
          type,
          request: config[type],
        };
      }
    }

    get path() {
      return this._cfg.path
    }

    get component() {
      return this._cfg.component
    }

    get options() {
      return this._cfg.options
    }

    get widgets() {
      return this._cfg.widgets
    }

    get cache() {
      return this._cfg.cache
    }

    get hook() {
      return this._cfg.hook
    }

    get beforeNavigate() {
      return this._cfg.beforeNavigate
    }

    get provider() {
      return this._provider
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Simple route length calculation
   * @param route {string}
   * @returns {number} - floor
   */
  const getFloor = route => {
    return stripRegex(route).split('/').length
  };

  /**
   * return all stored routes that live on the same floor
   * @param floor
   * @returns {Array}
   */
  const getRoutesByFloor = floor => {
    const matches = [];
    // simple filter of level candidates
    for (let [route] of routes.entries()) {
      if (getFloor(route) === floor) {
        matches.push(route);
      }
    }
    return matches
  };

  /**
   * return a matching route by provided hash
   * hash: home/browse/12 will match:
   * route: home/browse/:categoryId
   * @param hash {string}
   * @returns {boolean|{}} - route
   */
  const getRouteByHash = hash => {
    // @todo: clean up on handleHash
    hash = hash.replace(/^#/, '');

    const getUrlParts = /(\/?:?[@!*\w%\s:-]+)/g;
    // grab possible candidates from stored routes
    const candidates = getRoutesByFloor(getFloor(hash));
    // break hash down in chunks
    const hashParts = hash.match(getUrlParts) || [];

    // to simplify the route matching and prevent look around
    // in our getUrlParts regex we get the regex part from
    // route candidate and store them so that we can reference
    // them when we perform the actual regex against hash
    let regexStore = [];

    let matches = candidates.filter(route => {
      let isMatching = true;
      // replace regex in route with lookup id => @@{storeId}@@
      if (hasRegex.test(route)) {
        const regMatches = route.match(hasRegex);
        if (regMatches && regMatches.length) {
          route = regMatches.reduce((fullRoute, regex) => {
            const lookupId = regexStore.length;
            fullRoute = fullRoute.replace(regex, `@@${lookupId}@@`);
            regexStore.push(regex.substring(1, regex.length - 1));
            return fullRoute
          }, route);
        }
      }

      const routeParts = route.match(getUrlParts) || [];

      for (let i = 0, j = routeParts.length; i < j; i++) {
        const routePart = routeParts[i];
        const hashPart = hashParts[i];

        // Since we support catch-all and regex driven name groups
        // we first test for regex lookup id and see if the regex
        // matches the value from the hash
        if (hasLookupId.test(routePart)) {
          const routeMatches = hasLookupId.exec(routePart);
          const storeId = routeMatches[1];
          const routeRegex = regexStore[storeId];

          // split regex and modifiers so we can use both
          // to create a new RegExp
          // eslint-disable-next-line
                  const regMatches = /\/([^\/]+)\/([igm]{0,3})/.exec(routeRegex);

          if (regMatches && regMatches.length) {
            const expression = regMatches[1];
            const modifiers = regMatches[2];

            const regex = new RegExp(`^/${expression}$`, modifiers);

            if (!regex.test(hashPart)) {
              isMatching = false;
            }
          }
        } else if (isNamedGroup.test(routePart)) {
          // we kindly skip namedGroups because this is dynamic
          // we only need to the static and regex drive parts
          continue
        } else if (hashPart && routePart.toLowerCase() !== hashPart.toLowerCase()) {
          isMatching = false;
        }
      }
      return isMatching
    });

    if (matches.length) {
      if (matches.indexOf(hash) !== -1) {
        const match = matches[matches.indexOf(hash)];
        return routes.get(match)
      } else {
        // we give prio to static routes over dynamic
        matches = matches.sort(a => {
          return isNamedGroup.test(a) ? -1 : 1
        });
        // would be strange if this fails
        // but still we test
        if (routeExists(matches[0])) {
          return routes.get(matches[0])
        }
      }
    }
    return false
  };

  const getValuesFromHash = (hash = '', path) => {
    // replace the regex definition from the route because
    // we already did the matching part
    path = stripRegex(path, '');

    const getUrlParts = /(\/?:?[\w%\s:-]+)/g;
    const hashParts = hash.match(getUrlParts) || [];
    const routeParts = path.match(getUrlParts) || [];
    const getNamedGroup = /^\/:([\w-]+)\/?/;

    return routeParts.reduce((storage, value, index) => {
      const match = getNamedGroup.exec(value);
      if (match && match.length) {
        storage.set(match[1], decodeURIComponent(hashParts[index].replace(/^\//, '')));
      }
      return storage
    }, new Map())
  };

  const getOption = (stack, prop) => {
    // eslint-disable-next-line
      if(stack && stack.hasOwnProperty(prop)){
      return stack[prop]
    }
    // we explicitly return undefined since we're testing
    // for explicit test values
  };

  /**
   * create and return new Route instance
   * @param config
   */
  const createRoute = config => {
    // we need to provide a bit of additional logic
    // for the bootComponent
    if (config.path === '$') {
      let options = {
        preventStorage: true,
      };
      if (isObject$1(config.options)) {
        options = {
          ...config.options,
          ...options,
        };
      }
      config.options = options;
      // if configured add reference to bootRequest
      // as router after provider
      if (bootRequest) {
        config.after = bootRequest;
      }
    }
    return new Route(config)
  };

  /**
   * Create a new Router request object
   * @param url
   * @param args
   * @param store
   * @returns {*}
   */
  const createRequest = (url, args, store) => {
    return new Request(url, args, store)
  };

  const getHashByName = obj => {
    if (!obj.to && !obj.name) {
      return false
    }
    const route = getRouteByName(obj.to || obj.name);
    const hasDynamicGroup = /\/:([\w-]+)\/?/;
    let hash = route;

    // if route contains dynamic group
    // we replace them with the provided params
    if (hasDynamicGroup.test(route)) {
      if (obj.params) {
        const keys = Object.keys(obj.params);
        hash = keys.reduce((acc, key) => {
          return acc.replace(`:${key}`, obj.params[key])
        }, route);
      }
      if (obj.query) {
        return `${hash}${objectToQueryString(obj.query)}`
      }
    }
    return hash
  };

  const getRouteByName = name => {
    for (let [path, route] of routes.entries()) {
      if (route.name === name) {
        return path
      }
    }
    return false
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  var emit$1 = (page, events = [], params = {}) => {
    if (!isArray(events)) {
      events = [events];
    }
    events.forEach(e => {
      const event = `_on${ucfirst(e)}`;
      if (isFunction(page[event])) {
        page[event](params);
      }
    });
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let activeWidget = null;

  const getReferences = () => {
    if (!widgetsHost) {
      return
    }
    return widgetsHost.get().reduce((storage, widget) => {
      const key = widget.ref.toLowerCase();
      storage[key] = widget;
      return storage
    }, {})
  };

  /**
   * update the visibility of the available widgets
   * for the current page / route
   * @param page
   */
  const updateWidgets = (widgets, page) => {
    // force lowercase lookup
    const configured = (widgets || []).map(ref => ref.toLowerCase());

    widgetsHost.forEach(widget => {
      widget.visible = configured.indexOf(widget.ref.toLowerCase()) !== -1;
      if (widget.visible) {
        emit$1(widget, ['activated'], page);
      }
    });
    if (app.state === 'Widgets' && activeWidget && !activeWidget.visible) {
      app._setState('');
    }
  };

  const getWidgetByName = name => {
    name = ucfirst(name);
    return widgetsHost.getByRef(name) || false
  };

  /**
   * delegate app focus to a on-screen widget
   * @param name - {string}
   */
  const focusWidget = name => {
    const widget = getWidgetByName(name);
    if (widget) {
      setActiveWidget(widget);

      // if app is already in 'Widgets' state we can assume that
      // focus has been delegated from one widget to another so
      // we need to set the new widget reference and trigger a
      // new focus calculation of Lightning's focuspath
      if (app.state === 'Widgets') {
        app.reload(activeWidget);
      } else {
        app._setState('Widgets', [activeWidget]);
      }
    }
  };

  const restoreFocus = () => {
    activeWidget = null;
    app._setState('');
  };

  const getActiveWidget = () => {
    return activeWidget
  };

  const setActiveWidget = instance => {
    activeWidget = instance;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const createComponent = (stage, type) => {
    return stage.c({
      type,
      visible: false,
      widgets: getReferences(),
    })
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Simple flat array that holds the visited hashes + state Object
   * so the router can navigate back to them
   * @type {Array}
   */
  let history = [];

  const updateHistory = request => {
    const hash = getActiveHash();
    if (!hash) {
      return
    }

    // navigate storage flag
    const register = request.register;
    const forceNavigateStore = register.get(symbols.store);

    // test preventStorage on route configuration
    const activeRoute = getRouteByHash(hash);
    const preventStorage = getOption(activeRoute.options, 'preventStorage');

    // we give prio to navigate storage flag
    let store = isBoolean(forceNavigateStore) ? forceNavigateStore : !preventStorage;

    if (store) {
      const toStore = hash.replace(/^\//, '');
      const location = locationInHistory(toStore);
      const stateObject = getStateObject(getActivePage(), request);
      const routerConfig = getRouterConfig();

      // store hash if it's not a part of history or flag for
      // storage of same hash is true
      if (location === -1 || routerConfig.get('storeSameHash')) {
        history.push({ hash: toStore, state: stateObject });
      } else {
        // if we visit the same route we want to sync history
        const prev = history.splice(location, 1)[0];
        history.push({ hash: prev.hash, state: stateObject });
      }
    }
  };

  const locationInHistory = hash => {
    for (let i = 0; i < history.length; i++) {
      if (history[i].hash === hash) {
        return i
      }
    }
    return -1
  };

  const getHistoryState = hash => {
    let state = null;
    if (history.length) {
      // if no hash is provided we get the last
      // pushed history record
      if (!hash) {
        const record = history[history.length - 1];
        // could be null
        state = record.state;
      } else {
        if (locationInHistory(hash) !== -1) {
          const record = history[locationInHistory(hash)];
          state = record.state;
        }
      }
    }
    return state
  };

  const replaceHistoryState = (state = null, hash) => {
    if (!history.length) {
      return
    }
    const location = hash ? locationInHistory(hash) : history.length - 1;
    if (location !== -1 && isObject$1(state)) {
      history[location].state = state;
    }
  };

  const getStateObject = (page, request) => {
    // if the new request shared instance with the
    // previous request we used the copied state object
    if (request.isSharedInstance) {
      if (request.copiedHistoryState) {
        return request.copiedHistoryState
      }
    } else if (page && isFunction(page.historyState)) {
      return page.historyState()
    }
    return null
  };

  const getHistory = () => {
    return history.slice(0)
  };

  const setHistory = (arr = []) => {
    if (isArray(arr)) {
      history = arr;
    }
  };

  var isMergeableObject = function isMergeableObject(value) {
  	return isNonNullObject(value)
  		&& !isSpecial(value)
  };

  function isNonNullObject(value) {
  	return !!value && typeof value === 'object'
  }

  function isSpecial(value) {
  	var stringValue = Object.prototype.toString.call(value);

  	return stringValue === '[object RegExp]'
  		|| stringValue === '[object Date]'
  		|| isReactElement(value)
  }

  // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
  var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

  function isReactElement(value) {
  	return value.$$typeof === REACT_ELEMENT_TYPE
  }

  function emptyTarget(val) {
  	return Array.isArray(val) ? [] : {}
  }

  function cloneUnlessOtherwiseSpecified(value, options) {
  	return (options.clone !== false && options.isMergeableObject(value))
  		? deepmerge(emptyTarget(value), value, options)
  		: value
  }

  function defaultArrayMerge(target, source, options) {
  	return target.concat(source).map(function(element) {
  		return cloneUnlessOtherwiseSpecified(element, options)
  	})
  }

  function getMergeFunction(key, options) {
  	if (!options.customMerge) {
  		return deepmerge
  	}
  	var customMerge = options.customMerge(key);
  	return typeof customMerge === 'function' ? customMerge : deepmerge
  }

  function getEnumerableOwnPropertySymbols(target) {
  	return Object.getOwnPropertySymbols
  		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
  			return target.propertyIsEnumerable(symbol)
  		})
  		: []
  }

  function getKeys(target) {
  	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
  }

  function propertyIsOnObject(object, property) {
  	try {
  		return property in object
  	} catch(_) {
  		return false
  	}
  }

  // Protects from prototype poisoning and unexpected merging up the prototype chain.
  function propertyIsUnsafe(target, key) {
  	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
  		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
  			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
  }

  function mergeObject(target, source, options) {
  	var destination = {};
  	if (options.isMergeableObject(target)) {
  		getKeys(target).forEach(function(key) {
  			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
  		});
  	}
  	getKeys(source).forEach(function(key) {
  		if (propertyIsUnsafe(target, key)) {
  			return
  		}

  		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
  			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
  		} else {
  			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
  		}
  	});
  	return destination
  }

  function deepmerge(target, source, options) {
  	options = options || {};
  	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
  	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
  	// implementations can use it. The caller may not replace it.
  	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

  	var sourceIsArray = Array.isArray(source);
  	var targetIsArray = Array.isArray(target);
  	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  	if (!sourceAndTargetTypesMatch) {
  		return cloneUnlessOtherwiseSpecified(source, options)
  	} else if (sourceIsArray) {
  		return options.arrayMerge(target, source, options)
  	} else {
  		return mergeObject(target, source, options)
  	}
  }

  deepmerge.all = function deepmergeAll(array, options) {
  	if (!Array.isArray(array)) {
  		throw new Error('first argument should be an array')
  	}

  	return array.reduce(function(prev, next) {
  		return deepmerge(prev, next, options)
  	}, {})
  };

  var deepmerge_1 = deepmerge;

  var cjs = deepmerge_1;

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let warned = false;
  const deprecated = (force = false) => {
    if (force === true || warned === false) {
      console.warn(
        [
          "The 'Locale'-plugin in the Lightning-SDK is deprecated and will be removed in future releases.",
          "Please consider using the new 'Language'-plugin instead.",
          'https://rdkcentral.github.io/Lightning-SDK/#/plugins/language',
        ].join('\n\n')
      );
    }
    warned = true;
  };
  class Locale {
    constructor() {
      this.__enabled = false;
    }

    /**
     * Loads translation object from external json file.
     *
     * @param {String} path Path to resource.
     * @return {Promise}
     */
    async load(path) {
      if (!this.__enabled) {
        return
      }

      await fetch(path)
        .then(resp => resp.json())
        .then(resp => {
          this.loadFromObject(resp);
        });
    }

    /**
     * Sets language used by module.
     *
     * @param {String} lang
     */
    setLanguage(lang) {
      deprecated();
      this.__enabled = true;
      this.language = lang;
    }

    /**
     * Returns reference to translation object for current language.
     *
     * @return {Object}
     */
    get tr() {
      deprecated(true);
      return this.__trObj[this.language]
    }

    /**
     * Loads translation object from existing object (binds existing object).
     *
     * @param {Object} trObj
     */
    loadFromObject(trObj) {
      deprecated();
      const fallbackLanguage = 'en';
      if (Object.keys(trObj).indexOf(this.language) === -1) {
        Log.warn('No translations found for: ' + this.language);
        if (Object.keys(trObj).indexOf(fallbackLanguage) > -1) {
          Log.warn('Using fallback language: ' + fallbackLanguage);
          this.language = fallbackLanguage;
        } else {
          const error = 'No translations found for fallback language: ' + fallbackLanguage;
          Log.error(error);
          throw Error(error)
        }
      }

      this.__trObj = trObj;
      for (const lang of Object.values(this.__trObj)) {
        for (const str of Object.keys(lang)) {
          lang[str] = new LocalizedString(lang[str]);
        }
      }
    }
  }

  /**
   * Extended string class used for localization.
   */
  class LocalizedString extends String {
    /**
     * Returns formatted LocalizedString.
     * Replaces each placeholder value (e.g. {0}, {1}) with corresponding argument.
     *
     * E.g.:
     * > new LocalizedString('{0} and {1} and {0}').format('A', 'B');
     * A and B and A
     *
     * @param  {...any} args List of arguments for placeholders.
     */
    format(...args) {
      const sub = args.reduce((string, arg, index) => string.split(`{${index}}`).join(arg), this);
      return new LocalizedString(sub)
    }
  }

  var Locale$1 = new Locale();

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class VersionLabel extends lng.Component {
    static _template() {
      return {
        rect: true,
        color: 0xbb0078ac,
        h: 40,
        w: 100,
        x: w => w - 50,
        y: h => h - 50,
        mount: 1,
        Text: {
          w: w => w,
          h: h => h,
          y: 5,
          x: 20,
          text: {
            fontSize: 22,
            lineHeight: 26,
          },
        },
      }
    }

    _firstActive() {
      this.tag('Text').text = `APP - v${this.version}\nSDK - v${this.sdkVersion}`;
      this.tag('Text').loadTexture();
      this.w = this.tag('Text').renderWidth + 40;
      this.h = this.tag('Text').renderHeight + 5;
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class FpsIndicator extends lng.Component {
    static _template() {
      return {
        rect: true,
        color: 0xffffffff,
        texture: lng.Tools.getRoundRect(80, 80, 40),
        h: 80,
        w: 80,
        x: 100,
        y: 100,
        mount: 1,
        Background: {
          x: 3,
          y: 3,
          texture: lng.Tools.getRoundRect(72, 72, 36),
          color: 0xff008000,
        },
        Counter: {
          w: w => w,
          h: h => h,
          y: 10,
          text: {
            fontSize: 32,
            textAlign: 'center',
          },
        },
        Text: {
          w: w => w,
          h: h => h,
          y: 48,
          text: {
            fontSize: 15,
            textAlign: 'center',
            text: 'FPS',
          },
        },
      }
    }

    _setup() {
      this.config = {
        ...{
          log: false,
          interval: 500,
          threshold: 1,
        },
        ...Settings.get('platform', 'showFps'),
      };

      this.fps = 0;
      this.lastFps = this.fps - this.config.threshold;

      const fpsCalculator = () => {
        this.fps = ~~(1 / this.stage.dt);
      };
      this.stage.on('frameStart', fpsCalculator);
      this.stage.off('framestart', fpsCalculator);
      this.interval = setInterval(this.showFps.bind(this), this.config.interval);
    }

    _firstActive() {
      this.showFps();
    }

    _detach() {
      clearInterval(this.interval);
    }

    showFps() {
      if (Math.abs(this.lastFps - this.fps) <= this.config.threshold) return
      this.lastFps = this.fps;
      // green
      let bgColor = 0xff008000;
      // orange
      if (this.fps <= 40 && this.fps > 20) bgColor = 0xffffa500;
      // red
      else if (this.fps <= 20) bgColor = 0xffff0000;

      this.tag('Background').setSmooth('color', bgColor);
      this.tag('Counter').text = `${this.fps}`;

      this.config.log && Log.info('FPS', this.fps);
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let meta = {};
  let translations = {};
  let language = null;

  const initLanguage = (file, language = null) => {
    return new Promise((resolve, reject) => {
      fetch(file)
        .then(response => response.json())
        .then(json => {
          setTranslations(json);
          // set language (directly or in a promise)
          typeof language === 'object' && 'then' in language && typeof language.then === 'function'
            ? language
                .then(lang =>
                  setLanguage(lang)
                    .then(resolve)
                    .catch(reject)
                )
                .catch(e => {
                  Log.error(e);
                  reject(e);
                })
            : setLanguage(language)
                .then(resolve)
                .catch(reject);
        })
        .catch(() => {
          const error = 'Language file ' + file + ' not found';
          Log.error(error);
          reject(error);
        });
    })
  };

  const setTranslations = obj => {
    if ('meta' in obj) {
      meta = { ...obj.meta };
      delete obj.meta;
    }
    translations = obj;
  };

  const setLanguage = lng => {
    language = null;

    return new Promise((resolve, reject) => {
      if (lng in translations) {
        language = lng;
      } else {
        if ('map' in meta && lng in meta.map && meta.map[lng] in translations) {
          language = meta.map[lng];
        } else if ('default' in meta && meta.default in translations) {
          const error =
            'Translations for Language ' +
            language +
            ' not found. Using default language ' +
            meta.default;
          Log.warn(error);
          language = meta.default;
        } else {
          const error = 'Translations for Language ' + language + ' not found.';
          Log.error(error);
          reject(error);
        }
      }

      if (language) {
        Log.info('Setting language to', language);

        const translationsObj = translations[language];
        if (typeof translationsObj === 'object') {
          resolve();
        } else if (typeof translationsObj === 'string') {
          const url = Utils.asset(translationsObj);

          fetch(url)
            .then(response => response.json())
            .then(json => {
              // save the translations for this language (to prevent loading twice)
              translations[language] = json;
              resolve();
            })
            .catch(e => {
              const error = 'Error while fetching ' + url;
              Log.error(error, e);
              reject(error);
            });
        }
      }
    })
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const registry = {
    eventListeners: [],
    timeouts: [],
    intervals: [],
    targets: [],
  };

  var Registry = {
    // Timeouts
    setTimeout(cb, timeout, ...params) {
      const timeoutId = setTimeout(
        () => {
          registry.timeouts = registry.timeouts.filter(id => id !== timeoutId);
          cb.apply(null, params);
        },
        timeout,
        params
      );
      Log.info('Set Timeout', 'ID: ' + timeoutId);
      registry.timeouts.push(timeoutId);
      return timeoutId
    },

    clearTimeout(timeoutId) {
      if (registry.timeouts.indexOf(timeoutId) > -1) {
        registry.timeouts = registry.timeouts.filter(id => id !== timeoutId);
        Log.info('Clear Timeout', 'ID: ' + timeoutId);
        clearTimeout(timeoutId);
      } else {
        Log.error('Clear Timeout', 'ID ' + timeoutId + ' not found');
      }
    },

    clearTimeouts() {
      registry.timeouts.forEach(timeoutId => {
        this.clearTimeout(timeoutId);
      });
    },

    // Intervals
    setInterval(cb, interval, ...params) {
      const intervalId = setInterval(
        () => {
          registry.intervals.filter(id => id !== intervalId);
          cb.apply(null, params);
        },
        interval,
        params
      );
      Log.info('Set Interval', 'ID: ' + intervalId);
      registry.intervals.push(intervalId);
      return intervalId
    },

    clearInterval(intervalId) {
      if (registry.intervals.indexOf(intervalId) > -1) {
        registry.intervals = registry.intervals.filter(id => id !== intervalId);
        Log.info('Clear Interval', 'ID: ' + intervalId);
        clearInterval(intervalId);
      } else {
        Log.error('Clear Interval', 'ID ' + intervalId + ' not found');
      }
    },

    clearIntervals() {
      registry.intervals.forEach(intervalId => {
        this.clearInterval(intervalId);
      });
    },

    // Event listeners
    addEventListener(target, event, handler) {
      target.addEventListener(event, handler);
      const targetIndex =
        registry.targets.indexOf(target) > -1
          ? registry.targets.indexOf(target)
          : registry.targets.push(target) - 1;

      registry.eventListeners[targetIndex] = registry.eventListeners[targetIndex] || {};
      registry.eventListeners[targetIndex][event] = registry.eventListeners[targetIndex][event] || [];
      registry.eventListeners[targetIndex][event].push(handler);
      Log.info(
        'Add eventListener',
        'Target:',
        target,
        'Event: ' + event,
        'Handler:',
        handler.toString()
      );
    },

    removeEventListener(target, event, handler) {
      const targetIndex = registry.targets.indexOf(target);
      if (
        targetIndex > -1 &&
        registry.eventListeners[targetIndex] &&
        registry.eventListeners[targetIndex][event] &&
        registry.eventListeners[targetIndex][event].indexOf(handler) > -1
      ) {
        registry.eventListeners[targetIndex][event] = registry.eventListeners[targetIndex][
          event
        ].filter(fn => fn !== handler);
        Log.info(
          'Remove eventListener',
          'Target:',
          target,
          'Event: ' + event,
          'Handler:',
          handler.toString()
        );
        target.removeEventListener(event, handler);
      } else {
        Log.error(
          'Remove eventListener',
          'Not found',
          'Target',
          target,
          'Event: ' + event,
          'Handler',
          handler.toString()
        );
      }
    },

    // if `event` is omitted, removes all registered event listeners for target
    // if `target` is also omitted, removes all registered event listeners
    removeEventListeners(target, event) {
      if (target && event) {
        const targetIndex = registry.targets.indexOf(target);
        if (targetIndex > -1) {
          registry.eventListeners[targetIndex][event].forEach(handler => {
            this.removeEventListener(target, event, handler);
          });
        }
      } else if (target) {
        const targetIndex = registry.targets.indexOf(target);
        if (targetIndex > -1) {
          Object.keys(registry.eventListeners[targetIndex]).forEach(_event => {
            this.removeEventListeners(target, _event);
          });
        }
      } else {
        Object.keys(registry.eventListeners).forEach(targetIndex => {
          this.removeEventListeners(registry.targets[targetIndex]);
        });
      }
    },

    // Clear everything (to be called upon app close for proper cleanup)
    clear() {
      this.clearTimeouts();
      this.clearIntervals();
      this.removeEventListeners();
      registry.eventListeners = [];
      registry.timeouts = [];
      registry.intervals = [];
      registry.targets = [];
    },
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const isObject = v => {
    return typeof v === 'object' && v !== null
  };

  const isString = v => {
    return typeof v === 'string'
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let colors = {
    white: '#ffffff',
    black: '#000000',
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    yellow: '#feff00',
    cyan: '#00feff',
    magenta: '#ff00ff',
  };

  const normalizedColors = {
    //store for normalized colors
  };

  const addColors = (colorsToAdd, value) => {
    if (isObject(colorsToAdd)) {
      // clean up normalizedColors if they exist in the to be added colors
      Object.keys(colorsToAdd).forEach(color => cleanUpNormalizedColors(color));
      colors = Object.assign({}, colors, colorsToAdd);
    } else if (isString(colorsToAdd) && value) {
      cleanUpNormalizedColors(colorsToAdd);
      colors[colorsToAdd] = value;
    }
  };

  const cleanUpNormalizedColors = color => {
    for (let c in normalizedColors) {
      if (c.indexOf(color) > -1) {
        delete normalizedColors[c];
      }
    }
  };

  const initColors = file => {
    return new Promise((resolve, reject) => {
      if (typeof file === 'object') {
        addColors(file);
        resolve();
      }
      fetch(file)
        .then(response => response.json())
        .then(json => {
          addColors(json);
          resolve();
        })
        .catch(() => {
          const error = 'Colors file ' + file + ' not found';
          Log.error(error);
          reject(error);
        });
    })
  };

  var version = "4.4.0";

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let AppInstance;

  const defaultOptions = {
    stage: { w: 1920, h: 1080, clearColor: 0x00000000, canvas2d: false },
    debug: false,
    defaultFontFace: 'RobotoRegular',
    keys: {
      8: 'Back',
      13: 'Enter',
      27: 'Menu',
      37: 'Left',
      38: 'Up',
      39: 'Right',
      40: 'Down',
      174: 'ChannelDown',
      175: 'ChannelUp',
      178: 'Stop',
      250: 'PlayPause',
      191: 'Search', // Use "/" for keyboard
      409: 'Search',
    },
  };

  if (window.innerHeight === 720) {
    defaultOptions.stage['w'] = 1280;
    defaultOptions.stage['h'] = 720;
    defaultOptions.stage['precision'] = 0.6666666667;
  }

  function Application(App, appData, platformSettings) {
    return class Application extends lng.Application {
      constructor(options) {
        const config = cjs(defaultOptions, options);
        super(config);
        this.config = config;
      }

      static _template() {
        return {
          w: 1920,
          h: 1080,
        }
      }

      _setup() {
        Promise.all([
          this.loadFonts((App.config && App.config.fonts) || (App.getFonts && App.getFonts()) || []),
          // to be deprecated
          Locale$1.load((App.config && App.config.locale) || (App.getLocale && App.getLocale())),
          App.language && this.loadLanguage(App.language()),
          App.colors && this.loadColors(App.colors()),
        ])
          .then(() => {
            Metrics$1.app.loaded();

            AppInstance = this.stage.c({
              ref: 'App',
              type: App,
              zIndex: 1,
              forceZIndexContext: !!platformSettings.showVersion || !!platformSettings.showFps,
            });

            this.childList.a(AppInstance);

            Log.info('App version', this.config.version);
            Log.info('SDK version', version);

            if (platformSettings.showVersion) {
              this.childList.a({
                ref: 'VersionLabel',
                type: VersionLabel,
                version: this.config.version,
                sdkVersion: version,
                zIndex: 1,
              });
            }

            if (platformSettings.showFps) {
              this.childList.a({
                ref: 'FpsCounter',
                type: FpsIndicator,
                zIndex: 1,
              });
            }

            super._setup();
          })
          .catch(console.error);
      }

      _handleBack() {
        this.closeApp();
      }

      _handleExit() {
        this.closeApp();
      }

      closeApp() {
        Log.info('Closing App');

        Settings.clearSubscribers();
        Registry.clear();

        if (platformSettings.onClose && typeof platformSettings.onClose === 'function') {
          platformSettings.onClose(...arguments);
        } else {
          this.close();
        }
      }

      close() {
        Log.info('Closing App');
        this.childList.remove(this.tag('App'));

        // force texture garbage collect
        this.stage.gc();
        this.destroy();
      }

      loadFonts(fonts) {
        return new Promise((resolve, reject) => {
          fonts
            .map(({ family, url, urls, descriptors }) => () => {
              const src = urls
                ? urls.map(url => {
                    return 'url(' + url + ')'
                  })
                : 'url(' + url + ')';
              const fontFace = new FontFace(family, src, descriptors || {});
              document.fonts.add(fontFace);
              return fontFace.load()
            })
            .reduce((promise, method) => {
              return promise.then(() => method())
            }, Promise.resolve(null))
            .then(resolve)
            .catch(reject);
        })
      }

      loadLanguage(config) {
        let file = Utils.asset('translations.json');
        let language = config;

        if (typeof language === 'object') {
          language = config.language || null;
          file = config.file || file;
        }

        return initLanguage(file, language)
      }

      loadColors(config) {
        let file = Utils.asset('colors.json');
        if (config && (typeof config === 'string' || typeof config === 'object')) {
          file = config;
        }
        return initColors(file)
      }

      set focus(v) {
        this._focussed = v;
        this._refocus();
      }

      _getFocused() {
        return this._focussed || this.tag('App')
      }
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @type {Lightning.Application}
   */
  let application;

  /**
   * Actual instance of the app
   * @type {Lightning.Component}
   */
  let app;

  /**
   * Component that hosts all routed pages
   * @type {Lightning.Component}
   */
  let pagesHost;

  /**
   * @type {Lightning.Stage}
   */
  let stage;

  /**
   * Platform driven Router configuration
   * @type {Map<string>}
   */
  let routerConfig;

  /**
   * Component that hosts all attached widgets
   * @type {Lightning.Component}
   */
  let widgetsHost;

  /**
   * Hash we point the browser to when we boot the app
   * and there is no deep-link provided
   * @type {string|Function}
   */
  let rootHash;

  /**
   * Boot request will fire before app start
   * can be used to execute some global logic
   * and can be configured
   */
  let bootRequest;

  /**
   * Flag if we need to update the browser location hash.
   * Router can work without.
   * @type {boolean}
   */
  let updateHash = true;

  /**
   * Will be called before a route starts, can be overridden
   * via routes config
   * @param from - route we came from
   * @param to - route we navigate to
   * @returns {Promise<*>}
   */
  // eslint-disable-next-line
  let beforeEachRoute = async (from, to)=>{
    return true
  };

  /**
   *  * Will be called after a navigate successfully resolved,
   * can be overridden via routes config
   * @param request
   */
  let afterEachRoute = request => {};

  /**
   * All configured routes
   * @type {Map<string, object>}
   */
  let routes = new Map();

  /**
   * Store all page components per route
   * @type {Map<string, object>}
   */
  let components = new Map();

  /**
   * Flag if router has been initialised
   * @type {boolean}
   */
  let initialised = false;

  /**
   * Current page being rendered on screen
   * @type {null}
   */

  let activeHash;
  let activePage = null;
  let activeRoute;

  /**
   *  During the process of a navigation request a new
   *  request can start, to prevent unwanted behaviour
   *  the navigate()-method stores the last accepted hash
   *  so we can invalidate any prior requests
   */
  let lastAcceptedHash;

  /**
   * With on()-data providing behaviour the Router forced the App
   * in a Loading state. When the data-provider resolves we want to
   * change the state back to where we came from
   */
  let previousState;

  const mixin = app => {
    // by default the Router Baseclass provides the component
    // reference in which we store our pages
    if (app.pages) {
      pagesHost = app.pages.childList;
    }
    // if the app is using widgets we grab refs
    // and hide all the widgets
    if (app.widgets && app.widgets.children) {
      widgetsHost = app.widgets.childList;
      // hide all widgets on boot
      widgetsHost.forEach(w => (w.visible = false));
    }
    app._handleBack = e => {
      step(-1);
      e.preventDefault();
    };
  };

  const bootRouter = (config, instance) => {
    let { appInstance, routes } = config;

    // if instance is provided and it's and Lightning Component instance
    if (instance && isPage(instance)) {
      app = instance;
    }
    if (!app) {
      app = appInstance || AppInstance;
    }

    application = app.application;
    pagesHost = application.childList;
    stage = app.stage;
    routerConfig = getConfigMap();

    mixin(app);

    if (isArray(routes)) {
      setup(config);
    } else if (isFunction(routes)) {
      console.warn('[Router]: Calling Router.route() directly is deprecated.');
      console.warn(
        'Use object config: https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration'
      );
    }
  };

  const setup = config => {
    if (!initialised) {
      init(config);
    }
    config.routes.forEach(r => {
      const path = cleanHash(r.path);
      if (!routeExists(path)) {
        const route = createRoute(r);
        routes.set(path, route);
        // if route has a configured component property
        // we store it in a different map to simplify
        // the creating and destroying per route
        if (route.component) {
          let type = route.component;
          if (isComponentConstructor(type)) {
            if (!routerConfig.get('lazyCreate')) {
              type = createComponent(stage, type);
              pagesHost.a(type);
            }
          }
          components.set(path, type);
        }
      } else {
        console.error(`${path} already exists in routes configuration`);
      }
    });
  };

  const init = config => {
    rootHash = config.root;
    if (isFunction(config.boot)) {
      bootRequest = config.boot;
    }
    if (isBoolean(config.updateHash)) {
      updateHash = config.updateHash;
    }
    if (isFunction(config.beforeEachRoute)) {
      beforeEachRoute = config.beforeEachRoute;
    }
    if (isFunction(config.afterEachRoute)) {
      afterEachRoute = config.afterEachRoute;
    }
    if (config.bootComponent) {
      console.warn(
        '[Router]: Boot Component is now available as a special router: https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration?id=special-routes'
      );
      console.warn(
        '[Router]: setting { bootComponent } property will be deprecated in a future release'
      );
      if (isPage(config.bootComponent)) {
        config.routes.push({
          path: '$',
          component: config.bootComponent,
          // we try to assign the bootRequest as after data-provider
          // so it will behave as any other component
          after: bootRequest || null,
          options: {
            preventStorage: true,
          },
        });
      } else {
        console.error(`[Router]: ${config.bootComponent} is not a valid boot component`);
      }
    }
    initialised = true;
  };

  const storeComponent = (route, type) => {
    if (components.has(route)) {
      components.set(route, type);
    }
  };

  const getComponent = route => {
    if (components.has(route)) {
      return components.get(route)
    }
    return null
  };
  /**
   * Test if router needs to update browser location hash
   * @returns {boolean}
   */
  const mustUpdateLocationHash = () => {
    if (!routerConfig || !routerConfig.size) {
      return false
    }
    // we need support to either turn change hash off
    // per platform or per app
    const updateConfig = routerConfig.get('updateHash');
    return !((isBoolean(updateConfig) && !updateConfig) || (isBoolean(updateHash) && !updateHash))
  };

  /**
   * Will be called when a new navigate() request has completed
   * and has not been expired due to it's async nature
   * @param request
   */
  const onRequestResolved = request => {
    const hash = request.hash;
    const route = request.route;
    const register = request.register;
    const page = request.page;

    // clean up history if modifier is set
    if (getOption(route.options, 'clearHistory')) {
      setHistory([]);
    } else if (hash && !isWildcard.test(route.path)) {
      updateHistory(request);
    }

    // we only update the stackLocation if a route
    // is not expired before it resolves
    storeComponent(route.path, page);

    if (request.isSharedInstance || !request.isCreated) {
      emit$1(page, 'changed');
    } else if (request.isCreated) {
      emit$1(page, 'mounted');
    }

    // only update widgets if we have a host
    if (widgetsHost) {
      updateWidgets(route.widgets, page);
    }

    // we want to clean up if there is an
    // active page that is not being shared
    // between current and previous route
    if (getActivePage() && !request.isSharedInstance) {
      cleanUp(activePage, request);
    }

    // provide history object to active page
    if (register.get(symbols.historyState) && isFunction(page.historyState)) {
      page.historyState(register.get(symbols.historyState));
    }

    setActivePage(page);

    activeHash = request.hash;
    activeRoute = route.path;

    // cleanup all cancelled requests
    for (let request of navigateQueue.values()) {
      if (request.isCancelled && request.hash) {
        navigateQueue.delete(request.hash);
      }
    }

    afterEachRoute(request);

    Log.info('[route]:', route.path);
    Log.info('[hash]:', hash);
  };

  const cleanUp = (page, request) => {
    const route = activeRoute;
    const register = request.register;
    const lazyDestroy = routerConfig.get('lazyDestroy');
    const destroyOnBack = routerConfig.get('destroyOnHistoryBack');
    const keepAlive = register.get('keepAlive');
    const isFromHistory = register.get(symbols.backtrack);

    let doCleanup = false;

    // if this request is executed due to a step back in history
    // and we have configured to destroy active page when we go back
    // in history or lazyDestory is enabled
    if (isFromHistory && (destroyOnBack || lazyDestroy)) {
      doCleanup = true;
    }

    // clean up if lazyDestroy is enabled and the keepAlive flag
    // in navigation register is false
    if (lazyDestroy && !keepAlive) {
      doCleanup = true;
    }

    // if the current and new request share the same route blueprint
    if (activeRoute === request.route.path) {
      doCleanup = true;
    }

    if (doCleanup) {
      // grab original class constructor if
      // statemachine routed else store constructor
      storeComponent(route, page._routedType || page.constructor);

      // actual remove of page from memory
      pagesHost.remove(page);

      // force texture gc() if configured
      // so we can cleanup textures in the same tick
      if (routerConfig.get('gcOnUnload')) {
        stage.gc();
      }
    } else {
      // If we're not removing the page we need to
      // reset it's properties
      page.patch({
        x: 0,
        y: 0,
        scale: 1,
        alpha: 1,
        visible: false,
      });
    }
  };

  const getActiveHash = () => {
    return activeHash
  };

  const setActivePage = page => {
    activePage = page;
  };

  const getActivePage = () => {
    return activePage
  };

  const getActiveRoute = () => {
    return activeRoute
  };

  const getLastHash = () => {
    return lastAcceptedHash
  };

  const setLastHash = hash => {
    lastAcceptedHash = hash;
  };

  const getPreviousState = () => {
    return previousState
  };

  const routeExists = key => {
    return routes.has(key)
  };

  const getRootHash = () => {
    return rootHash
  };

  const getBootRequest = () => {
    return bootRequest
  };

  const getRouterConfig = () => {
    return routerConfig
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const dataHooks = {
    on: request => {
      app.state || '';
      app._setState('Loading');
      return execProvider(request)
    },
    before: request => {
      return execProvider(request)
    },
    after: request => {
      try {
        execProvider(request, true);
      } catch (e) {
        // for now we fail silently
      }
      return Promise.resolve()
    },
  };

  const execProvider = (request, emitProvided) => {
    const route = request.route;
    const provider = route.provider;
    const expires = route.cache ? route.cache * 1000 : 0;
    const params = addPersistData(request);
    return provider.request(request.page, { ...params }).then(() => {
      request.page[symbols.expires] = Date.now() + expires;
      if (emitProvided) {
        emit$1(request.page, 'dataProvided');
      }
    })
  };

  const addPersistData = ({ page, route, hash, register = new Map() }) => {
    const urlValues = getValuesFromHash(hash, route.path);
    const queryParams = getQueryStringParams(hash);
    const pageData = new Map([...urlValues, ...register]);
    const params = {};

    // make dynamic url data available to the page
    // as instance properties
    for (let [name, value] of pageData) {
      params[name] = value;
    }

    if (queryParams) {
      params[symbols.queryParams] = queryParams;
    }

    // check navigation register for persistent data
    if (register.size) {
      const obj = {};
      for (let [k, v] of register) {
        obj[k] = v;
      }
      page.persist = obj;
    }

    // make url data and persist data available
    // via params property
    page.params = params;
    emit$1(page, ['urlParams'], params);

    return params
  };

  /**
   * Test if page passed cache-time
   * @param page
   * @returns {boolean}
   */
  const isPageExpired = page => {
    if (!page[symbols.expires]) {
      return false
    }

    const expires = page[symbols.expires];
    const now = Date.now();

    return now >= expires
  };

  const hasProvider = path => {
    if (routeExists(path)) {
      const record = routes.get(path);
      return !!record.provider
    }
    return false
  };

  const getProvider = route => {
    // @todo: fix, route already is passed in
    if (routeExists(route.path)) {
      const { provider } = routes.get(route.path);
      return {
        type: provider.type,
        provider: provider.request,
      }
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const fade = (i, o) => {
    return new Promise(resolve => {
      i.patch({
        alpha: 0,
        visible: true,
        smooth: {
          alpha: [1, { duration: 0.5, delay: 0.1 }],
        },
      });
      // resolve on y finish
      i.transition('alpha').on('finish', () => {
        if (o) {
          o.visible = false;
        }
        resolve();
      });
    })
  };

  const crossFade = (i, o) => {
    return new Promise(resolve => {
      i.patch({
        alpha: 0,
        visible: true,
        smooth: {
          alpha: [1, { duration: 0.5, delay: 0.1 }],
        },
      });
      if (o) {
        o.patch({
          smooth: {
            alpha: [0, { duration: 0.5, delay: 0.3 }],
          },
        });
      }
      // resolve on y finish
      i.transition('alpha').on('finish', () => {
        resolve();
      });
    })
  };

  const moveOnAxes = (axis, direction, i, o) => {
    const bounds = axis === 'x' ? 1920 : 1080;
    return new Promise(resolve => {
      i.patch({
        [`${axis}`]: direction ? bounds * -1 : bounds,
        visible: true,
        smooth: {
          [`${axis}`]: [0, { duration: 0.4, delay: 0.2 }],
        },
      });
      // out is optional
      if (o) {
        o.patch({
          [`${axis}`]: 0,
          smooth: {
            [`${axis}`]: [direction ? bounds : bounds * -1, { duration: 0.4, delay: 0.2 }],
          },
        });
      }
      // resolve on y finish
      i.transition(axis).on('finish', () => {
        resolve();
      });
    })
  };

  const up = (i, o) => {
    return moveOnAxes('y', 0, i, o)
  };

  const down = (i, o) => {
    return moveOnAxes('y', 1, i, o)
  };

  const left = (i, o) => {
    return moveOnAxes('x', 0, i, o)
  };

  const right = (i, o) => {
    return moveOnAxes('x', 1, i, o)
  };

  var Transitions = {
    fade,
    crossFade,
    up,
    down,
    left,
    right,
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * execute transition between new / old page and
   * toggle the defined widgets
   * @todo: platform override default transition
   * @param pageIn
   * @param pageOut
   */
  const executeTransition = (pageIn, pageOut = null) => {
    const transition = pageIn.pageTransition || pageIn.easing;
    const hasCustomTransitions = !!(pageIn.smoothIn || pageIn.smoothInOut || transition);
    const transitionsDisabled = getRouterConfig().get('disableTransitions');

    if (pageIn.easing) {
      console.warn('easing() method is deprecated and will be removed. Use pageTransition()');
    }

    // default behaviour is a visibility toggle
    if (!hasCustomTransitions || transitionsDisabled) {
      pageIn.visible = true;
      if (pageOut) {
        pageOut.visible = false;
      }
      return Promise.resolve()
    }

    if (transition) {
      let type;
      try {
        type = transition.call(pageIn, pageIn, pageOut);
      } catch (e) {
        type = 'crossFade';
      }

      if (isPromise(type)) {
        return type
      }

      if (isString$1(type)) {
        const fn = Transitions[type];
        if (fn) {
          return fn(pageIn, pageOut)
        }
      }

      // keep backwards compatible for now
      if (pageIn.smoothIn) {
        // provide a smooth function that resolves itself
        // on transition finish
        const smooth = (p, v, args = {}) => {
          return new Promise(resolve => {
            pageIn.visible = true;
            pageIn.setSmooth(p, v, args);
            pageIn.transition(p).on('finish', () => {
              resolve();
            });
          })
        };
        return pageIn.smoothIn({ pageIn, smooth })
      }
    }
    return Transitions.crossFade(pageIn, pageOut)
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * The actual loading of the component
   * */
  const load = async request => {
    let expired = false;
    try {
      request = await loader$1(request);
      if (request && !request.isCancelled) {
        // in case of on() providing we need to reset
        // app state;
        if (app.state === 'Loading') {
          if (getPreviousState() === 'Widgets') ; else {
            app._setState('');
          }
        }
        // Do page transition if instance
        // is not shared between the routes
        if (!request.isSharedInstance && !request.isCancelled) {
          await executeTransition(request.page, getActivePage());
        }
      } else {
        expired = true;
      }
      // on expired we only cleanup
      if (expired || request.isCancelled) {
        Log.debug('[router]:', `Rejected ${request.hash} because route to ${getLastHash()} started`);
        if (request.isCreated && !request.isSharedInstance) {
          // remove from render-tree
          pagesHost.remove(request.page);
        }
      } else {
        onRequestResolved(request);
        // resolve promise
        return request.page
      }
    } catch (request) {
      if (!request.route) {
        console.error(request);
      } else if (!expired) {
        // @todo: revisit
        const { route } = request;
        // clean up history if modifier is set
        if (getOption(route.options, 'clearHistory')) {
          setHistory([]);
        } else if (!isWildcard.test(route.path)) {
          updateHistory(request);
        }

        if (request.isCreated && !request.isSharedInstance) {
          // remove from render-tree
          pagesHost.remove(request.page);
        }
        handleError(request);
      }
    }
  };

  const loader$1 = async request => {
    const route = request.route;
    const hash = request.hash;
    const register = request.register;

    // todo: grab from Route instance
    let type = getComponent(route.path);
    let isConstruct = isComponentConstructor(type);
    let provide = false;

    // if it's an instance bt we're not coming back from
    // history we test if we can re-use this instance
    if (!isConstruct && !register.get(symbols.backtrack)) {
      if (!mustReuse(route)) {
        type = type.constructor;
        isConstruct = true;
      }
    }

    // If page is Lightning Component instance
    if (!isConstruct) {
      request.page = type;
      // if we have have a data route for current page
      if (hasProvider(route.path)) {
        if (isPageExpired(type) || type[symbols.hash] !== hash) {
          provide = true;
        }
      }
      let currentRoute = getActivePage() && getActivePage()[symbols.route];
      // if the new route is equal to the current route it means that both
      // route share the Component instance and stack location / since this case
      // is conflicting with the way before() and after() loading works we flag it,
      // and check platform settings in we want to re-use instance
      if (route.path === currentRoute) {
        request.isSharedInstance = true;
        // since we're re-using the instance we must attach
        // historyState to the request to prevent it from
        // being overridden.
        if (isFunction(request.page.historyState)) {
          request.copiedHistoryState = request.page.historyState();
        }
      }
    } else {
      request.page = createComponent(stage, type);
      pagesHost.a(request.page);
      // test if need to request data provider
      if (hasProvider(route.path)) {
        provide = true;
      }
      request.isCreated = true;
    }

    // we store hash and route as properties on the page instance
    // that way we can easily calculate new behaviour on page reload
    request.page[symbols.hash] = hash;
    request.page[symbols.route] = route.path;

    try {
      if (provide) {
        // extract attached data-provider for route
        // we're processing
        const { type: loadType, provider } = getProvider(route);

        // update running request
        request.provider = provider;
        request.providerType = loadType;

        await dataHooks[loadType](request);

        // we early exit if the current request is expired
        if (hash !== getLastHash()) {
          return false
        } else {
          if (request.providerType !== 'after') {
            emit$1(request.page, 'dataProvided');
          }
          // resolve promise
          return request
        }
      } else {
        addPersistData(request);
        return request
      }
    } catch (e) {
      request.error = e;
      return Promise.reject(request)
    }
  };

  const handleError = request => {
    if (request && request.error) {
      console.error(request.error);
    } else if (request) {
      Log.error(request);
    }

    if (request.page && routeExists('!')) {
      navigate('!', { request }, false);
    }
  };

  const mustReuse = route => {
    const opt = getOption(route.options, 'reuseInstance');
    const config = routerConfig.get('reuseInstance');

    // route always has final decision
    if (isBoolean(opt)) {
      return opt
    }
    return !(isBoolean(config) && config === false)
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class RoutedApp extends lng.Component {
    static _template() {
      return {
        Pages: {
          forceZIndexContext: true,
        },
        /**
         * This is a default Loading page that will be made visible
         * during data-provider on() you CAN override in child-class
         */
        Loading: {
          rect: true,
          w: 1920,
          h: 1080,
          color: 0xff000000,
          visible: false,
          zIndex: 99,
          Label: {
            mount: 0.5,
            x: 960,
            y: 540,
            text: {
              text: 'Loading..',
            },
          },
        },
      }
    }

    static _states() {
      return [
        class Loading extends this {
          $enter() {
            this.tag('Loading').visible = true;
          }

          $exit() {
            this.tag('Loading').visible = false;
          }
        },
        class Widgets extends this {
          $enter(args, widget) {
            // store widget reference
            this._widget = widget;

            // since it's possible that this behaviour
            // is non-remote driven we force a recalculation
            // of the focuspath
            this._refocus();
          }

          _getFocused() {
            // we delegate focus to selected widget
            // so it can consume remotecontrol presses
            return this._widget
          }

          // if we want to widget to widget focus delegation
          reload(widget) {
            this._widget = widget;
            this._refocus();
          }

          _handleKey() {
            const restoreFocus = routerConfig.get('autoRestoreRemote');
            /**
             * The Router used to delegate focus back to the page instance on
             * every unhandled key. This is barely usefull in any situation
             * so for now we offer the option to explicity turn that behaviour off
             * so we don't don't introduce a breaking change.
             */
            if (!isBoolean(restoreFocus) || restoreFocus === true) {
              Router.focusPage();
            }
          }
        },
      ]
    }

    /**
     * Return location where pages need to be stored
     */
    get pages() {
      return this.tag('Pages')
    }

    /**
     * Tell router where widgets are stored
     */
    get widgets() {
      return this.tag('Widgets')
    }

    /**
     * we MUST register _handleBack method so the Router
     * can override it
     * @private
     */
    _handleBack() {}

    /**
     * We MUST return Router.activePage() so the new Page
     * can listen to the remote-control.
     */
    _getFocused() {
      return Router.getActivePage()
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /*
  rouThor ==[x]
   */
  let navigateQueue = new Map();
  let forcedHash = '';
  let resumeHash = '';

  /**
   * Start routing the app
   * @param config - route config object
   * @param instance - instance of the app
   */
  const startRouter = (config, instance) => {
    bootRouter(config, instance);
    registerListener();
    start();
  };

  // start translating url
  const start = () => {
    let hash = (getHash() || '').replace(/^#/, '');
    const bootKey = '$';
    const params = getQueryStringParams(hash);
    const bootRequest = getBootRequest();
    const rootHash = getRootHash();
    const isDirectLoad = hash.indexOf(bootKey) !== -1;

    // prevent direct reload of wildcard routes
    // expect bootComponent
    if (isWildcard.test(hash) && hash !== bootKey) {
      hash = '';
    }

    // store resume point for manual resume
    resumeHash = isDirectLoad ? rootHash : hash || rootHash;

    const ready = () => {
      if (!hash && rootHash) {
        if (isString$1(rootHash)) {
          navigate(rootHash);
        } else if (isFunction(rootHash)) {
          rootHash().then(res => {
            if (isObject$1(res)) {
              navigate(res.path, res.params);
            } else {
              navigate(res);
            }
          });
        }
      } else {
        queue(hash);
        handleHashChange()
          .then(() => {
            app._refocus();
          })
          .catch(e => {
            console.error(e);
          });
      }
    };

    if (routeExists(bootKey)) {
      if (hash && !isDirectLoad) {
        if (!getRouteByHash(hash)) {
          navigate('*', { failedHash: hash });
          return
        }
      }
      navigate(
        bootKey,
        {
          resume: resumeHash,
          reload: bootKey === hash,
        },
        false
      );
    } else if (isFunction(bootRequest)) {
      bootRequest(params)
        .then(() => {
          ready();
        })
        .catch(e => {
          handleBootError(e);
        });
    } else {
      ready();
    }
  };

  const handleBootError = e => {
    if (routeExists('!')) {
      navigate('!', { request: { error: e } });
    } else {
      console.error(e);
    }
  };

  /**
   * start a new request
   * @param url
   * @param args
   * @param store
   */
  const navigate = (url, args = {}, store) => {
    if (isObject$1(url)) {
      url = getHashByName(url);
      if (!url) {
        return
      }
    }

    let hash = getHash();
    if (!mustUpdateLocationHash() && forcedHash) {
      hash = forcedHash;
    }
    if (hash.replace(/^#/, '') !== url) {
      // push request in the queue
      queue(url, args, store);

      setHash(url);
      if (!mustUpdateLocationHash()) {
        forcedHash = url;
        handleHashChange(url)
          .then(() => {
            app._refocus();
          })
          .catch(e => {
            console.error(e);
          });
      }
    } else if (args.reload) {
      // push request in the queue
      queue(url, args, store);

      handleHashChange(url)
        .then(() => {
          app._refocus();
        })
        .catch(e => {
          console.error(e);
        });
    }
  };

  const queue = (hash, args = {}, store) => {
    hash = cleanHash(hash);
    if (!navigateQueue.has(hash)) {
      for (let request of navigateQueue.values()) {
        request.cancel();
      }
      const request = createRequest(hash, args, store);
      navigateQueue.set(decodeURIComponent(hash), request);

      return request
    }
    return false
  };

  /**
   * Handle change of hash
   * @param override
   * @returns {Promise<void>}
   */
  const handleHashChange = async override => {
    const hash = cleanHash(override || getHash());
    const queueId = decodeURIComponent(hash);
    let request = navigateQueue.get(queueId);

    // handle hash updated manually
    if (!request && !navigateQueue.size) {
      request = queue(hash);
    }

    const route = getRouteByHash(hash);

    if (!route) {
      if (routeExists('*')) {
        navigate('*', { failedHash: hash });
      } else {
        console.error(`Unable to navigate to: ${hash}`);
      }
      return
    }

    // update current processed request
    request.hash = hash;
    request.route = route;

    let result = await beforeEachRoute(getActiveHash(), request);

    // test if a local hook is configured for the route
    if (route.beforeNavigate) {
      result = await route.beforeNavigate(getActiveHash(), request);
    }

    if (isBoolean(result)) {
      // only if resolve value is explicitly true
      // we continue the current route request
      if (result) {
        return resolveHashChange(request)
      }
    } else {
      // if navigation guard didn't return true
      // we cancel the current request
      request.cancel();
      navigateQueue.delete(queueId);

      if (isString$1(result)) {
        navigate(result);
      } else if (isObject$1(result)) {
        let store = true;
        if (isBoolean(result.store)) {
          store = result.store;
        }
        navigate(result.path, result.params, store);
      }
    }
  };

  /**
   * Continue processing the hash change if not blocked
   * by global or local hook
   * @param request - {}
   */
  const resolveHashChange = request => {
    const hash = request.hash;
    const route = request.route;
    const queueId = decodeURIComponent(hash);
    // store last requested hash so we can
    // prevent a route that resolved later
    // from displaying itself
    setLastHash(hash);

    if (route.path) {
      const component = getComponent(route.path);
      // if a hook is provided for the current route
      if (isFunction(route.hook)) {
        const urlParams = getValuesFromHash(hash, route.path);
        const params = {};
        for (const key of urlParams.keys()) {
          params[key] = urlParams.get(key);
        }
        route.hook(app, { ...params });
      }
      // if there is a component attached to the route
      if (component) {
        // to prevent shared state issues between same routes
        // we force page to root state
        const activePage = getActivePage();
        if (activePage) {
          activePage._setState('');
        }

        if (isPage(component)) {
          load(request).then(() => {
            app._refocus();
            navigateQueue.delete(queueId);
          });
        } else {
          // of the component is not a constructor
          // or a Component instance we can assume
          // that it's a dynamic import
          component()
            .then(contents => {
              return contents.default
            })
            .then(module => {
              storeComponent(route.path, module);
              return load(request)
            })
            .then(() => {
              app._refocus();
              navigateQueue.delete(queueId);
            });
        }
      } else {
        navigateQueue.delete(queueId);
      }
    }
  };

  /**
   * Directional step in history
   * @param direction
   */
  const step = (level = 0) => {
    if (!level || isNaN(level)) {
      return false
    }
    const history = getHistory();
    // for now we only support negative numbers
    level = Math.abs(level);

    // we can't step back past the amount
    // of history entries
    if (level > history.length) {
      if (isFunction(app._handleAppClose)) {
        return app._handleAppClose()
      }
      return false
    } else if (history.length) {
      // for now we only support history back
      const route = history.splice(history.length - level, level)[0];
      // store changed history
      setHistory(history);
      return navigate(
        route.hash,
        {
          [symbols.backtrack]: true,
          [symbols.historyState]: route.state,
        },
        false
      )
    } else if (routerConfig.get('backtrack')) {
      const hashLastPart = /(\/:?[\w%\s-]+)$/;
      let hash = stripRegex(getHash());
      let floor = getFloor(hash);

      // test if we got deep-linked
      if (floor > 1) {
        while (floor--) {
          // strip of last part
          hash = hash.replace(hashLastPart, '');
          // if we have a configured route
          // we navigate to it
          if (getRouteByHash(hash)) {
            return navigate(hash, { [symbols.backtrack]: true }, false)
          }
        }
      }
    }
    return false
  };

  /**
   * Resume Router's page loading process after
   * the BootComponent became visible;
   */
  const resume = () => {
    if (isString$1(resumeHash)) {
      navigate(resumeHash, false);
    } else if (isFunction(resumeHash)) {
      resumeHash().then(res => {
        if (isObject$1(res)) {
          navigate(res.path, res.params);
        } else {
          navigate(res);
        }
      });
    } else {
      console.warn('[Router]: resume() called but no hash found');
    }
  };

  /**
   * Query if the Router is still processing a Request
   * @returns {boolean}
   */
  const isNavigating = () => {
    if (navigateQueue.size) {
      let isProcessing = false;
      for (let request of navigateQueue.values()) {
        if (!request.isCancelled) {
          isProcessing = true;
        }
      }
      return isProcessing
    }
    return false
  };

  /**
   * By default we return the location hash
   * @returns {string}
   */
  let getHash = () => {
    return document.location.hash
  };

  /**
   * Update location hash
   * @param url
   */
  let setHash = url => {
    document.location.hash = url;
  };

  /**
   * This can be called from the platform / bootstrapper to override
   * the default getting and setting of the hash
   * @param config
   */
  const initRouter = config => {
    if (config.getHash) {
      getHash = config.getHash;
    }
    if (config.setHash) {
      setHash = config.setHash;
    }
  };

  /**
   * On hash change we start processing
   */
  const registerListener = () => {
    Registry.addEventListener(window, 'hashchange', async () => {
      if (mustUpdateLocationHash()) {
        try {
          await handleHashChange();
        } catch (e) {
          console.error(e);
        }
      }
    });
  };
  // export API
  var Router = {
    startRouter,
    navigate,
    resume,
    step,
    go: step,
    back: step.bind(null, -1),
    activePage: getActivePage,
    getActivePage() {
      // warning
      return getActivePage()
    },
    getActiveRoute,
    getActiveHash,
    focusWidget,
    getActiveWidget,
    restoreFocus,
    isNavigating,
    getHistory,
    setHistory,
    getHistoryState,
    replaceHistoryState,
    symbols,
    App: RoutedApp,
    // keep backwards compatible
    focusPage: restoreFocus,
    /**
     * Deprecated api methods
     */
    setupRoutes() {
      console.warn('Router: setupRoutes is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },
    on() {
      console.warn('Router.on() is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },
    before() {
      console.warn('Router.before() is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },
    after() {
      console.warn('Router.after() is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const defaultChannels = [
    {
      number: 1,
      name: 'Metro News 1',
      description: 'New York Cable News Channel',
      entitled: true,
      program: {
        title: 'The Morning Show',
        description: "New York's best morning show",
        startTime: new Date(new Date() - 60 * 5 * 1000).toUTCString(), // started 5 minutes ago
        duration: 60 * 30, // 30 minutes
        ageRating: 0,
      },
    },
    {
      number: 2,
      name: 'MTV',
      description: 'Music Television',
      entitled: true,
      program: {
        title: 'Beavis and Butthead',
        description: 'American adult animated sitcom created by Mike Judge',
        startTime: new Date(new Date() - 60 * 20 * 1000).toUTCString(), // started 20 minutes ago
        duration: 60 * 45, // 45 minutes
        ageRating: 18,
      },
    },
    {
      number: 3,
      name: 'NBC',
      description: 'NBC TV Network',
      entitled: false,
      program: {
        title: 'The Tonight Show Starring Jimmy Fallon',
        description: 'Late-night talk show hosted by Jimmy Fallon on NBC',
        startTime: new Date(new Date() - 60 * 10 * 1000).toUTCString(), // started 10 minutes ago
        duration: 60 * 60, // 1 hour
        ageRating: 10,
      },
    },
  ];

  const channels = () => Settings.get('platform', 'tv', defaultChannels);

  const randomChannel = () => channels()[~~(channels.length * Math.random())];

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let currentChannel;
  const callbacks = {};

  const emit = (event, ...args) => {
    callbacks[event] &&
      callbacks[event].forEach(cb => {
        cb.apply(null, args);
      });
  };

  // local mock methods
  let methods = {
    getChannel() {
      if (!currentChannel) currentChannel = randomChannel();
      return new Promise((resolve, reject) => {
        if (currentChannel) {
          const channel = { ...currentChannel };
          delete channel.program;
          resolve(channel);
        } else {
          reject('No channel found');
        }
      })
    },
    getProgram() {
      if (!currentChannel) currentChannel = randomChannel();
      return new Promise((resolve, reject) => {
        currentChannel.program ? resolve(currentChannel.program) : reject('No program found');
      })
    },
    setChannel(number) {
      return new Promise((resolve, reject) => {
        if (number) {
          const newChannel = channels().find(c => c.number === number);
          if (newChannel) {
            currentChannel = newChannel;
            const channel = { ...currentChannel };
            delete channel.program;
            emit('channelChange', channel);
            resolve(channel);
          } else {
            reject('Channel not found');
          }
        } else {
          reject('No channel number supplied');
        }
      })
    },
  };

  const initTV = config => {
    methods = {};
    if (config.getChannel && typeof config.getChannel === 'function') {
      methods.getChannel = config.getChannel;
    }
    if (config.getProgram && typeof config.getProgram === 'function') {
      methods.getProgram = config.getProgram;
    }
    if (config.setChannel && typeof config.setChannel === 'function') {
      methods.setChannel = config.setChannel;
    }
    if (config.emit && typeof config.emit === 'function') {
      config.emit(emit);
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const initPurchase = config => {
    if (config.billingUrl) ;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let ApplicationInstance;

  var Launch = (App, appSettings, platformSettings, appData) => {
    initSettings(appSettings, platformSettings);

    initUtils(platformSettings);
    initStorage();
    // Initialize plugins
    if (platformSettings.plugins) {
      platformSettings.plugins.profile && initProfile(platformSettings.plugins.profile);
      platformSettings.plugins.metrics && initMetrics(platformSettings.plugins.metrics);
      platformSettings.plugins.mediaPlayer && initMediaPlayer(platformSettings.plugins.mediaPlayer);
      platformSettings.plugins.mediaPlayer && initVideoPlayer(platformSettings.plugins.mediaPlayer);
      platformSettings.plugins.ads && initAds(platformSettings.plugins.ads);
      platformSettings.plugins.router && initRouter(platformSettings.plugins.router);
      platformSettings.plugins.tv && initTV(platformSettings.plugins.tv);
      platformSettings.plugins.purchase && initPurchase(platformSettings.plugins.purchase);
    }

    const app = Application(App, appData, platformSettings);
    ApplicationInstance = new app(appSettings);
    return ApplicationInstance
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class VideoTexture extends lng.Component {
    static _template() {
      return {
        Video: {
          alpha: 1,
          visible: false,
          pivot: 0.5,
          texture: { type: lng.textures.StaticTexture, options: {} },
        },
      }
    }

    set videoEl(v) {
      this._videoEl = v;
    }

    get videoEl() {
      return this._videoEl
    }

    get videoView() {
      return this.tag('Video')
    }

    get videoTexture() {
      return this.videoView.texture
    }

    get isVisible() {
      return this.videoView.alpha === 1 && this.videoView.visible === true
    }

    _init() {
      this._createVideoTexture();
    }

    _createVideoTexture() {
      const stage = this.stage;

      const gl = stage.gl;
      const glTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.videoTexture.options = { source: glTexture, w: this.videoEl.width, h: this.videoEl.height };

      this.videoView.w = this.videoEl.width / this.stage.getRenderPrecision();
      this.videoView.h = this.videoEl.height / this.stage.getRenderPrecision();
    }

    start() {
      const stage = this.stage;
      if (!this._updateVideoTexture) {
        this._updateVideoTexture = () => {
          if (this.videoTexture.options.source && this.videoEl.videoWidth && this.active) {
            const gl = stage.gl;

            const currentTime = new Date().getTime();

            // When BR2_PACKAGE_GST1_PLUGINS_BAD_PLUGIN_DEBUGUTILS is not set in WPE, webkitDecodedFrameCount will not be available.
            // We'll fallback to fixed 30fps in this case.
            const frameCount = this.videoEl.webkitDecodedFrameCount;

            const mustUpdate = frameCount
              ? this._lastFrame !== frameCount
              : this._lastTime < currentTime - 30;

            if (mustUpdate) {
              this._lastTime = currentTime;
              this._lastFrame = frameCount;
              try {
                gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
                this._lastFrame = this.videoEl.webkitDecodedFrameCount;
                this.videoView.visible = true;

                this.videoTexture.options.w = this.videoEl.width;
                this.videoTexture.options.h = this.videoEl.height;
                const expectedAspectRatio = this.videoView.w / this.videoView.h;
                const realAspectRatio = this.videoEl.width / this.videoEl.height;

                if (expectedAspectRatio > realAspectRatio) {
                  this.videoView.scaleX = realAspectRatio / expectedAspectRatio;
                  this.videoView.scaleY = 1;
                } else {
                  this.videoView.scaleY = expectedAspectRatio / realAspectRatio;
                  this.videoView.scaleX = 1;
                }
              } catch (e) {
                Log.error('texImage2d video', e);
                this.stop();
              }
              this.videoTexture.source.forceRenderUpdate();
            }
          }
        };
      }
      if (!this._updatingVideoTexture) {
        stage.on('frameStart', this._updateVideoTexture);
        this._updatingVideoTexture = true;
      }
    }

    stop() {
      const stage = this.stage;
      stage.removeListener('frameStart', this._updateVideoTexture);
      this._updatingVideoTexture = false;
      this.videoView.visible = false;

      if (this.videoTexture.options.source) {
        const gl = stage.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }

    position(top, left) {
      this.videoView.patch({
        smooth: {
          x: left,
          y: top,
        },
      });
    }

    size(width, height) {
      this.videoView.patch({
        smooth: {
          w: width,
          h: height,
        },
      });
    }

    show() {
      this.videoView.setSmooth('alpha', 1);
    }

    hide() {
      this.videoView.setSmooth('alpha', 0);
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let mediaUrl = url => url;
  let videoEl;
  let videoTexture;
  let metrics;
  let consumer$1;
  let precision = 1;
  let textureMode = false;

  const initVideoPlayer = config => {
    if (config.mediaUrl) {
      mediaUrl = config.mediaUrl;
    }
  };

  // todo: add this in a 'Registry' plugin
  // to be able to always clean this up on app close
  let eventHandlers = {};

  const state$1 = {
    adsEnabled: false,
    playing: false,
    _playingAds: false,
    get playingAds() {
      return this._playingAds
    },
    set playingAds(val) {
      if (this._playingAds !== val) {
        this._playingAds = val;
        fireOnConsumer$1(val === true ? 'AdStart' : 'AdEnd');
      }
    },
    skipTime: false,
    playAfterSeek: null,
  };

  const hooks = {
    play() {
      state$1.playing = true;
    },
    pause() {
      state$1.playing = false;
    },
    seeked() {
      state$1.playAfterSeek === true && videoPlayerPlugin.play();
      state$1.playAfterSeek = null;
    },
    abort() {
      deregisterEventListeners();
    },
  };

  const withPrecision = val => Math.round(precision * val) + 'px';

  const fireOnConsumer$1 = (event, args) => {
    if (consumer$1) {
      consumer$1.fire('$videoPlayer' + event, args, videoEl.currentTime);
      consumer$1.fire('$videoPlayerEvent', event, args, videoEl.currentTime);
    }
  };

  const fireHook = (event, args) => {
    hooks[event] && typeof hooks[event] === 'function' && hooks[event].call(null, event, args);
  };

  let customLoader = null;
  let customUnloader = null;

  const loader = (url, videoEl, config) => {
    return customLoader && typeof customLoader === 'function'
      ? customLoader(url, videoEl, config)
      : new Promise(resolve => {
          url = mediaUrl(url);
          videoEl.setAttribute('src', url);
          videoEl.load();
          resolve();
        })
  };

  const unloader = videoEl => {
    return customUnloader && typeof customUnloader === 'function'
      ? customUnloader(videoEl)
      : new Promise(resolve => {
          videoEl.removeAttribute('src');
          videoEl.load();
          resolve();
        })
  };

  const setupVideoTag = () => {
    const videoEls = document.getElementsByTagName('video');
    if (videoEls && videoEls.length) {
      return videoEls[0]
    } else {
      const videoEl = document.createElement('video');
      videoEl.setAttribute('id', 'video-player');
      videoEl.setAttribute('width', withPrecision(1920));
      videoEl.setAttribute('height', withPrecision(1080));
      videoEl.style.position = 'absolute';
      videoEl.style.zIndex = '1';
      videoEl.style.display = 'none';
      videoEl.style.visibility = 'hidden';
      videoEl.style.top = withPrecision(0);
      videoEl.style.left = withPrecision(0);
      videoEl.style.width = withPrecision(1920);
      videoEl.style.height = withPrecision(1080);
      document.body.appendChild(videoEl);
      return videoEl
    }
  };

  const setUpVideoTexture = () => {
    if (!ApplicationInstance.tag('VideoTexture')) {
      const el = ApplicationInstance.stage.c({
        type: VideoTexture,
        ref: 'VideoTexture',
        zIndex: 0,
        videoEl,
      });
      ApplicationInstance.childList.addAt(el, 0);
    }
    return ApplicationInstance.tag('VideoTexture')
  };

  const registerEventListeners = () => {
    Log.info('VideoPlayer', 'Registering event listeners');
    Object.keys(events$1).forEach(event => {
      const handler = e => {
        // Fire a metric for each event (if it exists on the metrics object)
        if (metrics && metrics[event] && typeof metrics[event] === 'function') {
          metrics[event]({ currentTime: videoEl.currentTime });
        }
        // fire an internal hook
        fireHook(event, { videoElement: videoEl, event: e });

        // fire the event (with human friendly event name) to the consumer of the VideoPlayer
        fireOnConsumer$1(events$1[event], { videoElement: videoEl, event: e });
      };

      eventHandlers[event] = handler;
      videoEl.addEventListener(event, handler);
    });
  };

  const deregisterEventListeners = () => {
    Log.info('VideoPlayer', 'Deregistering event listeners');
    Object.keys(eventHandlers).forEach(event => {
      videoEl.removeEventListener(event, eventHandlers[event]);
    });
    eventHandlers = {};
  };

  const videoPlayerPlugin = {
    consumer(component) {
      consumer$1 = component;
    },

    loader(loaderFn) {
      customLoader = loaderFn;
    },

    unloader(unloaderFn) {
      customUnloader = unloaderFn;
    },

    position(top = 0, left = 0) {
      videoEl.style.left = withPrecision(left);
      videoEl.style.top = withPrecision(top);
      if (textureMode === true) {
        videoTexture.position(top, left);
      }
    },

    size(width = 1920, height = 1080) {
      videoEl.style.width = withPrecision(width);
      videoEl.style.height = withPrecision(height);
      videoEl.width = parseFloat(videoEl.style.width);
      videoEl.height = parseFloat(videoEl.style.height);
      if (textureMode === true) {
        videoTexture.size(width, height);
      }
    },

    area(top = 0, right = 1920, bottom = 1080, left = 0) {
      this.position(top, left);
      this.size(right - left, bottom - top);
    },

    open(url, config = {}) {
      if (!this.canInteract) return
      metrics = Metrics$1.media(url);

      this.hide();
      deregisterEventListeners();

      if (this.src == url) {
        this.clear().then(this.open(url, config));
      } else {
        const adConfig = { enabled: state$1.adsEnabled, duration: 300 };
        if (config.videoId) {
          adConfig.caid = config.videoId;
        }
        Ads.get(adConfig, consumer$1).then(ads => {
          state$1.playingAds = true;
          ads.prerolls().then(() => {
            state$1.playingAds = false;
            loader(url, videoEl, config).then(() => {
              registerEventListeners();
              this.show();
              this.play();
            });
          });
        });
      }
    },

    reload() {
      if (!this.canInteract) return
      const url = videoEl.getAttribute('src');
      this.close();
      this.open(url);
    },

    close() {
      Ads.cancel();
      if (state$1.playingAds) {
        state$1.playingAds = false;
        Ads.stop();
        // call self in next tick
        setTimeout(() => {
          this.close();
        });
      }
      if (!this.canInteract) return
      this.clear();
      this.hide();
      deregisterEventListeners();
    },

    clear() {
      if (!this.canInteract) return
      // pause the video first to disable sound
      this.pause();
      if (textureMode === true) videoTexture.stop();
      return unloader(videoEl).then(() => {
        fireOnConsumer$1('Clear', { videoElement: videoEl });
      })
    },

    play() {
      if (!this.canInteract) return
      if (textureMode === true) videoTexture.start();
      videoEl.play();
    },

    pause() {
      if (!this.canInteract) return
      videoEl.pause();
    },

    playPause() {
      if (!this.canInteract) return
      this.playing === true ? this.pause() : this.play();
    },

    mute(muted = true) {
      if (!this.canInteract) return
      videoEl.muted = muted;
    },

    loop(looped = true) {
      videoEl.loop = looped;
    },

    seek(time) {
      if (!this.canInteract) return
      if (!this.src) return
      // define whether should continue to play after seek is complete (in seeked hook)
      if (state$1.playAfterSeek === null) {
        state$1.playAfterSeek = !!state$1.playing;
      }
      // pause before actually seeking
      this.pause();
      // currentTime always between 0 and the duration of the video (minus 0.1s to not set to the final frame and stall the video)
      videoEl.currentTime = Math.max(0, Math.min(time, this.duration - 0.1));
    },

    skip(seconds) {
      if (!this.canInteract) return
      if (!this.src) return

      state$1.skipTime = (state$1.skipTime || videoEl.currentTime) + seconds;
      easeExecution(() => {
        this.seek(state$1.skipTime);
        state$1.skipTime = false;
      }, 300);
    },

    show() {
      if (!this.canInteract) return
      if (textureMode === true) {
        videoTexture.show();
      } else {
        videoEl.style.display = 'block';
        videoEl.style.visibility = 'visible';
      }
    },

    hide() {
      if (!this.canInteract) return
      if (textureMode === true) {
        videoTexture.hide();
      } else {
        videoEl.style.display = 'none';
        videoEl.style.visibility = 'hidden';
      }
    },

    enableAds(enabled = true) {
      state$1.adsEnabled = enabled;
    },

    /* Public getters */
    get duration() {
      return videoEl && (isNaN(videoEl.duration) ? Infinity : videoEl.duration)
    },

    get currentTime() {
      return videoEl && videoEl.currentTime
    },

    get muted() {
      return videoEl && videoEl.muted
    },

    get looped() {
      return videoEl && videoEl.loop
    },

    get src() {
      return videoEl && videoEl.getAttribute('src')
    },

    get playing() {
      return state$1.playing
    },

    get playingAds() {
      return state$1.playingAds
    },

    get canInteract() {
      // todo: perhaps add an extra flag wether we allow interactions (i.e. pauze, mute, etc.) during ad playback
      return state$1.playingAds === false
    },

    get top() {
      return videoEl && parseFloat(videoEl.style.top)
    },

    get left() {
      return videoEl && parseFloat(videoEl.style.left)
    },

    get bottom() {
      return videoEl && parseFloat(videoEl.style.top - videoEl.style.height)
    },

    get right() {
      return videoEl && parseFloat(videoEl.style.left - videoEl.style.width)
    },

    get width() {
      return videoEl && parseFloat(videoEl.style.width)
    },

    get height() {
      return videoEl && parseFloat(videoEl.style.height)
    },

    get visible() {
      if (textureMode === true) {
        return videoTexture.isVisible
      } else {
        return videoEl && videoEl.style.display === 'block'
      }
    },

    get adsEnabled() {
      return state$1.adsEnabled
    },

    // prefixed with underscore to indicate 'semi-private'
    // because it's not recommended to interact directly with the video element
    get _videoEl() {
      return videoEl
    },
  };

  autoSetupMixin(videoPlayerPlugin, () => {
    precision =
      (ApplicationInstance &&
        ApplicationInstance.stage &&
        ApplicationInstance.stage.getRenderPrecision()) ||
      precision;

    videoEl = setupVideoTag();

    textureMode = Settings.get('platform', 'textureMode', false);
    if (textureMode === true) {
      videoEl.setAttribute('crossorigin', 'anonymous');
      videoTexture = setUpVideoTexture();
    }
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let consumer;

  let getAds = () => {
    // todo: enable some default ads during development, maybe from the settings.json
    return Promise.resolve({
      prerolls: [],
      midrolls: [],
      postrolls: [],
    })
  };

  const initAds = config => {
    if (config.getAds) {
      getAds = config.getAds;
    }
  };

  const state = {
    active: false,
  };

  const playSlot = (slot = []) => {
    return slot.reduce((promise, ad) => {
      return promise.then(() => {
        return playAd(ad)
      })
    }, Promise.resolve(null))
  };

  const playAd = ad => {
    return new Promise(resolve => {
      if (state.active === false) {
        Log.info('Ad', 'Skipping add due to inactive state');
        return resolve()
      }
      // is it safe to rely on videoplayer plugin already created the video tag?
      const videoEl = document.getElementsByTagName('video')[0];
      videoEl.style.display = 'block';
      videoEl.style.visibility = 'visible';
      videoEl.src = mediaUrl(ad.url);
      videoEl.load();

      let timeEvents = null;
      let timeout;

      const cleanup = () => {
        // remove all listeners
        Object.keys(handlers).forEach(handler =>
          videoEl.removeEventListener(handler, handlers[handler])
        );
        resolve();
      };
      const handlers = {
        play() {
          Log.info('Ad', 'Play ad', ad.url);
          fireOnConsumer('Play', ad);
          sendBeacon(ad.callbacks, 'defaultImpression');
        },
        ended() {
          fireOnConsumer('Ended', ad);
          sendBeacon(ad.callbacks, 'complete');
          cleanup();
        },
        timeupdate() {
          if (!timeEvents && videoEl.duration) {
            // calculate when to fire the time based events (now that duration is known)
            timeEvents = {
              firstQuartile: videoEl.duration / 4,
              midPoint: videoEl.duration / 2,
              thirdQuartile: (videoEl.duration / 4) * 3,
            };
            Log.info('Ad', 'Calculated quartiles times', { timeEvents });
          }
          if (
            timeEvents &&
            timeEvents.firstQuartile &&
            videoEl.currentTime >= timeEvents.firstQuartile
          ) {
            fireOnConsumer('FirstQuartile', ad);
            delete timeEvents.firstQuartile;
            sendBeacon(ad.callbacks, 'firstQuartile');
          }
          if (timeEvents && timeEvents.midPoint && videoEl.currentTime >= timeEvents.midPoint) {
            fireOnConsumer('MidPoint', ad);
            delete timeEvents.midPoint;
            sendBeacon(ad.callbacks, 'midPoint');
          }
          if (
            timeEvents &&
            timeEvents.thirdQuartile &&
            videoEl.currentTime >= timeEvents.thirdQuartile
          ) {
            fireOnConsumer('ThirdQuartile', ad);
            delete timeEvents.thirdQuartile;
            sendBeacon(ad.callbacks, 'thirdQuartile');
          }
        },
        stalled() {
          fireOnConsumer('Stalled', ad);
          timeout = setTimeout(() => {
            cleanup();
          }, 5000); // make timeout configurable
        },
        canplay() {
          timeout && clearTimeout(timeout);
        },
        error() {
          fireOnConsumer('Error', ad);
          cleanup();
        },
        // this doesn't work reliably on sky box, moved logic to timeUpdate event
        // loadedmetadata() {
        //   // calculate when to fire the time based events (now that duration is known)
        //   timeEvents = {
        //     firstQuartile: videoEl.duration / 4,
        //     midPoint: videoEl.duration / 2,
        //     thirdQuartile: (videoEl.duration / 4) * 3,
        //   }
        // },
        abort() {
          cleanup();
        },
        // todo: pause, resume, mute, unmute beacons
      };
      // add all listeners
      Object.keys(handlers).forEach(handler => videoEl.addEventListener(handler, handlers[handler]));

      videoEl.play();
    })
  };

  const sendBeacon = (callbacks, event) => {
    if (callbacks && callbacks[event]) {
      Log.info('Ad', 'Sending beacon', event, callbacks[event]);
      return callbacks[event].reduce((promise, url) => {
        return promise.then(() =>
          fetch(url)
            // always resolve, also in case of a fetch error (so we don't block firing the rest of the beacons for this event)
            // note: for fetch failed http responses don't throw an Error :)
            .then(response => {
              if (response.status === 200) {
                fireOnConsumer('Beacon' + event + 'Sent');
              } else {
                fireOnConsumer('Beacon' + event + 'Failed' + response.status);
              }
              Promise.resolve(null);
            })
            .catch(() => {
              Promise.resolve(null);
            })
        )
      }, Promise.resolve(null))
    } else {
      Log.info('Ad', 'No callback found for ' + event);
    }
  };

  const fireOnConsumer = (event, args) => {
    if (consumer) {
      consumer.fire('$ad' + event, args);
      consumer.fire('$adEvent', event, args);
    }
  };

  var Ads = {
    get(config, videoPlayerConsumer) {
      if (config.enabled === false) {
        return Promise.resolve({
          prerolls() {
            return Promise.resolve()
          },
        })
      }
      consumer = videoPlayerConsumer;

      return new Promise(resolve => {
        Log.info('Ad', 'Starting session');
        getAds(config).then(ads => {
          Log.info('Ad', 'API result', ads);
          resolve({
            prerolls() {
              if (ads.preroll) {
                state.active = true;
                fireOnConsumer('PrerollSlotImpression', ads);
                sendBeacon(ads.preroll.callbacks, 'slotImpression');
                return playSlot(ads.preroll.ads).then(() => {
                  fireOnConsumer('PrerollSlotEnd', ads);
                  sendBeacon(ads.preroll.callbacks, 'slotEnd');
                  state.active = false;
                })
              }
              return Promise.resolve()
            },
            midrolls() {
              return Promise.resolve()
            },
            postrolls() {
              return Promise.resolve()
            },
          });
        });
      })
    },
    cancel() {
      Log.info('Ad', 'Cancel Ad');
      state.active = false;
    },
    stop() {
      Log.info('Ad', 'Stop Ad');
      state.active = false;
      // fixme: duplication
      const videoEl = document.getElementsByTagName('video')[0];
      videoEl.pause();
      videoEl.removeAttribute('src');
    },
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class ScaledImageTexture extends lng.textures.ImageTexture {
    constructor(stage) {
      super(stage);
      this._scalingOptions = undefined;
    }

    set options(options) {
      this.resizeMode = this._scalingOptions = options;
    }

    _getLookupId() {
      return `${this._src}-${this._scalingOptions.type}-${this._scalingOptions.w}-${this._scalingOptions.h}`
    }

    getNonDefaults() {
      const obj = super.getNonDefaults();
      if (this._src) {
        obj.src = this._src;
      }
      return obj
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class PinInput extends lng.Component {
    static _template() {
      return {
        w: 120,
        h: 150,
        rect: true,
        color: 0xff949393,
        alpha: 0.5,
        shader: { type: lng.shaders.RoundedRectangle, radius: 10 },
        Nr: {
          w: w => w,
          y: 24,
          text: {
            text: '',
            textColor: 0xff333333,
            fontSize: 80,
            textAlign: 'center',
            verticalAlign: 'middle',
          },
        },
      }
    }

    set index(v) {
      this.x = v * (120 + 24);
    }

    set nr(v) {
      this._timeout && clearTimeout(this._timeout);

      if (v) {
        this.setSmooth('alpha', 1);
      } else {
        this.setSmooth('alpha', 0.5);
      }

      this.tag('Nr').patch({
        text: {
          text: (v && v.toString()) || '',
          fontSize: v === '*' ? 120 : 80,
        },
      });

      if (v && v !== '*') {
        this._timeout = setTimeout(() => {
          this._timeout = null;
          this.nr = '*';
        }, 750);
      }
    }
  }

  class PinDialog extends lng.Component {
    static _template() {
      return {
        zIndex: 1,
        w: w => w,
        h: h => h,
        rect: true,
        color: 0xdd000000,
        alpha: 0.000001,
        Dialog: {
          w: 648,
          h: 320,
          y: h => (h - 320) / 2,
          x: w => (w - 648) / 2,
          rect: true,
          color: 0xdd333333,
          shader: { type: lng.shaders.RoundedRectangle, radius: 10 },
          Info: {
            y: 24,
            x: 48,
            text: { text: 'Please enter your PIN', fontSize: 32 },
          },
          Msg: {
            y: 260,
            x: 48,
            text: { text: '', fontSize: 28, textColor: 0xffffffff },
          },
          Code: {
            x: 48,
            y: 96,
          },
        },
      }
    }

    _init() {
      const children = [];
      for (let i = 0; i < 4; i++) {
        children.push({
          type: PinInput,
          index: i,
        });
      }

      this.tag('Code').children = children;
    }

    get pin() {
      if (!this._pin) this._pin = '';
      return this._pin
    }

    set pin(v) {
      if (v.length <= 4) {
        const maskedPin = new Array(Math.max(v.length - 1, 0)).fill('*', 0, v.length - 1);
        v.length && maskedPin.push(v.length > this._pin.length ? v.slice(-1) : '*');
        for (let i = 0; i < 4; i++) {
          this.tag('Code').children[i].nr = maskedPin[i] || '';
        }
        this._pin = v;
      }
    }

    get msg() {
      if (!this._msg) this._msg = '';
      return this._msg
    }

    set msg(v) {
      this._timeout && clearTimeout(this._timeout);

      this._msg = v;
      if (this._msg) {
        this.tag('Msg').text = this._msg;
        this.tag('Info').setSmooth('alpha', 0.5);
        this.tag('Code').setSmooth('alpha', 0.5);
      } else {
        this.tag('Msg').text = '';
        this.tag('Info').setSmooth('alpha', 1);
        this.tag('Code').setSmooth('alpha', 1);
      }
      this._timeout = setTimeout(() => {
        this.msg = '';
      }, 2000);
    }

    _firstActive() {
      this.setSmooth('alpha', 1);
    }

    _handleKey(event) {
      if (this.msg) {
        this.msg = false;
      } else {
        const val = parseInt(event.key);
        if (val > -1) {
          this.pin += val;
        }
      }
    }

    _handleBack() {
      if (this.msg) {
        this.msg = false;
      } else {
        if (this.pin.length) {
          this.pin = this.pin.slice(0, this.pin.length - 1);
        } else {
          Pin.hide();
          this.resolve(false);
        }
      }
    }

    _handleEnter() {
      if (this.msg) {
        this.msg = false;
      } else {
        Pin.submit(this.pin)
          .then(val => {
            this.msg = 'Unlocking ...';
            setTimeout(() => {
              Pin.hide();
            }, 1000);
            this.resolve(val);
          })
          .catch(e => {
            this.msg = e;
            this.reject(e);
          });
      }
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  // only used during local development
  let unlocked = false;

  let submit = pin => {
    return new Promise((resolve, reject) => {
      if (pin.toString() === Settings.get('platform', 'pin', '0000').toString()) {
        unlocked = true;
        resolve(unlocked);
      } else {
        reject('Incorrect pin');
      }
    })
  };

  let check = () => {
    return new Promise(resolve => {
      resolve(unlocked);
    })
  };

  let pinDialog = null;

  // Public API
  var Pin = {
    show() {
      return new Promise((resolve, reject) => {
        pinDialog = ApplicationInstance.stage.c({
          ref: 'PinDialog',
          type: PinDialog,
          resolve,
          reject,
        });
        ApplicationInstance.childList.a(pinDialog);
        ApplicationInstance.focus = pinDialog;
      })
    },
    hide() {
      ApplicationInstance.focus = null;
      ApplicationInstance.children = ApplicationInstance.children.map(
        child => child !== pinDialog && child
      );
      pinDialog = null;
    },
    submit(pin) {
      return new Promise((resolve, reject) => {
        try {
          submit(pin)
            .then(resolve)
            .catch(reject);
        } catch (e) {
          reject(e);
        }
      })
    },
    unlocked() {
      return new Promise((resolve, reject) => {
        try {
          check()
            .then(resolve)
            .catch(reject);
        } catch (e) {
          reject(e);
        }
      })
    },
    locked() {
      return new Promise((resolve, reject) => {
        try {
          check()
            .then(unlocked => resolve(!!!unlocked))
            .catch(reject);
        } catch (e) {
          reject(e);
        }
      })
    },
  };

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  /**
   * Returns a styles object for use by components
   * @param {Object|function} styles - Object or callback that takes theme as an argument, ultimately the returned value
   * @param {Object} theme - theme to be provided to styles
   */
  var createStyles = (styles, theme) => {
    return typeof styles === 'function' ? styles(theme) : styles;
  };

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   */

  /**
   * Helpers for lng.Tools.getRoundRect
   */
  const RoundRect = {
    /**
     * Returns a value that will render as the given width (w)
     * when passed to lng.Tools.getRoundRect
     * @param {number} w - px value for expected width
     * @param {*} options
     * @param {number} options.padding - px value for both left and right padding
     * @param {number} options.paddingLeft - px value for left padding, overrides options.padding
     * @param {number} options.paddingRight - px value for right padding, overrides options.padding
     * @param {number} options.strokeWidth - px value for stroke width
     */
    getWidth(w, options = {}) {
      const { padding, paddingLeft, paddingRight, strokeWidth } = {
        padding: 0,
        paddingLeft: 0,
        paddingRight: 0,
        strokeWidth: 0,
        ...options
      };

      if (!w) return 0;

      return (
        w - (paddingLeft || padding) - (paddingRight || padding) - strokeWidth
      );
    },
    /**
     * Returns a value that will render as the given height (h)
     * when passed to lng.Tools.getRoundRect
     * @param {number} h - px value for expected width
     * @param {*} options
     * @param {number} options.padding - px value for both bottom and top padding
     * @param {number} options.paddingBottom - px value for bottom padding, overrides options.padding
     * @param {number} options.paddingTop - px value for top padding, overrides options.padding
     * @param {number} options.strokeWidth - px value for stroke width
     */
    getHeight(h, options = {}) {
      const { padding, paddingBottom, paddingTop, strokeWidth } = {
        padding: 0,
        paddingBottom: 0,
        paddingTop: 0,
        strokeWidth: 0,
        ...options
      };

      if (!h) return 0;

      return (
        h - (paddingBottom || padding) - (paddingTop || padding) - strokeWidth
      );
    }
  };

  /**
   * Merges two objects together and returns the duplicate.
   *
   * @param {Object} target - object to be cloned
   * @param {Object} [object] - secondary object to merge into clone
   */
  function clone(target, object) {
    const _clone = { ...target };
    if (!object || target === object) return _clone;

    for (let key in object) {
      const value = object[key];
      if (target.hasOwnProperty(key)) {
        _clone[key] = getMergeValue(key, target, object);
      } else {
        _clone[key] = value;
      }
    }

    return _clone;
  }

  function getMergeValue(key, target, object) {
    const targetVal = target[key];
    const objectVal = object[key];
    const targetValType = typeof targetVal;
    const objectValType = typeof objectVal;

    if (
      targetValType !== objectValType ||
      objectValType === 'function' ||
      Array.isArray(objectVal)
    ) {
      return objectVal;
    }

    if (objectVal && objectValType === 'object') {
      return clone(targetVal, objectVal);
    }

    return objectVal;
  }

  /**
   * Returns the rendered width of a given text texture
   * @param {Object} text - text texture properties
   * @param {string} text.text - text value
   * @param {string} text.fontStyle - css font-style property
   * @param {(string|number)} text.fontWeight - css font-weight property
   * @param {string} [fontSize=0] - css font-size property (in px)
   * @param {string} [text.fontFamily=sans-serif] - css font-weight property
   * @param {string} text.fontFace - alias for fontFamily
   *
   * @returns {number} text width
   * */
  function measureTextWidth(text = {}) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const {
      fontStyle,
      fontWeight,
      fontSize,
      fontFamily = text.fontFace || 'sans-serif'
    } = text;
    const fontCss = [
      fontStyle,
      fontWeight,
      fontSize ? `${fontSize}px` : '0',
      `'${fontFamily}'`
    ]
      .filter(Boolean)
      .join(' ');
    ctx.font = fontCss;
    const textMetrics = ctx.measureText(text.text || '');

    return Math.round(textMetrics.width);
  }

  /**
   * Returns first argument that is a number. Useful for finding ARGB numbers. Does not convert strings to numbers
   * @param {...*} number - maybe a number
   **/
  function getFirstNumber(...numbers) {
    return numbers.find(Number.isFinite);
  }

  /**
   * Naively looks for dimensional prop (i.e. w, h, x, y, etc.), first searching for
   * a transition target value then defaulting to the current set value
   * @param {string} prop - property key
   * @param {lng.Component} component - Lightning component to operate against
   */
  function getDimension(prop, component) {
    if (!component) return 0;
    const transition = component.transition(prop);
    if (transition.isRunning()) return transition.targetValue;
    return component[prop];
  }

  const getX = getDimension.bind(null, 'x');
  getDimension.bind(null, 'y');
  const getH = component =>
    getDimension('h', component) || component.renderHeight;

  /**
   * Returns a function, that, as long as it continues to be invoked, will not
   * be triggered. The function will be called after it stops being called for
   * N milliseconds. If `immediate` is passed, trigger the function on the
   * leading edge, instead of the trailing. The function also has a property 'clear' 
   * that is a function which will clear the timer to prevent previously scheduled executions. 
   *
   * @source underscore.js
   * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
   * @param {Function} function to wrap
   * @param {Number} timeout in ms (`100`)
   * @param {Boolean} whether to execute at the beginning (`false`)
   * @api public
   */
  function debounce(func, wait, immediate){
    var timeout, args, context, timestamp, result;
    if (null == wait) wait = 100;

    function later() {
      var last = Date.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    }
    var debounced = function(){
      context = this;
      args = arguments;
      timestamp = Date.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };

    debounced.clear = function() {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };
    
    debounced.flush = function() {
      if (timeout) {
        result = func.apply(context, args);
        context = args = null;
        
        clearTimeout(timeout);
        timeout = null;
      }
    };

    return debounced;
  }
  // Adds compatibility for ES modules
  debounce.debounce = debounce;

  var debounce_1 = debounce;

  /**
  * Copyright 2020 Comcast Cable Communications Management, LLC
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  * http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  * SPDX-License-Identifier: Apache-2.0
  */

  function withStyles(Base, styles, theme) {
    const _theme = theme || Base.theme;
    const _styles = Base.styles ? clone(Base.styles, createStyles(styles, _theme)) : createStyles(styles, _theme);

    return class extends Base {
      static get name() { return Base.name }
      static get styles() { return _styles };
      get styles() { return _styles }
    }
  }

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   */

  class Icon extends lng.Component {
    static _template() {
      return {
        color: 0xffffffff,
        w: 0,
        h: 0
      };
    }

    get icon() {
      return this._icon;
    }

    set icon(icon) {
      this._icon = icon;
      this._update();
    }

    _init() {
      this._update();
    }

    _update() {
      const { icon, w, h } = this;
      const template = getIconTemplate(icon, w, h);
      this.patch(template);
    }
  }

  const [isSvgTag, isSvgURI, isImageURI] = [
    /^<svg.*<\/svg\>$/,
    /\.svg$/,
    /\.(a?png|bmp|gif|ico|cur|jpe?g|pjp(eg)?|jfif|tiff?|webp)$/
  ].map(regex => RegExp.prototype.test.bind(regex));

  function getIconTemplate(icon, w, h) {
    const template = { w, h };

    switch (true) {
      case isSvgTag(icon):
        template.texture = lng.Tools.getSvgTexture(
          `data:image/svg+xml,${encodeURIComponent(icon)}`,
          w,
          h
        );
        break;
      case isSvgURI(icon):
        template.texture = lng.Tools.getSvgTexture(icon, w, h);
        break;
      case isImageURI(icon):
        template.src = icon;
        break;
    }
    return template;
  }

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   */

  const styles = {
    w: 150,
    h: 40,
    radius: 0,
    background: { color: 0xff1f1f1f },
    icon: { color: 0xffffffff },
    text: {
      fontSize: 20,
      color: 0xffffffff
    },
    padding: 50,
    stroke: {
      color: 0x00,
      weight: 2
    },
    focused: {
      background: { color: 0xffffffff },
      text: { color: 0xff1f1f1f },
      icon: { color: 0xff1f1f1f }
    }
  };

  class Button extends lng.Component {
    static _template() {
      return {
        w: this.styles.w,
        h: this.styles.h,
        radius: this.styles.radius,
        strokeColor: this.styles.stroke.color,
        strokeWeight: this.styles.stroke.weight,
        Content: {
          mount: 0.5,
          x: w => w / 2,
          y: h => h / 2,
          flex: {
            direction: 'row',
            alignContent: 'center',
            alignItems: 'center'
          },
          Icon: {
            type: Icon
          },
          // TODO: Wonky lineHeight / fontsize from Lightning
          // Move title down 2 pixels to _visually_ center it
          // inside the button
          Title: { y: 2 }
        },
        Stroke: {
          zIndex: -1,
          mount: 0.5,
          x: w => w / 2,
          y: h => h / 2
        }
      };
    }

    _construct() {
      this._focused = false;
      this._whenEnabled = new Promise(
        resolve => (this._enable = resolve),
        console.error
      );
      this._strokeWeight = 2;
      this._strokeColor = 0x00;
    }

    _init() {
      this._update();
    }

    _focus() {
      if (this._smooth === undefined) this._smooth = true;
      this._focused = true;
      this._update();
    }

    _unfocus() {
      this._focused = false;
      this._update();
    }

    _updateColor() {
      const color = this._focused
        ? getFirstNumber(
            this.focusedBackground,
            this.styles.focused.background.color
          )
        : getFirstNumber(this.background, this.styles.background.color);
      if (this._smooth) {
        this.smooth = { color };
      } else {
        this.color = color;
      }
    }

    _updateTitle() {
      if (this.title) {
        this._Title.text = {
          ...this.styles.text,
          fontColor: this.styles.text.color,
          fontSize: this.fontSize || this.styles.text.fontSize,
          fontFamily:
            this.styles.text.fontFace ||
            this.styles.text.fontFamily ||
            this.stage._options.defaultFontFace,
          text: this.title
        };

        const color = this._focused
          ? getFirstNumber(this.focusedTextColor, this.styles.focused.text.color)
          : getFirstNumber(this.textColor, this.styles.text.color);
        if (this._smooth) {
          this._Title.smooth = { color };
        } else {
          this._Title.color = color;
        }
      } else {
        this._Title.texture = false;
      }
    }

    _updateIcon() {
      if (this.icon) {
        const { color, size, spacing, src } = this.icon;
        this._Icon.patch({
          w: size,
          h: size,
          icon: src,
          flexItem: { marginRight: this.title ? spacing : 0 }
        });

        const iconColor = this._focused
          ? getFirstNumber(this.focusedIconColor, this.styles.focused.icon.color)
          : getFirstNumber(color, this.styles.icon.color);
        if (this._smooth) {
          this._Icon.smooth = { color: iconColor };
        } else {
          this._Icon.color = iconColor;
        }
      } else {
        this._Icon.patch({
          w: 0,
          h: 0,
          texture: false,
          flexItem: false
        });
      }
    }

    _updateStroke() {
      if (this.stroke && !this._focused) {
        const radius = this.radius || this.styles.radius;

        this.texture = lng.Tools.getRoundRect(
          RoundRect.getWidth(this.w),
          RoundRect.getHeight(this.h),
          radius,
          0x00,
          true,
          0xffffffff
        );

        this._Stroke.color = this.strokeColor;
        this._Stroke.texture = lng.Tools.getRoundRect(
          RoundRect.getWidth(this.w),
          RoundRect.getHeight(this.h),
          radius,
          this.strokeWeight,
          0xffffffff,
          true,
          this.background
        );
      } else {
        const radius = this.radius || this.styles.radius;
        this.texture = lng.Tools.getRoundRect(
          RoundRect.getWidth(this.w),
          RoundRect.getHeight(this.h),
          radius
        );
        this._Stroke.texture = false;
      }
    }

    _updateWidth() {
      if (!this.fixed) {
        const iconSize = this._icon ? this._icon.size + this._icon.spacing : 0;
        const padding = getFirstNumber(this.padding, this.styles.padding, 10);
        const w =
          measureTextWidth(this._Title.text || {}) + padding * 2 + iconSize;

        if (w && w !== this.w) {
          this.w = w > this.styles.w ? w : this.styles.w;
          this.fireAncestors('$itemChanged');
          this.signal('buttonWidthChanged', { w: this.w });
        }
      }
    }

    _update() {
      this._whenEnabled.then(() => {
        this._updateColor();
        this._updateTitle();
        this._updateIcon();
        this._updateStroke();
        this._updateWidth();
      });
    }

    _handleEnter() {
      if (typeof this.onEnter === 'function') {
        this.onEnter(this);
      }
    }

    get radius() {
      return this._radius;
    }

    set radius(radius) {
      if (this._radius !== radius) {
        this._radius = radius;
        this._update();
      }
    }

    get title() {
      return this._title;
    }

    set title(title) {
      if (this._title !== title) {
        this._title = title;
        this._update();
      }
    }

    get icon() {
      return this._icon;
    }

    set icon({ src, size = 20, spacing = 5, color = 0xffffffff }) {
      if (src) {
        this._icon = { src, size, spacing, color };
      } else {
        this._icon = null;
      }
      this._update();
    }

    get strokeWeight() {
      return this._strokeWeight;
    }

    set strokeWeight(strokeWeight) {
      if (this._strokeWeight !== strokeWeight) {
        this._strokeWeight = strokeWeight;
        this._update();
      }
    }

    get strokeColor() {
      return this._strokeColor;
    }

    set strokeColor(strokeColor) {
      if (this._strokeColor !== strokeColor) {
        this._strokeColor = strokeColor;
        this._update();
      }
    }

    get stroke() {
      return this._stroke;
    }

    set stroke(stroke) {
      if (this._stroke !== stroke) {
        this._stroke = stroke;
        this._update();
      }
    }

    get w() {
      return this._w;
    }

    set w(w) {
      if (this._w !== w) {
        this._w = w;
        this._update();
      }
    }

    set label(label) {
      this._label = label;
    }

    get label() {
      return this._label || this._title;
    }

    get announce() {
      // TODO - Localization?
      // Do we need a locale file with
      // component translations?
      return this.label + ', Button';
    }

    get _Content() {
      return this.tag('Content');
    }

    get _Title() {
      return this.tag('Content.Title');
    }
    get _Icon() {
      return this.tag('Content.Icon');
    }
    get _Stroke() {
      return this.tag('Stroke');
    }
  }

  var Button$1 = withStyles(Button, styles);

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   */

  class FocusManager extends lng.Component {
    constructor(stage) {
      super(stage);
      this.patch({ Items: {} });
      this._direction = this.direction || 'row';
    }

    _construct() {
      this._selectedIndex = 0;
    }

    get direction() {
      return this._direction;
    }

    set direction(direction) {
      this._direction = direction;
      let state = {
        none: 'None',
        column: 'Column',
        row: 'Row'
      }[direction];

      if (state) {
        this._setState(state);
      }
    }

    get Items() {
      return this.tag('Items');
    }

    get items() {
      return this.Items.children;
    }

    set items(items) {
      this.Items.childList.clear();
      this._selectedIndex = 0;
      this.appendItems(items);
    }

    appendItems(items = []) {
      this.Items.childList.a(items);
      this._refocus();
    }

    get selected() {
      return this.Items.children[this.selectedIndex];
    }

    get selectedIndex() {
      return this._selectedIndex;
    }

    set selectedIndex(index) {
      const prevSelected = this.selected;
      if (index !== this._selectedIndex) {
        this._selectedIndex = index;
      }
      // Have items update (change height or width) before we render
      this._refocus();
      if (this.selected) {
        this.render(this.selected, prevSelected);
        this.signal('selectedChange', this.selected, prevSelected);
      }
    }

    // Override
    render() {}

    selectPrevious() {
      if (this.selectedIndex > 0) {
        let prevIndex = this.selectedIndex - 1;
        let previous = this.items[prevIndex];
        while (prevIndex && previous.skipFocus) {
          this._selectedIndex = prevIndex;
          this.render(previous, this.items[prevIndex + 1]);
          prevIndex -= 1;
          previous = this.items[prevIndex];
        }
        this.selectedIndex = prevIndex;
        return true;
      } else if (this.wrapSelected) {
        this.selectedIndex = this.Items.children.length - 1;
        return true;
      }
      return false;
    }

    selectNext() {
      if (this.selectedIndex < this.Items.children.length - 1) {
        let nextIndex = this.selectedIndex + 1;
        let next = this.items[nextIndex];
        while (nextIndex < this.items.length - 1 && next.skipFocus) {
          this._selectedIndex = nextIndex;
          this.render(next, this.items[nextIndex - 1]);
          nextIndex += 1;
          next = this.items[nextIndex];
        }
        this.selectedIndex = nextIndex;
        return true;
      } else if (this.wrapSelected) {
        this.selectedIndex = 0;
        return true;
      }
      return false;
    }

    _getFocused() {
      let { selected } = this;
      // Make sure we're focused on a component
      if (selected) {
        if (selected.focusRef) {
          return selected.tag(selected.focusRef);
        } else if (selected.cparent) {
          return selected;
        }
      }
      return this;
    }

    static _states() {
      return [
        class None extends this {},
        class Row extends this {
          _handleLeft() {
            return this.selectPrevious();
          }

          _handleRight() {
            return this.selectNext();
          }
        },

        class Column extends this {
          _handleUp() {
            return this.selectPrevious();
          }

          _handleDown() {
            return this.selectNext();
          }
        }
      ];
    }
  }

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  class Row extends FocusManager {
    static _template() {
      return {
        direction: 'row'
      };
    }

    _construct() {
      super._construct();
      this._smooth = false;
      this._itemSpacing = 0;
      this._scrollIndex = 0;
      this._whenEnabled = new Promise(resolve => (this._firstEnable = resolve));
      this._w = this.stage.w;
      this.debounceDelay = Number.isInteger(this.debounceDelay)
        ? this.debounceDelay
        : 1;
      this._update = debounce_1.debounce(this._updateLayout, this.debounceDelay);
    }

    get _itemTransition() {
      return (
        this.itemTransition || {
          duration: 0.4,
          timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'
        }
      );
    }

    _focus() {
      this.items.forEach(item => (item.parentFocus = true));
    }

    _unfocus() {
      this.items.forEach(item => (item.parentFocus = false));
    }

    selectNext() {
      this._smooth = true;
      return super.selectNext();
    }

    selectPrevious() {
      this._smooth = true;
      return super.selectPrevious();
    }

    // TODO: can be documented in API when lastScrollIndex is made public
    shouldScrollLeft() {
      let shouldScroll = false;

      if (this._lastScrollIndex) {
        shouldScroll = this.selectedIndex < this._lastScrollIndex;
        if (
          this._prevLastScrollIndex !== undefined &&
          this._prevLastScrollIndex !== this._lastScrollIndex
        ) {
          shouldScroll = true;
        }
      } else {
        shouldScroll = this.selectedIndex >= this._scrollIndex;
      }

      return this._itemsX < 0 && shouldScroll;
    }

    // TODO: can be documented in API when lastScrollIndex is made public
    shouldScrollRight() {
      const lastChild = this.Items.childList.last;
      return (
        this.selectedIndex > this._scrollIndex &&
        // end of Items container < end of last item
        Math.abs(this._itemsX - this.w) <
          lastChild.x + this.Items.childList.last.w
      );
    }

    get onScreenItems() {
      return this.Items.children.filter(child => this._isOnScreen(child));
    }

    _isOnScreen(child) {
      const x = getX(child);
      const { w } = child;
      const withinLowerBounds = x + w + this._itemsX > 0;
      const withinUpperBounds = x + this._itemsX < this.w;
      return withinLowerBounds && withinUpperBounds;
    }

    _isOnScreenCompletely(child) {
      let itemX = child.core.renderContext.px;
      let rowX = this.core.renderContext.px;
      return itemX >= rowX && itemX + child.w <= rowX + this.w;
    }

    _shouldScroll() {
      const lastChild = this.Items.childList.last;
      let shouldScroll = this.alwaysScroll;
      if (!shouldScroll) {
        if (this.lazyScroll) {
          shouldScroll = !this._isOnScreenCompletely(this.selected);
        } else {
          shouldScroll =
            lastChild &&
            (this.shouldScrollLeft() ||
              this.shouldScrollRight() ||
              !this._isOnScreenCompletely(this.selected));
        }
      }
      return shouldScroll;
    }

    _getLazyScrollX(prev) {
      let itemsContainerX;
      const prevIndex = this.Items.childList.getIndex(prev);
      if (prevIndex > this.selectedIndex) {
        itemsContainerX = -this.selected.x;
      } else if (prevIndex < this.selectedIndex) {
        itemsContainerX = this.w - this.selected.x - this.selected.w;
      }
      return itemsContainerX;
    }

    _getScrollX() {
      let itemsContainerX;
      let itemIndex = this.selectedIndex - this.scrollIndex;
      itemIndex = itemIndex < 0 ? 0 : itemIndex;
      if (this.Items.children[itemIndex]) {
        itemsContainerX = this.Items.children[itemIndex].transition('x')
          ? -this.Items.children[itemIndex].transition('x').targetValue
          : -this.Items.children[itemIndex].x;
      }
      return itemsContainerX;
    }

    render(next, prev) {
      this._whenEnabled.then(() => {
        this._prevLastScrollIndex = this._lastScrollIndex;

        if (this._shouldScroll()) {
          const itemsContainerX =
            this.lazyScroll && prev
              ? this._getLazyScrollX(prev)
              : this._getScrollX();
          if (itemsContainerX !== undefined) {
            if (this._smooth) {
              this.Items.smooth = {
                x: [itemsContainerX, this._itemTransition]
              };
            } else {
              this.Items.x = itemsContainerX;
            }
          }
        }

        this.onScreenEffect(this.onScreenItems);
      });
    }

    _updateLayout() {
      let nextX = 0;
      let nextH = 0;
      // layout items in row
      for (let i = 0; i < this.Items.children.length; i++) {
        const child = this.Items.children[i];
        nextH = Math.max(nextH, getH(child));
        if (this._smooth) {
          child.smooth = { x: [nextX, this._itemTransition] };
        } else {
          child.patch({ x: nextX });
        }
        nextX += child.w;
        if (i < this.Items.children.length - 1) {
          nextX += this.itemSpacing;
        }

        if (child.centerInParent) {
          // if the child is another focus manager, check the height of the item container
          const childHeight = (child.Items && child.Items.h) || child.h;
          // only center the child if it is within the bounds of this focus manager
          if (childHeight < this.h) {
            child.y = (this.h - childHeight) / 2;
          }
        }
      }
      this.Items.patch({ h: nextH, w: nextX });

      const lastChild = this.Items.childList.last;
      const endOfLastChild = lastChild ? getX(lastChild) + lastChild.w : 0;
      const scrollOffset = (this.Items.children[this._scrollIndex] || { x: 0 }).x;

      // determine when to stop scrolling right
      if (this.alwaysScroll) {
        this._lastScrollIndex = this.Items.children.length - 1;
      } else if (endOfLastChild > this.w) {
        for (let i = this.Items.children.length - 1; i >= 0; i--) {
          const child = this.Items.children[i];
          const childX = getX(child);
          if (childX + this.w - scrollOffset > endOfLastChild) {
            this._lastScrollIndex = i;
          } else {
            break;
          }
        }
      }
      this.fireAncestors('$itemChanged');
      this.render(this.selected, null);
    }

    get itemSpacing() {
      return this._itemSpacing;
    }

    set itemSpacing(itemSpacing) {
      if (itemSpacing !== this._itemSpacing) {
        this._itemSpacing = itemSpacing;
        this._update();
      }
    }

    get scrollIndex() {
      return this._scrollIndex;
    }

    set scrollIndex(scrollIndex) {
      if (scrollIndex !== this._scrollIndex) {
        this._scrollIndex = scrollIndex;
        this._update();
      }
    }

    get _itemsX() {
      return getX(this.Items);
    }

    appendItems(items = []) {
      let itemHeight = this.renderHeight;

      items.forEach(item => {
        item.parentFocus = this.hasFocus();
        item = this.Items.childList.a(item);
        item.h = item.h || itemHeight;
      });
      this.stage.update();
      this._updateLayout();
      this._update.clear();
      this._refocus();
    }

    $itemChanged() {
      this._update();
    }

    // can be overridden
    onScreenEffect() {}
  }

  var fallbackCachedFilms = [
  	{
  		title: "Thor: Ragnarok",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg",
  		overview: "Thor is imprisoned on the other side of the universe and finds himself in a race against time to get back to Asgard to stop Ragnarok, the destruction of his home-world and the end of Asgardian civilization, at the hands of a powerful new threat, the ruthless Hela."
  	},
  	{
  		title: "Spider-Man: Homecoming",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg",
  		overview: "Following the events of Captain America: Civil War, Peter Parker, with the help of his mentor Tony Stark, tries to balance his life as an ordinary high school student in Queens, New York City, with fighting crime as his superhero alter ego Spider-Man as a new threat, the Vulture, emerges."
  	},
  	{
  		title: "Guardians of the Galaxy Vol. 2",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/tM894AtE7UQTJEoQG6qF6mdfSUT.jpg",
  		overview: "The Guardians must fight to keep their newfound family together as they unravel the mysteries of Peter Quill's true parentage."
  	},
  	{
  		title: "Logan",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/fnbjcRDYn6YviCcePDnGdyAkYsB.jpg",
  		overview: "In the near future, a weary Logan cares for an ailing Professor X in a hideout on the Mexican border. But Logan's attempts to hide from the world and his legacy are upended when a young mutant arrives, pursued by dark forces."
  	},
  	{
  		title: "Doctor Strange",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/aL53oMdZKZRJRH8txH07DLuleF9.jpg",
  		overview: "After his career is destroyed, a brilliant but arrogant surgeon gets a new lease on life when a sorcerer takes him under her wing and trains him to defend the world against evil."
  	},
  	{
  		title: "X-Men: Apocalypse",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/2ex2beZ4ssMeOduLD0ILzXKCiep.jpg",
  		overview: "After the re-emergence of the world's first mutant, world-destroyer Apocalypse, the X-Men must unite to defeat his extinction level plan."
  	},
  	{
  		title: "Captain America: Civil War",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/kvRT3GwcnqGHzPjXIVrVPhUix7Z.jpg",
  		overview: "Following the events of Age of Ultron, the collective governments of the world pass an act designed to regulate all superhuman activity. This polarizes opinion amongst the Avengers, causing two factions to side with Iron Man or Captain America, which causes an epic battle between former allies."
  	},
  	{
  		title: "Deadpool",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/en971MEXui9diirXlogOrPKmsEn.jpg",
  		overview: "Deadpool tells the origin story of former Special Forces operative turned mercenary Wade Wilson, who after being subjected to a rogue experiment that leaves him with accelerated healing powers, adopts the alter ego Deadpool. Armed with his new abilities and a dark, twisted sense of humor, Deadpool hunts down the man who nearly destroyed his life."
  	},
  	{
  		title: "Fantastic Four",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/gzhVcfC5j0sTnS4WJzBrCS0Vkr0.jpg",
  		overview: "Four young outsiders teleport to a dangerous universe, which alters their physical form in shocking ways. Their lives irrevocably upended, the team must learn to harness their daunting new abilities and work together to save Earth from a former friend turned enemy."
  	},
  	{
  		title: "Ant-Man",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/7AyEEZVtFjNMCOEoz88pBqiAI8n.jpg",
  		overview: "Armed with the astonishing ability to shrink in scale but increase in strength, master thief Scott Lang must embrace his inner-hero and help his mentor, Doctor Hank Pym, protect the secret behind his spectacular Ant-Man suit from a new generation of towering threats. Against seemingly insurmountable obstacles, Pym and Lang must plan and pull off a heist that will save the world."
  	},
  	{
  		title: "Thor: Ragnarok",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg",
  		overview: "Thor is imprisoned on the other side of the universe and finds himself in a race against time to get back to Asgard to stop Ragnarok, the destruction of his home-world and the end of Asgardian civilization, at the hands of a powerful new threat, the ruthless Hela."
  	},
  	{
  		title: "Spider-Man: Homecoming",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg",
  		overview: "Following the events of Captain America: Civil War, Peter Parker, with the help of his mentor Tony Stark, tries to balance his life as an ordinary high school student in Queens, New York City, with fighting crime as his superhero alter ego Spider-Man as a new threat, the Vulture, emerges."
  	},
  	{
  		title: "Guardians of the Galaxy Vol. 2",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/tM894AtE7UQTJEoQG6qF6mdfSUT.jpg",
  		overview: "The Guardians must fight to keep their newfound family together as they unravel the mysteries of Peter Quill's true parentage."
  	},
  	{
  		title: "Logan",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/fnbjcRDYn6YviCcePDnGdyAkYsB.jpg",
  		overview: "In the near future, a weary Logan cares for an ailing Professor X in a hideout on the Mexican border. But Logan's attempts to hide from the world and his legacy are upended when a young mutant arrives, pursued by dark forces."
  	},
  	{
  		title: "Doctor Strange",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/aL53oMdZKZRJRH8txH07DLuleF9.jpg",
  		overview: "After his career is destroyed, a brilliant but arrogant surgeon gets a new lease on life when a sorcerer takes him under her wing and trains him to defend the world against evil."
  	},
  	{
  		title: "X-Men: Apocalypse",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/2ex2beZ4ssMeOduLD0ILzXKCiep.jpg",
  		overview: "After the re-emergence of the world's first mutant, world-destroyer Apocalypse, the X-Men must unite to defeat his extinction level plan."
  	},
  	{
  		title: "Captain America: Civil War",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/kvRT3GwcnqGHzPjXIVrVPhUix7Z.jpg",
  		overview: "Following the events of Age of Ultron, the collective governments of the world pass an act designed to regulate all superhuman activity. This polarizes opinion amongst the Avengers, causing two factions to side with Iron Man or Captain America, which causes an epic battle between former allies."
  	},
  	{
  		title: "Deadpool",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/en971MEXui9diirXlogOrPKmsEn.jpg",
  		overview: "Deadpool tells the origin story of former Special Forces operative turned mercenary Wade Wilson, who after being subjected to a rogue experiment that leaves him with accelerated healing powers, adopts the alter ego Deadpool. Armed with his new abilities and a dark, twisted sense of humor, Deadpool hunts down the man who nearly destroyed his life."
  	},
  	{
  		title: "Fantastic Four",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/gzhVcfC5j0sTnS4WJzBrCS0Vkr0.jpg",
  		overview: "Four young outsiders teleport to a dangerous universe, which alters their physical form in shocking ways. Their lives irrevocably upended, the team must learn to harness their daunting new abilities and work together to save Earth from a former friend turned enemy."
  	},
  	{
  		title: "Ant-Man",
  		poster_path: "https://www.themoviedb.org/t/p/w220_and_h330_face/7AyEEZVtFjNMCOEoz88pBqiAI8n.jpg",
  		overview: "Armed with the astonishing ability to shrink in scale but increase in strength, master thief Scott Lang must embrace his inner-hero and help his mentor, Doctor Hank Pym, protect the secret behind his spectacular Ant-Man suit from a new generation of towering threats. Against seemingly insurmountable obstacles, Pym and Lang must plan and pull off a heist that will save the world."
  	}
  ];

  class App extends lng.Component {
    static _template() {
      return { 
        Background: {
          w: 1920,
          h: 980,
          src: Utils.asset('images/background.png'),
        },
        BackgroundImage: {
          w: 1920,
          h: 980,
          type: Icon,
          color: 0xaaaaaaaa,
          src: Utils.asset('images/logo_now.png'),
        },
        TextTitle: {
          x: 0,
          y: 90,
          w: 1920,
          text: {
            text: '',
            fontFace: 'Segoe Print, Arial',
            fontSize: 64,
            textAlign: 'center',
            textColor: 0xff00ffff,
          },
        },
        TextOverview: {
          x: 0,
          y: 490,
          w: 1920,
          text: {
            text: '',
            fontFace: 'Segoe Print, Arial',
            fontSize: 28,
            wordWrapWidth: 1100,
            lineHeight: 40,
            textAlign: 'center',
            textColor: 0xd4d4d4d4,
          },
        },
        RowOfFilmImages: {
          type: Row, 
          x: 960 - 90,
          y: 200,
          h: 225,
          itemSpacing: 30,
          scrollIndex: 0,
          items: Array.apply(null, { length: 20 }).map((_, i) => ({
            type: Button$1,
            w: 150,
            h: 225,
            icon: {
              type: Icon,
              src: '',
              size: 225,
              color: 0xffffffff,
              spacing: 0,
            },
          })),
        },
      }
    }

    renderLatestUpdate = () => {
      const row = this.tag('RowOfFilmImages');
      const selectedIndex = row.selectedIndex;
      this.resetFilmIconOpacities();
      this.setRowsXPosition(row, selectedIndex);
      this.updateTexts(selectedIndex);
    }

    updateTexts = (selectedIndex) => {
      const selectedFilm = this.films[selectedIndex];
      this.tag('TextTitle').text.text = selectedFilm.title;
      this.tag('TextOverview').text.text = selectedFilm.overview;
    }

    resetFilmIconOpacities = () => {
      const row = this.tag('RowOfFilmImages');
      row.items.forEach(item => (item.children[0].alpha = 0.4));
      row.selected['children'][0].alpha = 1;
    }

    setRowsXPosition = (row, selectedIndex) => {
      const filmWidth = 180;
      const halfOfFilmsLength = this.films.length / 2;
      const filmsToOffset = halfOfFilmsLength - selectedIndex;
      let xOfCentreFilm = 960 - 90;
      let offsetAmount = 0;
      if (filmsToOffset < 0) {
        offsetAmount = filmWidth * filmsToOffset * -1;
      }
      row.x = xOfCentreFilm - offsetAmount;
    }

    films = []

    setUpFilmIconProperties = () => {
      console.log('ok');
      const row = this.tag('RowOfFilmImages');
      row.items.forEach((item, index) => {
        const icon = item.children[0];
        icon.src = 'https://www.themoviedb.org/t/p/w220_and_h330_face/' + this.films[index].poster_path;
        icon.h = 225;
        icon.w = 150;
      });
    }

    getFilmsFromAPI = (callback) => {
      fetch('https://api.themoviedb.org/3/discover/movie?api_key=5d32c1fee47f71010ced6f1e582cc0c3')
        .then(response => response.json())
        .then(data => callback(data))
        .catch((error) => {
          console.log('error whilst requesting films from API' + error);
          this.films = fallbackCachedFilms;
        });
    }

    _getFocused = () => {
      if (this.films.length > 0) {
        this.renderLatestUpdate();
      }
      return this.tag('RowOfFilmImages')
    }

    _init = () => {
      this.getFilmsFromAPI((data) => {
        this.films = data.results;
        this.tag('RowOfFilmImages').selectedIndex = this.films.length / 2;
        this.setUpFilmIconProperties();
        this.resetFilmIconOpacities();
        this.renderLatestUpdate();
        this._getFocused();
      });
    }
  }

  function index() {
    return Launch(App, ...arguments)
  }

  return index;

}());
//# sourceMappingURL=appBundle.js.map
