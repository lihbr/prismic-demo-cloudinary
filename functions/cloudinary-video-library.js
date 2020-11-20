require("dotenv").config();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CL_CLOUD_NAME,
  api_key: process.env.CL_API_KEY,
  api_secret: process.env.CL_API_SECRET
});

/**
 * Crawl all resources in Cloudinary
 * @param {String} current_cursor - Next page to crawl
 * @return {Array} - Crawled resources
 */
const crawlCloudinary = async current_cursor => {
  const { resources: videos, next_cursor } = await cloudinary.api.resources({
    resource_type: "video",
    max_results: 500,
    next_cursor: current_cursor,
    direction: -1,
    tags: true,
    context: true
  });

  if (!next_cursor) {
    return videos;
  } else {
    return [...videos, ...(await crawlCloudinary(next_cursor))];
  }
};

exports.handler = async (event, context) => {
  // 1. Check request is from Prismic
  try {
    if (
      Buffer.from(event.headers.authorization.replace(/^basic\s+/i, ""), "base64") /* eslint-disable-line prettier/prettier */
        .toString()
        .split(":")[0] !== process.env.PRISMIC_IF_TOKEN
    ) {
      throw new Error("Invalid Token");
    }
  } catch (error) {
    return {
      statusCode: 404,
      body: "Not Found"
    };
  }

  // 2. Determine page needed and first index
  const page = event.queryStringParameters.page
    ? parseInt(event.queryStringParameters.page) - 1
    : 0;
  const startIndex = page * 50;

  // 3. Get every videos in Cloudinary
  const videos = await crawlCloudinary();

  // 4. Build results object
  const results = videos.slice(startIndex, startIndex + 50).map(video => ({
    id: video.asset_id,
    title: video.public_id,
    description:
      (video.context && video.context.custom && video.context.custom.alt) ||
      "No alternative text provided",
    image_url: cloudinary.url(`${video.public_id}.jpg`, {
      resource_type: "video",
      fetch_format: "auto",
      quality: "auto",
      width: 300
    }),
    last_update: video.version * 1000, // add miliseconds
    blob: video
  }));

  // 5. Send back object
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      results_size: videos.length,
      results
    })
  };
};
