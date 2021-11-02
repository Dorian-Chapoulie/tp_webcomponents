import '../libs/webaudio-controls.js';
import '../freq/index.js';
import '../equalizer/index.js';
import '../balance/index.js';

const getBaseUrl = () => {
  return window.location.origin + '/components';
}


const template = document.createElement("template");
template.innerHTML = /*html*/`
  <style>
  </style>
  <audio id="myplayer" controls crossorigin="anonymous"></audio>
  <br>
  
  <button id="previous">Previous</button>
  <button id="backward">-10s</button>
  <button id="play">Play</button>
  <button id="pause">Pause</button>
  <button id="stop">Stop</button>
  <button id="forward">+10s</button>
  <button id="next">Next</button>
  <br>
  <label>Vitesse de lecture</label>
  <input id="speed" type="range" min=0.2 max=4 step=0.1>
  <br>
  <webaudio-knob
    id="volume"
    src="${getBaseUrl()}/assets/img/Vintage_VUMeter_2.png"
    value=0
    min=0
    max=1
    step=0.1
    diameter=150
    tooltip="Volume %d"
  ></webaudio-knob>
  <br>
  <freq-visualiser id="freq-visualiser"></freq-visualiser>
  <my-equalizer id="equalizer" ></my-equalizer>
  <my-balance id="balance" ></my-balance>
`;
//todo barre de prograssion
//visu des freq, wave forms, volume

class MyAudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.createIds();
  }

  connectedCallback() {
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.getElements();
    this.createListeners();
    this.initDependencies();
    this.startAnimations();

    //todo: createPlaylist
    this.player.src = "https://mainline.i3s.unice.fr/mooc/LaSueur.mp3";
  }

  initDependencies() {
    this.freq_visualiser.player = this.player;
    this.freq_visualiser.onNodesConnected = (sourceNode, analyser, audioContext) => {
      this.equalizer.parentSourceNode = sourceNode;
      this.equalizer.parentAnalyser = analyser;
      this.equalizer.audioContext = audioContext;
    }

    this.equalizer.player = this.player;
  }

  createIds() {
    this.ids = {
      PLAYER: 'myplayer',
      PLAY: 'play',
      PAUSE: 'pause',
      SPEED: 'speed',
      FORWARD: 'forward',
      BACKWARD: 'backward',
      CANVAS: 'canvas',
      PREVIOUS: 'previous',
      NEXT: 'next',
      STOP: 'stop',
      VOLUME: 'volume',
      FREQ_VISUALISER: 'freq-visualiser',
      EQUALIZER: 'equalizer',
      BALANCE: 'balance',
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getElements() {
    this.player = this.shadowRoot.getElementById(this.ids.PLAYER);
    this.play = this.shadowRoot.getElementById(this.ids.PLAY);
    this.pause = this.shadowRoot.getElementById(this.ids.PAUSE);
    this.speed = this.shadowRoot.getElementById(this.ids.SPEED);
    this.forward = this.shadowRoot.getElementById(this.ids.FORWARD);
    this.backward = this.shadowRoot.getElementById(this.ids.BACKWARD);
    this.canvas = this.shadowRoot.getElementById(this.ids.CANVAS);
    this.previous = this.shadowRoot.getElementById(this.ids.PREVIOUS);
    this.next = this.shadowRoot.getElementById(this.ids.NEXT);
    this.stop = this.shadowRoot.getElementById(this.ids.STOP);
    this.volume = this.shadowRoot.getElementById(this.ids.VOLUME);
    //Components
    this.freq_visualiser = this.shadowRoot.getElementById(this.ids.FREQ_VISUALISER);
    this.equalizer = this.shadowRoot.getElementById(this.ids.EQUALIZER);
    this.balance = this.shadowRoot.getElementById(this.ids.BALANCE);
  }

  startAnimations() {
    setTimeout(async () => {
      const min = this.volume.min;
      const max = this.volume.max;
      const step = this.volume.step;

      for(let i = 0; i < max; i += step) {
        await this.sleep(50);
        this.volume.value = i;
      }

      for(let i = max; i > 0.5; i -= step) {
        await this.sleep(50);
        this.volume.value = i;
      }

      this.player.volume = 0.5;

    }, 1000);
  }

  createListeners() {
      this.play.addEventListener('click', () => {
        this.player.play();
      });
      this.pause.addEventListener('click', () => {
        this.player.pause();
      });
      this.speed.addEventListener('change', ({ target: { value }}) => {
        this.player.playbackRate = parseFloat(value, 10);
      });
      this.forward.addEventListener('click', () => {
        this.player.currentTime += 10;
      });
      this.backward.addEventListener('click', () => {
        this.player.currentTime -= 10;
      });
      this.previous.addEventListener('click', () => {
        
      });
      this.next.addEventListener('click', () => {
        
      });
      this.stop.addEventListener('click', () => {
        this.player.currentTime = 0;
        this.player.pause();
      });
      this.volume.addEventListener('input', ({ target: { value }}) => {
        this.player.volume = parseFloat(value, 10);
      });
  }

}

customElements.define("my-player", MyAudioPlayer);
