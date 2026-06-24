const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: 'dvjy4jjxf',
  api_key: '866788599982198',
  api_secret: '65PLkqVLzmlGBYvxyC-IDf73mg0'
});

async function run() {
  try {
    console.log("Uploading sample image...");
    // 2. Upload an image
    const uploadResult = await cloudinary.uploader.upload('https://res.cloudinary.com/demo/image/upload/sample.jpg');
    console.log("Upload Success!");
    console.log("Secure URL:", uploadResult.secure_url);
    console.log("Public ID:", uploadResult.public_id);

    console.log("\nFetching image details...");
    // 3. Get image details
    console.log("Width:", uploadResult.width);
    console.log("Height:", uploadResult.height);
    console.log("Format:", uploadResult.format);
    console.log("File Size (bytes):", uploadResult.bytes);

    console.log("\nGenerating transformed image URL...");
    // 4. Transform the image
    // f_auto: Automatically chooses the best format (e.g. WebP, AVIF) depending on the browser support.
    // q_auto: Automatically optimizes the quality/compression ratio to reduce file size.
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      secure: true,
      fetch_format: 'auto',
      quality: 'auto'
    });
    console.log("Done! Click link below to see optimized version of the image. Check the size and the format.");
    console.log("Transformed URL:", transformedUrl);
  } catch (error) {
    console.error("Error during Cloudinary operations:", error);
  }
}

run();
