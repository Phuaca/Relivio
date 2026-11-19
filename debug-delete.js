console.log('=== DELETE BUTTON DEBUG ===');

// Test if donation was posted
setTimeout(() => {
    const donationCards = document.querySelectorAll('[data-user-donation]');
    console.log('User donation cards found:', donationCards.length);

    donationCards.forEach((card, index) => {
        console.log(`Card ${index}:`, card);
        const deleteBtn = card.querySelector('.delete-donation-btn');
        console.log(`  Delete button:`, deleteBtn);

        if (deleteBtn) {
            console.log(`  Button has click listener: YES`);
            // Manually add click listener as backup
            deleteBtn.addEventListener('click', function (e) {
                console.log('DELETE BUTTON CLICKED!');
                e.stopPropagation();
                e.preventDefault();
                if (confirm('Delete this donation?')) {
                    card.remove();
                    console.log('Card removed');
                }
            });
        } else {
            console.log(`  Delete button: NOT FOUND!`);
        }
    });
}, 2000);
