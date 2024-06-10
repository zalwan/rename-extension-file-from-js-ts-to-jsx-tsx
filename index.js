import fs from "fs";
import path from "path";
import inquirer from "inquirer";

const srcDirectoryPath = "./src";

const directoryContainsFiles = (dir, ext) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (directoryContainsFiles(filePath, ext)) {
        return true;
      }
    } else if (path.extname(file) === ext) {
      return true;
    }
  }
  return false;
};

const renameFiles = (dir, oldExt, newExt) => {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error("Unable to scan directory:", err);
      return;
    }

    files.forEach((file) => {
      const oldPath = path.join(dir, file);
      fs.stat(oldPath, (err, stat) => {
        if (err) {
          console.error(`Error reading file ${file}:`, err);
          return;
        }

        if (stat.isDirectory()) {
          renameFiles(oldPath, oldExt, newExt);
        } else if (path.extname(file) === oldExt) {
          const newPath = path.join(dir, path.basename(file, oldExt) + newExt);
          fs.rename(oldPath, newPath, (err) => {
            if (err) {
              console.error(`Error renaming file ${file}:`, err);
            } else {
              console.log(`Renamed ${file} to ${newPath}`);
            }
          });
        }
      });
    });
  });
};

inquirer
  .prompt([
    {
      type: "list",
      name: "conversion",
      message: "Select extension conversion:",
      choices: [
        {
          name: "JS ke JSX",
          value: {
            oldExt: ".js",
            newExt: ".jsx",
          },
        },
        {
          name: "TS ke TSX",
          value: {
            oldExt: ".ts",
            newExt: ".tsx",
          },
        },
      ],
    },
  ])
  .then((answers) => {
    const { oldExt, newExt } = answers.conversion;
    let directoryToScan = null;

    if (directoryContainsFiles(srcDirectoryPath, oldExt)) {
      directoryToScan = srcDirectoryPath;
    }

    if (!directoryToScan) {
      console.warn(
        `There are no files with the extension ${oldExt} in the src directory or its subdirectories.`
      );
      return;
    }

    renameFiles(directoryToScan, oldExt, newExt);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
