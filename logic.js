document.addEventListener("DOMContentLoaded", () => {
  const generateButton = document.getElementById("generate-button");
  const promptInput = document.getElementById("prompt");
  const temperatureSlider = document.getElementById("temperature");
  const temperatureValue = document.getElementById("temperature-value");
  const lengthSlider = document.getElementById("length");
  const lengthValue = document.getElementById("length-value");
  const generatedTextOutput = document.getElementById("generated-text");
  const probabilitiesList = document.getElementById("probabilities-list");

  // Update temperature value display
  temperatureSlider.addEventListener("input", () => {
    temperatureValue.textContent = temperatureSlider.value;
  });

  // Update length value display
  lengthSlider.addEventListener("input", () => {
    lengthValue.textContent = lengthSlider.value;
  });

  // Function to type the generated text word by word
  const typeGeneratedText = (text) => {
    generatedTextOutput.textContent = ""; // Clear any existing content
    const words = text.split(" "); // Split the text into words
    let index = 0;

    const typeNextWord = () => {
      if (index < words.length) {
        generatedTextOutput.textContent += words[index] + " "; // Append next word
        index++;
        setTimeout(typeNextWord, 150); // Adjust typing speed (in milliseconds)
      } else {
        // Append the dots after typing finishes
        setTimeout(() => {
          generatedTextOutput.textContent += "...";
        }, 300); // Delay for dramatic effect
      }
    };

    typeNextWord(); // Start typing
  };

  // Generate text on button click
  generateButton.addEventListener("click", async () => {
    const prompt = promptInput.value;
    const temperature = temperatureSlider.value;
    const maxLength = lengthSlider.value;

    if (!prompt.trim()) {
      generatedTextOutput.textContent = "Please enter a prompt.";
      return;
    }

    generatedTextOutput.textContent = "Generating...";
    probabilitiesList.innerHTML = ""; // Clear the probabilities list

    try {
      const response = await fetch("http://127.0.0.1:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          temperature: temperature,
          max_length: maxLength,
        }),
      });

      const data = await response.json();

      // Display generated text using the typewriter effect
      typeGeneratedText(data.generated_text);

      // Display top token probabilities
      const probabilities = data.probabilities;
      probabilities.forEach(({ token, probability }) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${token}: ${(probability * 100).toFixed(2)}%`;
        probabilitiesList.appendChild(listItem);
      });
    } catch (error) {
      generatedTextOutput.textContent =
        "An error occurred while generating text.";
      console.error(error);
    }
  });
});
