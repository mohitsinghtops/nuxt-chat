import Swal from "sweetalert2";
import type { SweetAlertIcon } from "sweetalert2";

export default (
    status: SweetAlertIcon,
    title: string,
) => {
    const Toast = Swal.mixin({
        customClass: 'sweetalert',
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 4000,
        width: 500,
        background: "#131415",
        color: "#fff",
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
    });

    Toast.fire({
        icon: `${status}`,
        title: `${title}`,
    });
};
