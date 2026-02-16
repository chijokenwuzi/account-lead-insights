const freeCallForm = document.querySelector("#freeCallForm");
const freeCallMessage = document.querySelector("#freeCallMessage");

if (freeCallForm && freeCallMessage) {
  freeCallForm.addEventListener("submit", (event) => {
    event.preventDefault();
    freeCallMessage.textContent = "Thanks. Intake received. Continuing to ad setup...";
    freeCallMessage.className = "message success";
    window.setTimeout(() => {
      window.location.href = "/marketing-lead-gen?fresh=1";
    }, 550);
  });
}
