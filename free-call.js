const freeCallForm = document.querySelector("#freeCallForm");
const freeCallMessage = document.querySelector("#freeCallMessage");

if (freeCallForm && freeCallMessage) {
  freeCallForm.addEventListener("submit", (event) => {
    event.preventDefault();
    freeCallMessage.textContent = "Thanks. Your intake was received. We will contact you soon.";
    freeCallMessage.className = "message success";
    freeCallForm.reset();
  });
}
