const asideMenu = document.querySelector(".aside-menu");
const menuButton = document.querySelector(".menu-button");
const cancelButton = document.querySelector(".cancel-button");
const asideMenuItems = document.querySelectorAll(".aside-menu li");
const body = document.querySelector("body");
let isOpen = false;

disableButton(cancelButton);

menuButton.addEventListener("click", () => {
    asideMenu.classList.add("isOpen");
    isOpen = true;
    update();
});

cancelButton.addEventListener("click", () => {
    asideMenu.classList.remove("isOpen");
    isOpen = false;
    update();
});

asideMenuItems.forEach((item) => {
    item.addEventListener("click", () => {
        asideMenuItems.forEach((item) => item.classList.remove("active"));
        item.classList.add("active");
    });
});

function enableButton(button) {
    button.style.opacity = 1;
    button.style.cursor = "pointer";
}
function disableButton(button) {
    button.style.opacity = 0;
    button.style.cursor = "default";
}
function update() {
    if (isOpen) {
        enableButton(cancelButton);
        disableButton(menuButton);
        body.style.overflow = "hidden";
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        enableButton(menuButton);
        disableButton(cancelButton);
        body.style.overflow = "auto";
    }
}