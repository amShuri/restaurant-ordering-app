import { menuArray, ratingMessages } from './data.js'

const orderEl = document.getElementById('order')
const modalEl = document.getElementById('modal')
const formEl = document.getElementById('modal-form')
const orderListEl = document.getElementById('order-list')
const totalPriceEl = document.getElementById('total-price')
const orderSuccessEl = document.getElementById('order-success')
const discountEl = document.getElementById('discount')

let orderArr = []
let isOrderComplete = false

document.addEventListener('click', (e) => {
    e.preventDefault()

    if (e.target.dataset.add) {
        handleAddClick(e.target.dataset.add)
    }
    else if (e.target.dataset.remove) {
        handleRemoveClick(e.target.dataset.remove)
    }
    else if (e.target.id === 'purchase-btn') {
        modalEl.showModal()
    }
    else if (e.target.id === 'pay-btn') {
        handlePayClick()
    }
})

function handleAddClick(itemId) {
    const id = Number(itemId)
    const menuItem = menuArray.find((item) => item.id === id)
    const orderItem = orderArr.find((item) => item.id === id)

    if (orderItem) {
        orderItem.qty++
    }
    else {
        orderArr.push( {...menuItem, qty: 1} )
    }
    
    isOrderComplete = false
    updateUI()
}

function handleRemoveClick(itemId) {
    const id = Number(itemId)
    const orderItem = orderArr.find((item) => item.id === id)

    if (orderItem.qty > 1) {
        orderItem.qty--
    }
    else
    {
        orderArr.splice(orderArr.findIndex((item) => item.id === id), 1)
    }

    updateUI()
}

function handlePayClick() {
    modalEl.close()
    formEl.reset()
    orderArr = []
    isOrderComplete = true
    updateUI()
}

function getPricing() {
    const subTotal = orderArr.reduce((total, current) => {
        return total + (current.price * current.qty)
    }, 0)

    const hasDiscount = hasComboDiscount()
    const discountRate = hasDiscount ? 0.15 : 0
    const discountAmount = subTotal * discountRate
    const total = subTotal - discountAmount

    return { total, discountAmount, hasDiscount }
}

function hasComboDiscount() {
    return orderArr.some((item) => item.category === 'main') && 
           orderArr.some((item) => item.category === 'drink')
}

function renderTotalPrice() {
    const { total, discountAmount, hasDiscount } = getPricing()

    if (hasDiscount) {
        discountEl.textContent = `(You save $${discountAmount.toFixed(2)})`
    }
    else {
        discountEl.textContent = ''
    }

    totalPriceEl.textContent = `$${total.toFixed(2)}`
}

function updateUI() {
    if (isOrderComplete) {
        displaySuccessScreen()
    }
    else if (!orderArr.length) {
        displayMenuScreen()
    }
    else {
        displayOrderScreen()
        renderOrder()
        renderTotalPrice()
    }
}

function renderMenu() {
    document.getElementById('menu-list').innerHTML = getMenuHtml()
}

function renderOrder() {
    orderListEl.innerHTML = getOrderHtml()
}

function getMenuHtml() {
    return menuArray.map((item) => {
        const { emoji, name, ingredients, price, id } = item
        return `
        <li class="menu-item">
            <span class="emoji" aria-hidden="true">${emoji}</span>

            <div class="item-details">
                <h3>${name}</h3>
                <p class="ingredients">${ingredients.join(', ')}</p>
                <span class="price">$${price}</span>
            </div>

            <button 
                class="add-btn"
                aria-label="Add ${name} to order"
                data-add="${id}">
                +
            </button>
        </li>
        `
    }).join('')
}

function getOrderHtml() {
    return orderArr.map((item) => {
        const { name, price, qty, id } = item
        return `
        <li class="order-item">
            <span class="order-label">${name} (${qty})</span>
            <button class="remove-btn" data-remove="${id}">remove</button>
            <span class="price">$${(price * qty)}</span>
        </li>
        `
    }).join('')
}

function displaySuccessScreen() {
    orderEl.classList.add('hidden')
    orderSuccessEl.classList.remove('hidden')
}

function displayOrderScreen() {
    orderEl.classList.remove('hidden')
    orderSuccessEl.classList.add('hidden')
}

function displayMenuScreen() {
    orderEl.classList.add('hidden')
}

renderMenu()