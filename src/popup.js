function Greeting() {
  let now = new Date();

  let broadTime =
    now.getHours() < 12
      ? "morning"
      : now.getHours() > 17
      ? "evening"
      : "afternoon";

  let g = document.querySelector(".PGreeting");
  g.innerHTML = `Good ${broadTime}!`;
}
