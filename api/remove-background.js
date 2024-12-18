const { InferenceSession } = require('onnxruntime-node');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// External URL for the ONNX model
const modelUrl = 'https://github.com/satvik8373/data-100/releases/download/v1.0.0/u2net.onnx'; // Replace with your actual model URL
const modelPath = path.join('/tmp', 'u2net.onnx'); // Temporary path to store the model on Vercel

let session;

// Function to download the ONNX model
async function downloadModel() {
  try {
    console.log('Downloading the ONNX model from GitHub...');
    const response = await axios.get(modelUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(modelPath, response.data);
    console.log('ONNX model downloaded successfully.');
  } catch (error) {
    console.error('Error downloading the model:', error);
    throw new Error('Error downloading the model');
  }
}

// Function to load the model into ONNX Runtime
async function loadModel() {
  try {
    if (!fs.existsSync(modelPath)) {
      await downloadModel(); // Download if not present
    }
    session = await InferenceSession.create(modelPath);
    console.log('ONNX model loaded.');
  } catch (error) {
    console.error('Error loading the ONNX model:', error);
    throw new Error('Error loading the ONNX model');
  }
}

// Function for background removal using the model
async function removeBackground(imageBuffer) {
  try {
    const resizedImage = await sharp(imageBuffer).resize(320, 320).raw().toBuffer();
    const input = new Float32Array(resizedImage);

    // Run inference with the model
    const feeds = { input };
    const results = await session.run(feeds);

    // Process the mask and combine with the original image (to be implemented)
    const mask = results.output.data; // Adjust according to your model's output
    const combinedImage = await combineImageAndMask(imageBuffer, mask); // Combine logic to be implemented
    return combinedImage;
  } catch (error) {
    console.error('Error during background removal:', error);
    throw error;
  }
}

// Combine Image and Mask Logic (stub for implementation)
async function combineImageAndMask(originalImage, mask) {
  // Placeholder for actual mask processing logic
  const maskImage = await sharp(mask, { raw: { width: 320, height: 320, channels: 1 } })
    .toColourspace('b-w') // Convert to black & white
    .toBuffer();

  const processedImage = await sharp(originalImage)
    .resize(320, 320)
    .composite([{ input: maskImage, blend: 'dest-in' }])
    .toBuffer();

  return processedImage;
}

// Express Route for Background Removal API
module.exports = async (req, res) => {
  if (!session) await loadModel(); // Load model if not already loaded

  try {
    const imageBuffer = req.body; // Ensure you have the image buffer from the frontend
    const resultImage = await removeBackground(imageBuffer);

    res.setHeader('Content-Type', 'image/png');
    res.send(resultImage);
  } catch (error) {
    res.status(500).send('Error processing the image.');
  }
};
