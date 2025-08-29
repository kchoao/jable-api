const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config');

async function validateUrl(url) {
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return {
      valid: response.status === 200,
      status: response.status
    };
  } catch (error) {
    return {
      valid: false,
      status: error.response?.status || 0,
      error: error.message
    };
  }
}

async function extractVideoInfo(videoCode) {
  try {
    const url = `https://jable.tv/videos/${videoCode}/`;
    
    // Validate URL before making expensive browserless call
    console.log(`Validating URL: ${url}`);
    const urlValidation = await validateUrl(url);
    
    if (!urlValidation.valid) {
      console.log(`URL validation failed: ${url} (Status: ${urlValidation.status})`);
      if (urlValidation.status === 404) {
        console.log(`Video not found: ${videoCode}`);
      } else if (urlValidation.status === 403) {
        console.log(`Access forbidden: ${videoCode}`);
      }
      return null;
    }
    
    console.log(`URL validation passed: ${url}`);
    
    const response = await axios.post(
      `${config.browserless.endpoint}/chromium/bql?token=${config.browserless.apiKey}`,
      {
        query: `
          mutation GetHTML {
            goto(url: "${url}") { status }
            html(timeout: 15000, visible: true) { html }
          }
        `
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );
    
    if (response.data.errors) {
      throw new Error('BQL query failed: ' + JSON.stringify(response.data.errors));
    }
    
    const htmlContent = response.data.data?.html?.html;
    if (!htmlContent) {
      throw new Error('No HTML content received');
    }
    
    const $ = cheerio.load(htmlContent);
    return extractVideoData($, videoCode, url);
    
  } catch (error) {
    console.error(`Error extracting video info for ${videoCode}:`, error.message);
    return null;
  }
}

function extractVideoData($, videoCode, url) {
  const videoInfo = {
    videoCode,
    title: null,
    actress: [],
    thumbnail: $('video').attr('poster') || null,
    duration: $('.duration, .video-duration').text().trim() || null,
    views: $('.views, .view-count').text().trim() || null,
    tags: [],
    textInfo: $('.text-info').parent().text().trim().replace('●', '').trim() || null,
    description: $('.description, .video-description').text().trim() || 
                 $('meta[name="description"]').attr('content') || null,
    url
  };

  const fullTitle = $('.info-header h4').text().trim() || 
                   $('title').text().trim().replace(' - Jable.tv', '');
  
  if (fullTitle) {
    const titleParts = fullTitle.split(' ');
    const actresses = [];
    let titleEndIndex = titleParts.length;
    
    for (let i = titleParts.length - 1; i >= 0; i--) {
      const part = titleParts[i];
      if (part && /^[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]+$/.test(part)) {
        actresses.unshift(part);
        titleEndIndex = i;
      } else {
        break;
      }
    }
    
    videoInfo.actress = actresses;
    videoInfo.title = titleParts.slice(0, titleEndIndex).join(' ').replace(/^[A-Z]+-\d+\s+/, '').trim();
  }

  $('h5.tags a').each((i, elem) => {
    const tag = $(elem).text().trim();
    if (tag) videoInfo.tags.push(tag);
  });

  return videoInfo;
}

module.exports = { extractVideoInfo };