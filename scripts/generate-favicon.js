/**
 * favicon.svg 파일을 다양한 크기의 PNG 파일로 변환하는 스크립트
 * 
 * 이 스크립트는 public/favicon.svg 파일을 다양한 크기의 PNG 파일로 변환하여
 * public 디렉토리에 저장합니다. 이 파일들은 웹사이트의 파비콘으로 사용됩니다.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// ES 모듈에서 __dirname 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 디렉토리 경로 설정
const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'favicon.svg');

// 생성할 파비콘 크기 설정
const sizes = [16, 32, 48, 64, 192, 512];
const iconsToGenerate = [
  { name: 'favicon.ico', size: 32 },
  { name: 'favicon.png', size: 64 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'favicon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
];

async function generateFavicons() {
  try {
    // SVG 파일이 존재하는지 확인
    if (!fs.existsSync(svgPath)) {
      console.error('SVG 파일을 찾을 수 없습니다:', svgPath);
      return;
    }

    // SVG 파일을 읽어옴
    const svgBuffer = fs.readFileSync(svgPath);
    
    // 각 크기별로 PNG 파일 생성
    for (const icon of iconsToGenerate) {
      const outputPath = path.join(publicDir, icon.name);
      
      console.log(`${icon.name} 생성 중... (${icon.size}x${icon.size})`);
      
      // ICO 파일인 경우 PNG로 생성 후 이름만 변경
      if (icon.name === 'favicon.ico') {
        await sharp(svgBuffer)
          .resize(icon.size, icon.size)
          .png()
          .toFile(outputPath);
      } else {
        await sharp(svgBuffer)
          .resize(icon.size, icon.size)
          .png()
          .toFile(outputPath);
      }
    }

    console.log('모든 파비콘이 성공적으로 생성되었습니다!');
  } catch (error) {
    console.error('파비콘 생성 중 오류 발생:', error);
  }
}

// 파비콘 생성 실행
generateFavicons(); 