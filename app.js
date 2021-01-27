//variables
const cartBtn = document.querySelector(".cart-btn");
const cartCloseBtn = document.querySelector(".close-cart");
const cartClearBtn = document.querySelector(".clear-cart");
const cartDom = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const prodectDom = document.querySelector(".products-center");


//cart Items 
let cart = [];
//buttons 
let buttonsCartDom = [];


//getting the prodect from json
class productData {
    async getProduct() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();
            let prodect = data.items;
            prodect = prodect.map(item => {
                const { title, price } = item.fields;
                const id = item.sys.id;
                const img = item.fields.image.fields.file.url;
                return { title, price, id, img };
            });

            return prodect;

        } catch (e) {
            console.log(e);
        }
    }
}

//getting UI class to display on dom 
class displayProdectUI {
    displayProdect(prodectsData) {
        let result = "";
        console.log(prodectsData)
        prodectsData.forEach(prodectData => {
            result += `
                <article class="product">
                <div class="img-container">
                    <img src=${prodectData.img} alt="prodect 1" class="product-img">
                    <button class="bag-btn" data-id=${prodectData.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to bag
                    </button>
                </div>
                <h3>${prodectData.title}</h3>
                <h4>$${prodectData.price}</h4>
            </article>`;
        });

        prodectDom.innerHTML = result;
    };


    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsCartDom = buttons;

        buttons.forEach(btn => {
            let id = btn.dataset.id;
            let inCart = cart.find(item => item.getProduct.id === id);

            if (inCart) {
                btn.innerText = "In Cart";
                btn.disabled = true;
            }
            btn.addEventListener('click', e => {
                e.target.innerText = "In Cart";
                e.target.disabled = true;

                //get products form localstorge
                let getProduct = Storge.getProduct(id);
                let amount = 1;
                let cartItem = { getProduct, amount };

                //add porduct to cart array
                cart = [...cart, cartItem];
                //sava cart items to local storge
                Storge.saveToCart(cart);
                //set cart value 
                this.setCartValue(cart);
                // display cart to UI
                this.addCartItem(cartItem);

                // show the cart 
                this.showCart();

            });
        });
    }

    setCartValue(cart) {
        let temperryTotal = 0;
        let itemTotal = 0;

        cart.map(item => {
            temperryTotal += item.getProduct.price * item.amount;
            itemTotal += item.amount;

        });
        cartTotal.innerText = parseFloat(temperryTotal.toFixed(2));
        cartItems.innerText = itemTotal;

    }
    addCartItem(cart) {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        //fliter cart this for works on all browser 
        try {

            cartItem.innerHTML = `
                    <img src=${cart.getProduct.img} alt="${cart.getProduct.title}">
                    <div>
                        <h4>${cart.getProduct.title}</h4>
                        <h5>$${cart.getProduct.price}</h5>
                        <span class="remove-item" data-id=${cart.getProduct.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${cart.getProduct.id}></i>
                        <p class="item-amount">${cart.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${cart.getProduct.id}></i>
                    </div>`;

            cartContent.appendChild(cartItem);

        } catch (e) {
            console.log(e);
        }
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDom.classList.add('showCart');
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDom.classList.remove('showCart');
    }

    setupAPP() {
        cart = Storge.savedDataCart();
        this.setCartValue(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        cartCloseBtn.addEventListener('click', this.hideCart);

    }
    populateCart(cart) {

        cart.forEach(item => {
            this.addCartItem(item);
        });
    }

    cartLogic() {
        //clear all cart 
        cartClearBtn.addEventListener('click', () => {
            this.clearCart();
        });

        cartContent.addEventListener('click', e => {

            if (e.target.classList.contains("remove-item")) {
                this.removeSingleItem(e.target);
            }
            if (e.target.classList.contains("fa-chevron-up")) {
                let addAmount = e.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.getProduct.id === id);
                tempItem.amount += 1;
                Storge.saveToCart(cart);
                this.setCartValue(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            if (e.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = e.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.getProduct.id === id);
                tempItem.amount -= 1;

                if (tempItem.amount < 1) {
                    cartContent.removeChild(lowerAmount.parentNode.parentNode);
                    this.removeItem(id);

                } else {
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                    Storge.saveToCart(cart);
                    this.setCartValue(cart);
                }
            }
        });
    }
    removeSingleItem(item) {
        let itemID = item.dataset.id;
        console.log(itemID)
        this.removeItem(itemID);
        cartContent.removeChild(item.parentNode.parentNode);
    }
    clearCart() {
        let cartItemID = cart.map(item => item.getProduct.id);
        cartItemID.forEach(id => this.removeItem(id));

        //while item in cart is > 0 remove them 
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
    removeItem(id) {
        cart = cart.filter(item => item.getProduct.id !== id);
        this.setCartValue(cart);
        //update the storge after clear cart
        Storge.saveToCart(cart);
        let button = this.getSingleButton(id);

        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
    }
    getSingleButton(id) {
        return buttonsCartDom.find(button => button.dataset.id === id);
    }
}

//Local storge to store data localy
class Storge {
    static storgeProduct(prodects) {
        localStorage.setItem("product", JSON.stringify(prodects));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("product"));

        return products.find(item => item.id === id);
    }
    static saveToCart(cart) {
        localStorage.setItem("cartItem", JSON.stringify(cart));
    }
    static savedDataCart() {
        //check if there is data on cart storge or not 
        return localStorage.getItem("cartItem") ? JSON.parse(localStorage.getItem("cartItem")) : [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let UI = new displayProdectUI();
    let productsData = new productData();
    //this method for make all data saved on cart when refresh
    UI.setupAPP();

    productsData.getProduct().then(data => {
        UI.displayProdect(data);
        Storge.storgeProduct(data);

    }).then(() => {
        UI.getBagButtons();
        UI.cartLogic();
    });
});