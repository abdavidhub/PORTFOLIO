document.addEventListener("DOMContentLoaded", () => {
    const toasts = document.querySelectorAll(".toast-notification");

    toasts.forEach((toast) => {
        const closeButton = toast.querySelector(".toast-close");

        const fermerToast = () => {
            if (toast.classList.contains("toast-hide")) return;

            toast.classList.add("toast-hide");

            toast.addEventListener(
                "animationend",
                () => toast.remove(),
                { once: true }
            );
        };

        closeButton?.addEventListener("click", fermerToast);

        setTimeout(fermerToast, 5000);
    });
});