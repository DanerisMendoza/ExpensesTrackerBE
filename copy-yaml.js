const fs = require('fs');
const path = require('path');

// Define source and destination directories
const sourceDir = path.join(__dirname, 'api/modules'); // Source directory
const destDir = path.join(__dirname, 'dist/modules'); // Destination directory

// Ensure destination directory exists
fs.mkdirSync(destDir, { recursive: true });

// Read all modules in the source directory
fs.readdirSync(sourceDir).forEach(module => {
    const modulePath = path.join(sourceDir, module);
    
    // Check if it's a directory
    if (fs.statSync(modulePath).isDirectory()) {
        const yamlFilePath = path.join(modulePath, 'swagger.yaml'); // Path to the YAML file

        // Check if the YAML file exists
        if (fs.existsSync(yamlFilePath)) {
            // Ensure the destination subdirectory exists
            const moduleDestDir = path.join(destDir, module); // Create a subdirectory for each module
            fs.mkdirSync(moduleDestDir, { recursive: true });

            // Copy the YAML file to the destination subdirectory
            const destFilePath = path.join(moduleDestDir, 'swagger.yaml'); // Keep the same filename
            fs.copyFileSync(yamlFilePath, destFilePath);
            console.log(`Copied ${yamlFilePath} to ${destFilePath}`);
        } else {
            console.log(`No YAML file found at ${yamlFilePath}`);
        }
    }
});
