// Create a subtle parallax effect on the title and buttons
document.addEventListener("mousemove", (e) => {
  const container = document.querySelector(".container");
  const title = document.querySelector("h1");
  const buttons = document.querySelectorAll("button");

  // Calculate mouse position relative to center of screen
  const mouseX = e.clientX / window.innerWidth - 0.5;
  const mouseY = e.clientY / window.innerHeight - 0.5;

  // Apply subtle movement to elements
  title.style.transform = `translateX(${mouseX * 20}px) translateY(${
    mouseY * 10
  }px)`;

  buttons.forEach((button, index) => {
    // Different movement amount for each button creates depth
    const depth = (index + 1) * 1.5;
    button.style.transform = `translateX(${mouseX * 10 * depth}px) translateY(${
      mouseY * 5 * depth
    }px)`;
  });
});
