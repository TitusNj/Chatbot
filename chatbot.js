const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");
const chatbotToggler = document.querySelector(".chatbot-toggler");
const chatbotCloseBtn = document.querySelector(".close-btn");

let userMessage;
let currentOption = null;

const clearChat = () => {
    chatbox.innerHTML = "";
};

// Function to create a chat list element
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing"
        ? `<p>${message}</p>`
        : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
};

const showSubOptionsAfterTicket = () => {
    const subOptionsMessage = `
        What would you like to do next?
        1. Raise another problem/Issue
        2. Return to the main menu
    `;
    chatbox.appendChild(createChatLi(subOptionsMessage, "incoming"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    currentOption = "subOption"; // Set current option to sub-option
};

// Function to display tickets
const displayTicket = (ticket) => {
    const ticketItem = document.createElement("li");
    ticketItem.textContent = `Ticket ID: ${ticket.id}, Issue: ${ticket.issue}, Status: ${ticket.status}`;
};

// Function to update user information
const updateUserInfo = (newInfo) => {
    fetch('http://localhost:3005/users', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newInfo)
    })
    .then(response => response.json())
    .then(data => {
        chatbox.appendChild(createChatLi(`Your information has been updated successfully!`, "incoming"));
        showSupportOptions();
    })
    .catch(error => {
        console.error('Error updating user information:', error);
        chatbox.appendChild(createChatLi("There was an error updating your information. Please try again later.", "incoming"));
        showSupportOptions();
    });
};

// Function to display support options
const showSupportOptions = () => {
    clearChat();
    const optionsMessage = 
    `<p>Hi there 👋<br> How can I help you today? 
        <br id="support">1. Customer support
        <br id="productInformation">2. Product information retrieval
        <br id="Update">3. Update user information
        <br id="Subscriptions">4. FAQs
        <br id="Tickets">5. Track ticket    
    </p>`;
    chatbox.appendChild(createChatLi(optionsMessage, "incoming"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    currentOption = null;
};

// Function to display sub-options
const showSubOptions = () => {
    const subOptionsMessage = `
        What would you like to do next?
        1. Query another ticket
        2. Return to main menu
    `;
    chatbox.appendChild(createChatLi(subOptionsMessage, "incoming"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
};

// Main chat handler function
const handleChat = () => {
    const userMessage = chatInput.value.trim();
    console.log(userMessage, "Usermessage");
    if (!userMessage) return;

    // Append user's message to chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatInput.value = "";

    // Display a "Thinking..." message while waiting for the response
    const thinkingMessage = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(thinkingMessage);
    
    
    if (userMessage === "1" && !currentOption) {
        thinkingMessage.remove();
        chatbox.appendChild(createChatLi("Kindly provide information of your challenge/issue:", "incoming"));
        currentOption = "describeIssue"; // Change to a specific state for describing the issue
    }
    else if (currentOption === "describeIssue") {
        thinkingMessage.remove();
        // Save the described issue to the database
        fetch('http://localhost:3005/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ issue: userMessage, status: "New" }) // Use the user's message as the issue description
        })
        .then(response => response.json())
        .then(ticket => {
            const botMessage = `Your issue has been recorded. Your ticket ID is ${ticket.id}. You can track your ticket using this ID.`;
            console.log(botMessage)
            chatbox.appendChild(createChatLi(botMessage, "incoming"));
            showSubOptionsAfterTicket();
        })
        .catch(error => {
            console.error('Error creating ticket:', error);
            chatbox.appendChild(createChatLi("There was an error processing your request. Please try again later.", "incoming"));
            showSupportOptions();
        });

        //currentOption = null; // Reset the state after handling the issue description
    }else if (currentOption === "subOption") {
        if (userMessage === "1") {
            // If the user wants to describe another issue
            chatbox.appendChild(createChatLi("Kindly provide information about your challenge/issue:", "incoming"));
            currentOption = "describeIssue";
        } else if (userMessage === "2") {
            // If the user wants to return to the main menu
            showSupportOptions();
        } else {
            chatbox.appendChild(createChatLi("Invalid option. Please select 1 or 2.", "incoming"));
            showSubOptionsAfterTicket(); // Show options again if invalid input
        }
    }else if (userMessage === "2") {
        fetch('http://localhost:3005/products')
            .then(response => response.json())
            .then(products => {
                const product = products.find(p => p.name.toLowerCase() === userMessage.toLowerCase());
                thinkingMessage.remove();
                const botMessage = product ? product.details : "Sorry, I don't have information on that product.";
                chatbox.appendChild(createChatLi(botMessage, "incoming"));
                //showSupportOptions();
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                thinkingMessage.remove();
                chatbox.appendChild(createChatLi("There was an error processing your request. Please try again later.", "incoming"));
                //showSupportOptions();
            });
        currentOption = null;
    } else if (currentOption === "3") {
        const [key, value] = userMessage.split('=');
        if (key && value) {
            const newInfo = { [key.trim()]: value.trim() };
            updateUserInfo(newInfo);
        } else {
            thinkingMessage.remove();
            chatbox.appendChild(createChatLi("Please provide the information in the format: key=value (e.g., email=myemail@example.com)", "incoming"));
            showSupportOptions();
        }
        currentOption = null;
    } else if (currentOption === "4") {
        thinkingMessage.remove();
        const faqsMessage = `
            Here are some frequently asked questions:
            1. How to reset my password?
            2. How to check my balance?
            3. How to contact support?
        `;
        chatbox.appendChild(createChatLi(faqsMessage, "incoming"));
        showSupportOptions();
        currentOption = null;
    } else if (currentOption === "5") {
        fetch('http://localhost:3005/tickets')
            .then(response => response.json())
            .then(tickets => {
                const ticket = tickets.find(t => t.id.toString() === userMessage);
                thinkingMessage.remove();
                const botMessage = ticket
                    ? `Ticket ID: ${ticket.id}, Issue: ${ticket.issue}, Status: ${ticket.status}`
                    : "Sorry, no ticket found with that ID. Please check and try again.";
                chatbox.appendChild(createChatLi(botMessage, "incoming"));
                showSupportOptions();
            })
            .catch(error => {
                console.error('Error fetching tickets:', error);
                thinkingMessage.remove();
                chatbox.appendChild(createChatLi("There was an error processing your request. Please try again later.", "incoming"));
                showSupportOptions();
            });
        currentOption = null;
    } 
}   
sendChatBtn.addEventListener("click", handleChat);
chatbotCloseBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"))
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"))

