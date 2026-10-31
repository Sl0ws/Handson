const tf = require('@tensorflow/tfjs');
const fs = require('fs');
const path = require('path');

async function main() {
    const dir = path.resolve('public/models/fsl_model_tfjs');
    const json = JSON.parse(
        fs.readFileSync(path.join(dir, 'model.json'), 'utf8')
    );

    const manifest = json.weightsManifest;
    const specs = manifest.flatMap(group => group.weights);
    const shards = manifest.flatMap(group =>
        group.paths.map(file =>
            fs.readFileSync(path.join(dir, file))
        )
    );

    const combined = Buffer.concat(shards);
    const weightData = new Uint8Array(combined.length);
    weightData.set(combined);

    const model = await tf.loadLayersModel(tf.io.fromMemory({
        modelTopology: json.modelTopology,
        weightSpecs: specs,
        weightData: weightData.buffer
    }));

    console.log('MODEL LOADED');
    console.log('Input shape:', model.inputs[0].shape);
    console.log('Output shape:', model.outputs[0].shape);

    const input = tf.zeros([1, 16, 63]);
    const output = model.predict(input);
    console.log('Prediction:', Array.from(await output.data()));
    console.log('Prediction count:', output.shape[1]);

    input.dispose();
    output.dispose();
    model.dispose();
}

main().catch(error => {
    console.error('MODEL TEST FAILED:', error);
    process.exitCode = 1;
});
