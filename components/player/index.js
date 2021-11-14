import '../libs/webaudio-controls.js';
import '../freq/index.js';
import '../equalizer/index.js';
import '../balance/index.js';
import '../vu_metter/index.js';
const AudioContext = window.AudioContext || window.webkitAudioContext;

const getBaseUrl = () => {
  return "https://github.com/Dorian-Chapoulie/tp_webcomponents/tree/main/components";
}


const template = document.createElement("template");
template.innerHTML = /*html*/`
  <style>
    label {
      color: #560A86 !important;
    }
    #currentSound {
      color: #560A86;
      font-family: "monospace";
      font-weight: bolder;
    }
  </style>
  <div style="z-index: 9999;">
    <audio id="myplayer" controls crossorigin="anonymous" style="visibility: hidden;"></audio>
    <br>
    
    <button id="previous" style="opacity: 0; cursor: grab; position: absolute; top: 348px; left: 440px;">Pre</button>
    <button id="backward" style="opacity: 0; cursor: grab; position: absolute; top: 348px; left: 490px;">-10s</button>
    <button id="stop" style="opacity: 0; cursor: grab; position: absolute; top: 348px; left: 540px;">Sto</button>
    <button id="play" style="opacity: 0; cursor: grab; position: absolute; top: 348px; left: 590px;">Play</button>
    <button id="pause" style="opacity: 0; cursor: grab; position: absolute; top: 348px; left: 640px;">Pau</button>
    <button id="forward" style="opacity: 0; cursor: grab; position: absolute; top: 348px; left: 690px;">+10s</button>
    <button id="next" style="opacity: 0; cursor: grab; position: absolute; top: 348px; left: 740px;">Nex</button>
    <br>
    <label style="z-index: 9999; cursor: grab; position: absolute; top: 310px; left: 440px;">Vitesse de lecture</label>
    <input style="z-index: 9999; cursor: grab; position: absolute; top: 310px; left: 590px;" id="speed" type="range" value=1 min=0.2 max=4 step=0.1>
    <label style="z-index: 9999; cursor: grab; position: absolute; top: 310px; left: 730px;" id="speed_value">1</label>
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
      style="position: absolute; top: 108px; left: 65px;">
    </webaudio-knob>
    <br>
    <p id="currentSound" style="z-index: 9999; cursor: grab; position: absolute; top: 108px; left: 755px;"></p>
    <my-equalizer id="equalizer"></my-equalizer>
    <my-balance id="balance" ></my-balance>
    <vu-metter id="vu-metter"></vu-metter>
    <freq-visualiser id="freq-visualiser"></freq-visualiser>
  </di>
`;
//todo barre de prograssion
//visu des freq, wave forms, volume

class MyAudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.playList = [
      {
        url: "https://github.com/Dorian-Chapoulie/tp_webcomponents/tree/main/sounds/0.mp3",
        author: "Kavinsky",
        title: "Nightcall",
        index: 0,
      },
      {
        url: "https://github.com/Dorian-Chapoulie/tp_webcomponents/tree/main/sounds/1.mp3",
        author: "DaftPunk",
        title: "One More Time",
        index: 1,
      },
      {
        url: "https://github.com/Dorian-Chapoulie/tp_webcomponents/tree/main/sounds/2.mp3",
        author: "CyberPunk",
        title: "Never fade away",
        index: 2,
      },
      {
        url: "https://github.com/Dorian-Chapoulie/tp_webcomponents/tree/main/sounds/3.mp3",
        author: "System of a down",
        title: "Toxicity",
        index: 3,
      }
    ];
    this.currentSoundObject = this.playList[0];
    this.createIds();
  }

  connectedCallback() {
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.getElements();
    this.initAudio();
    this.createListeners();
    this.initDependencies();
    this.startAnimations();

    this.player.src = this.playList[0].url;
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
    
    this.updateCurrentSoundText();
  }

  updateCurrentSoundText () {
    this.currentSound.innerHTML = `Author: ${this.currentSoundObject.author}<br/>Title: ${this.currentSoundObject.title}`;
  }

  updateCurrentPlayerSong(song) {
    this.currentSoundObject = song;
    this.player.src = this.currentSoundObject.url;
    this.updateCurrentSoundText();
    this.player.play();
    this.player.playbackRate = this.speedValue;
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
      CURRENT_SOUND: 'currentSound',
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
    this.currentSound = this.shadowRoot.getElementById(this.ids.CURRENT_SOUND);
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
        this.speedValue = parseFloat(value, 10);
        this.player.playbackRate = parseFloat(value, 10);
      });
      this.forward.addEventListener('click', () => {
        this.player.currentTime += 10;
      });
      this.backward.addEventListener('click', () => {
        this.player.currentTime -= 10;
      });
      this.previous.addEventListener('click', () => {
        const length = this.playList.length;
        let song;
        if (this.currentSoundObject.index === 0) {
          song = this.playList[length - 1];
        } else {
          song = this.playList[this.currentSoundObject.index - 1];
        }
        this.updateCurrentPlayerSong(song);
      });
      this.next.addEventListener('click', () => {
        const length = this.playList.length;
        let song;
        if (this.currentSoundObject.index === length - 1) {
          song = this.playList[0];
        } else {
          song = this.playList[this.currentSoundObject.index + 1];
        }
        this.updateCurrentPlayerSong(song);
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
