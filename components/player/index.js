import '../libs/webaudio-controls.js';
import '../freq/index.js';
import '../equalizer/index.js';
import '../balance/index.js';
import '../vu_metter/index.js';
const AudioContext = window.AudioContext || window.webkitAudioContext;

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
  <input id="speed" type="range" value=1 min=0.2 max=4 step=0.1>
  <label id="speed_value">1</label>
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
  <my-equalizer id="equalizer"></my-equalizer>
  <my-balance id="balance" ></my-balance>
  <vu-metter id="vu-metter"></vu-metter>
  <freq-visualiser id="freq-visualiser"></freq-visualiser>
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
    this.initAudio();
    this.createListeners();
    this.initDependencies();
    this.startAnimations();

    //todo: createPlaylist
    this.player.src = "${getBaseUrl()}/../sounds/soad.mp3";
  }

  initAudio() {
    this.audioContext = new AudioContext();
    this.sourceNode = this.audioContext.createMediaElementSource(this.player);
    this.sourceNode.connect(this.audioContext.destination);
    this.audioNodes = [this.sourceNode];
  }

  async connectAudioNode(audioNode) {
    audioNode.name = name;
    const length = this.audioNodes.length;
    const previousNode = this.audioNodes[length - 1];
    previousNode.connect(audioNode);
    audioNode.connect(this.audioContext.destination);
  }

  addAudioNode(audioNode, name) {
    audioNode.name = name;
    const length = this.audioNodes.length;
    const previousNode = this.audioNodes[length - 1];
    previousNode.disconnect();
    previousNode.connect(audioNode);
    audioNode.connect(this.audioContext.destination);
    this.audioNodes.push(audioNode);
    console.log(`Linked ${previousNode.name || 'input'} to ${audioNode.name}`);
  }

  initDependencies() {
    //equalizer
    this.equalizer.audioContext = this.audioContext;
    this.equalizer.addAudioNode = (audioNode) => this.addAudioNode(audioNode, "equalizer");
    //balance
    this.balance.audioContext = this.audioContext;
    this.balance.addAudioNode = (audioNode) => this.addAudioNode(audioNode, "balance");

    //We must process the audio before drawing the visualisers
    setTimeout(() => {
      //vu metter
      this.vu_metter.audioContext = this.audioContext;
      this.vu_metter.addAudioNode = (audioNode) => this.connectAudioNode(audioNode, "vu metter");
      //cavans freq vvisualier
      this.freq_visualiser.audioContext = this.audioContext;
      this.freq_visualiser.addAudioNode = (audioNode) => this.connectAudioNode(audioNode, "freq visualier");
    }, 1000);
    
  }

  createIds() {
    this.ids = {
      PLAYER: 'myplayer',
      PLAY: 'play',
      PAUSE: 'pause',
      SPEED: 'speed',
      SPEED_LABEL: 'speed_value',
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
      VU_METTER: 'vu-metter',
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
    this.speedLabel = this.shadowRoot.getElementById(this.ids.SPEED_LABEL);
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
    this.vu_metter = this.shadowRoot.getElementById(this.ids.VU_METTER);
  }

  startAnimations() {
    setTimeout(async () => {
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
        this.speedLabel.innerHTML = parseFloat(value, 10);
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
      this.player.onplay = (e) => { this.audioContext.resume(); };
  }

}

customElements.define("my-player", MyAudioPlayer);
