import { v4 as generateUniqueId } from "https://jspm.dev/uuid"

// form and chat container elements init
const form = document.querySelector('form')
const chatContainer = document.getElementById('chat_container')

let loadInterval

// runs loading animation
function loader(element) {
  element.textContent = ''

  loadInterval = setInterval(() => {
    element.textContent += '.'

    if (element.textContent === '....') {
      element.textContent = ''
    }
  }, 300)
}

// prints text one letter at a time
function typeText(element, text) {
  let index = 0

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index)
      index++
    } else {
      clearInterval(interval)
    }
  }, 20)
}

function chatBox(isAi, value, uniqueId) {
  return `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAi ? './assets/bot.svg' : './assets/user.svg'}"
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
}

async function handleSubmit(e) {
  console.log(e)
  e.preventDefault()
  const data = new FormData(form)

  // user's chat box
  chatContainer.innerHTML += chatBox(false, data.get('prompt'))

  // bot's chat box
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatBox(true, ' ', uniqueId)

  chatContainer.scrollTop = chatContainer.scrollHeight

  const messageDiv = document.getElementById(uniqueId)

  loader(messageDiv)

  // fetch data from the server
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval)
  messageDiv.innerHTML = ''

  if (response.ok) {
    const data = await response.json()
    const parsedData = data.bot.trim()

    typeText(messageDiv, parsedData)
  } else {
    const err = response.text()
    messageDiv.innerHTML = 'Something went wrong'
    alert(err)
  }
  form.reset()
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    handleSubmit(e)
  }
})
