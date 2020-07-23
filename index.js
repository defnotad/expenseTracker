let vendorItems = document.querySelectorAll(".dropdown-item");

for (let i = 0; i < vendorItems.length; i++) {
    vendorItems[i].addEventListener("click", function () {
        document.querySelector(".vendor-btn").textContent = this.innerText;
    });
}

