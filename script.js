function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', () => {
    const scrollToTopButton = document.querySelector('.scroll-to-top');
    if (scrollToTopButton) {
        if (window.pageYOffset > 100) {
            scrollToTopButton.classList.add('show');
        } else {
            scrollToTopButton.classList.remove('show');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    
    const navbar = document.getElementById('navbar');
    const bar = document.getElementById('bar');
    const close = document.getElementById('close');
    const searchIcon = document.getElementById('search-icon');
    const searchForm = document.getElementById('search-form');

    if (bar) {
        bar.addEventListener('click', () => {
            navbar.classList.add('active');
        });
    }

    if (close) {
        close.addEventListener('click', () => {
            navbar.classList.remove('active');
        });
    }

    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            searchForm.classList.toggle('active');
        });
    }

    const swiper = new Swiper('.swiper-container', {
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        loop: true,
        spaceBetween: 30,
    });

   
    const toggleAllInfoBtn = document.querySelector('.toggle-all-info-btn');
    const productInfos = document.querySelectorAll('.product-info');

    if (toggleAllInfoBtn) {
        toggleAllInfoBtn.addEventListener('click', () => {
            productInfos.forEach(info => {
                info.classList.toggle('hidden');
            });

            const isHidden = productInfos[0]?.classList.contains('hidden');
            toggleAllInfoBtn.innerHTML = isHidden
                ? '<i class="fas fa-eye-slash"></i>'
                : '<i class="fas fa-eye"></i>';
        });
    }

    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const itemWidth = carouselItems[0]?.offsetWidth || 0;
    const totalItems = carouselItems.length;
    let index = 0;

    function updateCarousel() {
        const offset = -index * (itemWidth + 30); 
        if (carouselWrapper) {
            carouselWrapper.style.transform = `translateX(${offset}px)`;
        }
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            index++;
            if (index >= totalItems) index = 0;
            updateCarousel();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            index--;
            if (index < 0) index = totalItems - 1;
            updateCarousel();
        });
    }

    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartIcon = document.getElementById('lg-bag');

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        if (cartIcon) {
            cartIcon.querySelector('span')?.remove(); 
            if (itemCount > 0) {
                const countElement = document.createElement('span');
                countElement.textContent = itemCount;
                countElement.className = 'cart-count';
                cartIcon.appendChild(countElement);
            }
        }
    }

    function addToCart(productElement) {
        if (!productElement) return;

        const productId = productElement.getAttribute('data-id');
        const productName = productElement.querySelector('.product-info h3')?.textContent || '';
        const productPrice = parseFloat(productElement.querySelector('.product-info .price')?.textContent.replace('$', '') || '0');
        const productImage = productElement.querySelector('img')?.src || '';

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const productIndex = cart.findIndex(item => item.id === productId);

        if (productIndex === -1) {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        } else {
            cart[productIndex].quantity++;
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        if (typeof toastr !== 'undefined') {
            toastr.success('Product added to cart!');
        } else {
            alert('Product added to cart!');
        }
    }

    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); 
                const productElement = button.closest('.carousel-item');
                addToCart(productElement);
            });
        });
    }

    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal');
    const discountEl = document.getElementById('discount');
    const totalEl = document.getElementById('total');
    const promoCodeInput = document.getElementById('promo-code');
    const applyPromoButton = document.getElementById('apply-promo');
    const promoMessage = document.getElementById('promo-message');

    function updateCart() {
        if (!cartItemsContainer || !subtotalEl || !discountEl || !totalEl) return;

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            subtotal += item.price * item.quantity;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <div class="quantity">
                        <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                        <input type="text" value="${item.quantity}" readonly>
                        <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                    </div>
                    <button class="remove-btn" data-id="${item.id}"> Remove<i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        const discount = promoCodeInput.value === '1234' ? subtotal * 0.5 : 0;
        const total = subtotal - discount;

        subtotalEl.textContent = subtotal.toFixed(2);
        discountEl.textContent = discount.toFixed(2);
        totalEl.textContent = total.toFixed(2);
    }

    function handleCartActions(e) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (e.target.classList.contains('quantity-btn')) {
            const id = e.target.getAttribute('data-id');
            const action = e.target.getAttribute('data-action');
            const item = cart.find(item => item.id === id);

            if (item) {
                if (action === 'increase') {
                    item.quantity++;
                } else if (action === 'decrease' && item.quantity > 1) {
                    item.quantity--;
                }

                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart();
            }
        } else if (e.target.classList.contains('remove-btn')) {
            const id = e.target.getAttribute('data-id');
            const updatedCart = cart.filter(item => item.id !== id);

            localStorage.setItem('cart', JSON.stringify(updatedCart));
            updateCart();
        }
    }

    function applyPromoCode() {
        const promoCode = promoCodeInput.value;
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let subtotal = 0;
        
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        if (promoCode === '1234') {
            promoMessage.textContent = 'You are using a promo code for a 50% discount!';
            promoMessage.className = 'promo-message success';
            updateCart();
        } else {
            promoMessage.textContent = 'Invalid or expired promo code.';
            promoMessage.className = 'promo-message error';
        }
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', handleCartActions);
    }

    if (applyPromoButton) {
        applyPromoButton.addEventListener('click', applyPromoCode);
    }

    updateCart();
    updateCartCount();
});
document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('.product-add-to-cart-btn');
    const cartIcon = document.getElementById('lg-bag');

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        if (cartIcon) {
            cartIcon.querySelector('span')?.remove(); 
            if (itemCount > 0) {
                const countElement = document.createElement('span');
                countElement.textContent = itemCount;
                countElement.className = 'cart-count';
                cartIcon.appendChild(countElement);
            }
        }
    }

    function addToCart(productElement) {
        if (!productElement) return;

        const productId = productElement.getAttribute('data-id');
        const productName = productElement.querySelector('.product-name')?.textContent || '';
        const productPrice = parseFloat(productElement.querySelector('.product-price')?.textContent.replace('$', '') || '0');
        const productImage = productElement.querySelector('img')?.src || '';

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const productIndex = cart.findIndex(item => item.id === productId);

        if (productIndex === -1) {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        } else {
            cart[productIndex].quantity++;
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    function handleBadgeStatus(badge, button) {
        if (badge.textContent.trim() === 'Sold Out') {
            return;
        }

        if (badge.textContent.trim() === 'Last Two') {
            badge.textContent = 'Last One';
        } else if (badge.textContent.trim() === 'Last One') {
            badge.textContent = 'Sold Out';
            button.disabled = true;
            button.textContent = 'Sold Out';
        } else {
            badge.textContent = 'Last Two';
        }
    }

    addToCartButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); 

            const productItem = button.closest('.product-item');
            const badge = productItem.querySelector('.badge');

            handleBadgeStatus(badge, button);
            addToCart(productItem);

        });
    });

    updateCartCount();
});
document.addEventListener('DOMContentLoaded', () => {
    const swiper = new Swiper('#reviews-slider', {
        loop: true,
        slidesPerView: 1, 
        spaceBetween: 20,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    const ratingStars = document.querySelectorAll('#review-rating i');
    let selectedRating = 0;

    ratingStars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.getAttribute('data-value'));
            ratingStars.forEach(s => {
                s.classList.toggle('fas', parseInt(s.getAttribute('data-value')) <= selectedRating);
                s.classList.toggle('far', parseInt(s.getAttribute('data-value')) > selectedRating);
            });
        });
    });

    document.getElementById('review-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('review-name').value;
        const comment = document.getElementById('review-comment').value;
        const reviewImageInput = document.getElementById('review-image');
        const reviewsList = document.querySelector('.swiper-wrapper');

        const imageFile = reviewImageInput.files[0];
        const imageUrl = imageFile ? URL.createObjectURL(imageFile) : 'images/review/default.png';

        const reviewItem = document.createElement('div');
        reviewItem.className = 'swiper-slide review-card';
        reviewItem.innerHTML = `
            <div class="review-quote">“</div>
            <p class="review-text">${comment}</p>
            <div class="reviewer-info">
                <img src="${imageUrl}" alt="Reviewer Image" class="reviewer-image">
                <h3 class="reviewer-name">${name}</h3>
                <div class="reviewer-rating">
                    ${'★'.repeat(selectedRating)}${'☆'.repeat(5 - selectedRating)}
                </div>
            </div>
        `;

        reviewsList.appendChild(reviewItem);
        swiper.update(); 
        document.getElementById('review-form').reset();
        ratingStars.forEach(star => star.classList.add('far').remove('fas'));
    });
});
