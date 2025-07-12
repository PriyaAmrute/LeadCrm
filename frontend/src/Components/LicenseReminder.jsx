import { useEffect } from "react";
import Swal from "sweetalert2";

const LicenseReminder = () => {
  useEffect(() => {
    const expiryDateStr = localStorage.getItem("license_expiry");
    if (expiryDateStr) {
      const expiryDate = new Date(expiryDateStr);
      const today = new Date();

      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 5 && diffDays > 0) {
        Swal.fire({
          icon: "warning",
          title: `⚠ License expires in ${diffDays} days`,
          text: "Please renew your license to avoid interruption.",
          confirmButtonText: "OK",
        });
      }
    }
  }, []);

  return null; // it doesn't render anything visually
};

export default LicenseReminder;
