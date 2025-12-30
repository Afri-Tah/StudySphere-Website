// Function to open WhatsApp with pre-filled message
function enroll(courseName, price) {
  // Replace your WhatsApp number here
  const phoneNumber = "8801712345678";

  // Construct message
  const message = `Hello, I want to enroll in "${courseName}" priced at BDT ${price}.`;

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // Open WhatsApp
  const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(url, "_blank");
}

// Optional: Smooth scroll for navbar links
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
