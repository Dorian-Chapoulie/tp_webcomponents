import '../libs/webaudio-controls.js';

const template = document.createElement("template");
template.innerHTML = /*html*/`
  <style>
  </style>
  <canvas id="canvas" width=300 height=100></canvas>
`;

class FrequencyVisualiser extends HTMLElement {
    constructor(params) {
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
        const interval = setInterval(() => {
            if (this.audioContext) {
                this.analyser = this.audioContext.createAnalyser();

                this.analyser.fftSize = 256;
                this.bufferLength = this.analyser.frequencyBinCount;
                this.dataArray = new Uint8Array(this.bufferLength);

                this.addAudioNode(this.analyser);
                clearInterval(interval);
            }
        }, 100);

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

customElements.define("freq-visualiser", FrequencyVisualiser);
