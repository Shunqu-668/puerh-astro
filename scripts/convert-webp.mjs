import sharp from "sharp";
import { readdirSync, statSync, existsSync } from "fs";
import { join, extname } from "path";

const IMG_DIR = "public/images";
const EXTS = [".jpg", ".jpeg", ".png"];
const tasks = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else {
      const ext = extname(entry).toLowerCase();
      if (!EXTS.includes(ext)) continue;
      const webpPath = full.replace(ext, ".webp");
      if (existsSync(webpPath)) continue;
      tasks.push(
        sharp(full)
          .webp({ quality: 82 })
          .toFile(webpPath)
          .then(() => {
            const origSize = statSync(full).size;
            const newSize = statSync(webpPath).size;
            const pct = ((1 - newSize / origSize) * 100).toFixed(0);
            console.log(`${pct}% ${full}`);
          })
          .catch(err => console.error(`FAIL ${full}: ${err.message}`))
      );
    }
  }
}

walk(IMG_DIR);
console.log(`待转换: ${tasks.length} 张图片\n`);

await Promise.all(tasks);
console.log(`\n✅ 全部完成: ${tasks.length} 张图片已转为 WebP`);
