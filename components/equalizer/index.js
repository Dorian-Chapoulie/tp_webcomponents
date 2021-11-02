import '../libs/webaudio-controls.js';
const AudioContext = window.AudioContext || window.webkitAudioContext;

const template = document.createElement("template");
template.innerHTML = /*html*/`
    <style>
    </style>
    <webaudio-slider
        midilearn="1"
        midicc="1.24" 
        src="../img/vsliderbody.png"
        knobsrc="../img/vsliderknob.png"
        value="0" min="0" max="100" step="1"
        basewidth="24"
        baseheight="128"
        knobwidth="24"
        knobheight="24"
        ditchlength="100"
        units="%"
        tooltip="Slider-R"
    >
    </webaudio-slider>
`;

class Equalizer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.createIds();
    }

    getBaseUrl() {
        return window.location.origin + '/components';
    }


    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.getElements();
        this.init();
        requestAnimationFrame(() => this.visualize());
    }

    init() {
        this.audioContext = new AudioContext();

        const interval = setInterval(() => {
            if (this.player) {
                this.player.onplay = (e) => { this.audioContext.resume(); }

                this.sourceNode = this.audioContext.createMediaElementSource(this.player);
                this.analyser = this.audioContext.createAnalyser();

                this.analyser.fftSize = 256;
                this.bufferLength = this.analyser.frequencyBinCount;
                this.dataArray = new Uint8Array(this.bufferLength);

                this.sourceNode.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);

                clearInterval(interval);
            }
        }, 500);

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.canvasContext = this.canvas.getContext('2d');
    }

    createIds() {
        this.ids = {
        CANVAS: 'canvas',
        };
    }

    getElements() {
        this.canvas = this.shadowRoot.getElementById(this.ids.CANVAS);
    }

    visualize() {
        if (!this.analyser) {
            setTimeout(() => {
                requestAnimationFrame(() => this.visualize());
            }, 100);
            return;
        }
        
        this.canvasContext.clearRect(0, 0, this.width, this.height);
        this.analyser.getByteFrequencyData(this.dataArray);
    
        const barWidth = this.width / this.bufferLength;
        var barHeight;
        var x = 0;
        const heightScale = this.height / 128;
    
        for(var i = 0; i < this.bufferLength; i++) {
            barHeight = this.dataArray[i];
            this.canvasContext.fillStyle = 'rgb(' + (barHeight + 100) + ', 50, 50)';
            barHeight *= heightScale;
            this.canvasContext.fillRect(x, this.height - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth + 1;
        }
        requestAnimationFrame(() => this.visualize());
  }
  

}

customElements.define("equalizer", Equalizer);
