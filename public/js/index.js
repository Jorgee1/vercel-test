document.body.replaceChildren()

console.log('FROM THE VERCEL FRONTEND')


const form = document.createElement('form')
form.className = 'login'

const usernameInput = document.createElement('input')
const passwordInput = document.createElement('input')
const buttonInput = document.createElement('input')
buttonInput.textContent = 'LogIn'

form.appendChild(usernameInput)
form.appendChild(passwordInput)
form.appendChild(buttonInput)

document.body.append(form)