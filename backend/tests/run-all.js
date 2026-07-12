const { execSync } = require("child_process");
const path = require("path");

const testFiles = [
  "auth.test.js",
  "booking.test.js",
  "tutorprofile.test.js",
  "tutorSearch.test.js",
  "review.test.js",
  "notification.test.js",
  "admin.test.js",
];

for (const file of testFiles) {
  console.log(`\n\n########## RUNNING: ${file} ##########`);
  try {
    const output = execSync(`node ${path.join(__dirname, file)}`, { encoding: "utf-8" });
    console.log(output);
  } catch (err) {
    console.log(err.stdout || err.message);
  }
}

console.log("\n\n=== ALL TEST FILES COMPLETE ===");
