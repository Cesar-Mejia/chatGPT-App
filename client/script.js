const form = document.querySelector('form')
const chatContainer = document.getElementById('chat_container')

let loadInterval

// function to run loading animation
function loader(element) {
  element.textContent = ''

  loadInterval = setInterval(() => {
    element.textContent += '.'

    if (element.textContent === '....') {
      element.textContent = ''
    }
  }, 300)
}

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

// generates a unique id
function generateUniqueId() {
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const hexaDecimalString = randomNumber.toString(16)

  return `id-${timestamp}-${hexaDecimalString}`
}

function chatStripe(isAi, value, uniqueId) {
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
  e.preventDefault()
  const data = new FormData(form)

  // user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  // bot's chat stripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId)

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
