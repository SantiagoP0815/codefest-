async function submitForm(event) {
    event.preventDefault();
  
    // Get the hCAPTCHA token
    const hcaptchaToken = document.getElementById('hcaptcha-token').value;
  
    // Validate the hCAPTCHA token
    const captchaValid = await validateCaptcha(hcaptchaToken);
  
    // If the hCAPTCHA token is valid, submit the form
    if (captchaValid) {
      // Submit the form
      // ...
    } else {
      // Display an error message
      // ...
    }
  }