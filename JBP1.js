// ==============================
// STEP 1: Select main elements
// ==============================
const productsContainer = document.getElementById('products');
const buyBtn = document.getElementById('buyBtn');
const checkoutSection = document.getElementById('checkout');
const totalPriceElement = document.getElementById('totalPrice');
const confirmBtn = document.getElementById('confirmBtn');
const confirmationSection = document.getElementById('confirmation');

// ✅ FIXED: Google Sheet database (CSV link must be in quotes!)
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPOsmot1IwJICuFiVMfCbQb66XN98z9nnpsNAS5Y01GrJOjsqSEyPEeE2DOYOCeq6UnsdY6syJ397J/pub?output=csv";

// ==============================
// STEP 1.5: Helper function to fix image links
// ==============================
function toDirectImageURL(url) {
    if (!url) return '';
    url = url.trim().replace(/^"|"$/g, ''); // remove quotes if they exist

    // Google Drive → direct link
    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
        if (idMatch && idMatch[1]) {
            return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
        }
    }

    // Dropbox → direct link
    if (url.includes('dropbox.com')) {
        return url
            .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
            .replace('?dl=0', '');
    }

    // GitHub → raw file
    if (url.includes('github.com') && url.includes('/blob/')) {
        return url
            .replace('github.com/', 'raw.githubusercontent.com/')
            .replace('/blob/', '/');
    }

    // Return as-is if already direct
    return url;
}

// ==============================
// STEP 2: Load products from Google Sheet
// ==============================
fetch(sheetURL)
    .then(response => response.text())
    .then(data => {
        const rows = data.trim().split("\n").slice(1); // Skip header row

        rows.forEach(row => {
            // ✅ Safer CSV split (ignores commas inside quotes)
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            // ✅ Convert bad links to direct links
            const image = toDirectImageURL(cols[0]?.replace(/"/g, ""));
            const name = cols[1]?.replace(/"/g, "");
            const brand = cols[2]?.replace(/"/g, "");
            const price = cols[3]?.replace(/"/g, "");

            if (!name || !price) return; // Skip empty rows

            const productDiv = document.createElement("div");
            productDiv.classList.add("product");

            productDiv.innerHTML = `
                <div class="product-image">
                    <img src="${image}" alt="${name}" loading="lazy"
                         referrerpolicy="no-referrer"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/150?text=No+Image';">
                </div>
                <div class="product-info">
                    <p>${name}</p>
                    <p>Brand: ${brand}</p>
                    <p>Price: ${price} Shillings</p>
                </div>
                <div class="product-select">
                    <label>
                        <input type="checkbox" value="${price}" data-name="${name}">
                        Select
                    </label>
                </div>
            `;

            productsContainer.appendChild(productDiv);
        });
    })
    .catch(error => console.error("Error loading products:", error));

// ==============================
// STEP 3: Handle "Buy" button
// ==============================
buyBtn.addEventListener('click', () => {
    const productCheckboxes = document.querySelectorAll('#products input[type="checkbox"]');
    let total = 0;

    productCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            total += parseFloat(checkbox.value);
        }
    });

    if (total === 0) {
        alert('Please select at least one product before buying.');
        return;
    }

    totalPriceElement.textContent = `Total Price: ${total} Shillings`;
    checkoutSection.style.display = 'block';
    checkoutSection.scrollIntoView({ behavior: 'smooth' });
});

// ==============================
// STEP 4: Handle confirming purchase
// ==============================
confirmBtn.addEventListener('click', () => {
    const phone = document.getElementById('phone').value;
    const location = document.getElementById('location').value;
    const payment = document.getElementById('payment').value;

    if (phone === '' || location === '') {
        alert('Please enter your phone number and delivery location.');
        return;
    }

    // ✅ WhatsApp integration
    const message = `New Order:
- Phone: ${phone}
- Location: ${location}
- Payment: ${payment}
- Total: ${totalPriceElement.textContent}`;

    // Replace with your real WhatsApp number (with country code, no "+")
    const whatsappNumber = "255712393685";
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank");

    checkoutSection.style.display = 'none';
    confirmationSection.style.display = 'block';

    console.log(`Order confirmed! Message sent to WhatsApp.`);
});
