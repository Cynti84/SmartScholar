// test-gemini.js
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;

console.log("Testing API Key:", apiKey?.substring(0, 15) + "...");

async function testAPI() {
  // Test 1: List available models
  console.log("\n=== Test 1: Listing Models ===");
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();

    if (response.ok) {
      console.log("✅ Available models:");
      data.models?.forEach((model) => {
        console.log(`  - ${model.name}`);
        console.log(
          `    Supported methods: ${model.supportedGenerationMethods?.join(
            ", "
          )}`
        );
      });
    } else {
      console.error("❌ Error listing models:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
  }

  // Test 2: Try generating content with different model names
  const modelNamesToTest = [
    "gemini-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "models/gemini-pro",
  ];

  for (const modelName of modelNamesToTest) {
    console.log(`\n=== Test 2: Trying model "${modelName}" ===`);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Say hello" }] }],
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Model "${modelName}" works!`);
        console.log(
          `   Response: ${data.candidates?.[0]?.content?.parts?.[0]?.text}`
        );
        break; // Stop testing once we find a working model
      } else {
        console.log(
          `❌ Model "${modelName}" failed:`,
          data.error?.message || JSON.stringify(data, null, 2)
        );
      }
    } catch (error) {
      console.log(`❌ Model "${modelName}" error:`, error.message);
    }
  }
}

testAPI();
