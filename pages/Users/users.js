const asideMenu = document.querySelector(".aside-menu");
const menuHeaderButton = document.querySelector(".menu-header-button");
const cancelHeaderButton = document.querySelector(".cancel-header-button");
const asideMenuItems = document.querySelectorAll(".aside-menu li");
const body = document.querySelector("body");
let isOpen = false;

disableButton(cancelHeaderButton);

menuHeaderButton.addEventListener("click", () => {
    asideMenu.classList.add("isOpen");
    isOpen = true;
    update();
});

cancelHeaderButton.addEventListener("click", () => {
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
        enableButton(cancelHeaderButton);
        disableButton(menuHeaderButton);
        body.style.overflow = "hidden";
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        enableButton(menuHeaderButton);
        disableButton(cancelHeaderButton);
        body.style.overflowY = "auto";
    }
}

