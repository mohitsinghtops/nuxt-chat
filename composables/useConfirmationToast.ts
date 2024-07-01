import Swal from "sweetalert2";
import type { SweetAlertIcon } from "sweetalert2";

export default (
    status: SweetAlertIcon,
    title: string,
) => {
    return Swal.fire({
        customClass: 'sweetalert',
        icon: status,
        title: title,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Yes",
        background: "#131415",
        color: "#fff",
        confirmButtonColor: '#ff0000',
    })
};
