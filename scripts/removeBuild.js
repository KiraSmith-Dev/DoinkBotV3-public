const path = require('path');
const fs = require('fs');

let buildDir = path.join(__dirname, '..', 'build');
if (!buildDir.endsWith('\\build')) {
    console.error(`Failed to find build folder: ${buildDir}`);
    process.exit(1);
}

try {
    fs.rmSync(buildDir, { recursive: true });
} catch (err) {
    if (err.code !== 'ENOENT')
        console.error(err);
}
