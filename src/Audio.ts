import { SAMPLE_RATE, SFX_CHANNELS } from './Const';

export class Audio {
    private static inst: Audio;
    public static getInstance(): Audio {
        if (Audio.inst == undefined) {
            Audio.inst = new Audio();
        }
        return Audio.inst;
    }

    private audioCtx: AudioContext;
    private splitter: ChannelSplitterNode;
    private merger: ChannelMergerNode;
    private que: Float32Array[] = [];

    private constructor() {
        this.audioCtx = new AudioContext({sampleRate: SAMPLE_RATE});
        this.splitter = this.audioCtx.createChannelSplitter(SFX_CHANNELS);
        this.merger = this.audioCtx.createChannelMerger(SFX_CHANNELS);
        for (let channel = 0; channel < SFX_CHANNELS; channel++) {
            this.splitter.connect(this.merger, channel);
        }
        this.merger.connect(this.audioCtx.destination);
        this.dequeue();
    }

    public enqueue (channel: number, sample: Float32Array): void {
        this.que[channel] = sample;
    }

    public dequeue (channel?: number): void {
        if (channel != undefined) {
            this.que[channel] = new Float32Array();
            return;
        }
        for (let channel = 0; channel < SFX_CHANNELS; channel++) {
            this.que[channel] = new Float32Array();
        }
    }

    public play (): void {
        let length = Math.max(...this.que.map(s => s.length));
        if (length == 0) {
            return;
        }
        let buffer = this.audioCtx.createBuffer(SFX_CHANNELS, length, SAMPLE_RATE);
        for (let channel = 0; channel < SFX_CHANNELS; channel++) {
            if (this.que[channel].length) {
                buffer.getChannelData(channel).set(this.que[channel]);
            }
        }
        this.playBuffer(buffer);
    }

    public playSample (sample: Float32Array): void {
        let buffer = this.audioCtx.createBuffer(SFX_CHANNELS, sample.length, this.audioCtx.sampleRate);
        buffer.getChannelData(0).set(sample);
        this.playBuffer(buffer);
    }

    private playBuffer (buffer: AudioBuffer) {
        let bufferSource = this.audioCtx.createBufferSource();
        bufferSource.buffer = buffer;
        bufferSource.connect(this.splitter);
        bufferSource.addEventListener('ended', () => {
            bufferSource.disconnect();
        });
        bufferSource.start();
    }
}
