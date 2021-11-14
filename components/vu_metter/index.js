import '../libs/webaudio-controls.js';

const getBaseUrl = () => {
    return window.location.origin + '/components';
}

const template = document.createElement("template");
template.innerHTML = /*html*/`
    <style>
    </style>
    <webaudio-knob
        id="vu-metter"
        src="${getBaseUrl()}/assets/img/vu.png"
        value=0
        min=0
        max=1
        step=0.1
        width=200
        height=150
        sprites=99
        tooltip="dB"
    >
    </webaudio-knob>
`;

class VU_METTER extends HTMLElement {
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
        this.startAnimation();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    startAnimation() {
        setTimeout(async () => {
          const max = this.vu_metter.max;
          const step = this.vu_metter.step;
    
          for(let i = 0; i < max; i += step) {
            await this.sleep(10);
            this.vu_metter.value = i;
          }
    
          for(let i = max; i > 0; i -= step) {
            await this.sleep(10);
            this.vu_metter.value = i;
          }
    
        }, 1000);
    }

    init() {
        const interval = setInterval(() => {
            if (this.audioContext) {
            
                this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);
                this.processor.onaudioprocess = (e) => {
                    var input = e.inputBuffer.getChannelData(0);
                    let len = input.length   
                    let total = 0;
                    let i = 0
                    let rms;
                    while ( i < len ) total += Math.abs( input[i++] );
                    rms = Math.sqrt( total / len );
                    this.vu_metter.value = (rms <= 1 ? rms : 1);
                };
                this.addAudioNode(this.processor);
                clearInterval(interval);
            }
        }, 100);

    }

    createIds() {
        this.ids = {
            VU_METTER: 'vu-metter',
        };
    }

    getElements() {
        this.vu_metter = this.shadowRoot.getElementById(this.ids.VU_METTER);
    }

}

customElements.define("vu-metter", VU_METTER);
