require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config');

async function extractVideoInfo(videoCode) {
  try {
    const url = `https://jable.tv/videos/${videoCode}/`;
    console.log(`Fetching video info for: ${url}`);
    
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
    
    // Check if video exists by looking for 404 indicators or video elements
    const pageTitle = $('title').text().toLowerCase();
    const hasVideo = $('video').length > 0;
    const has404 = pageTitle.includes('404') || $('body').text().includes('404');
    
    if (has404 || (!hasVideo && !$('.info-header h4').length)) {
      console.log(`Video not found: ${videoCode}`);
      return null;
    }
    
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