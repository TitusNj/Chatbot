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
    currentOption = null
    const subOptionsMessage = `
        What would you like to do next?
        1. Raise another problem/Issue
        2. Return to the main menu
    `;
    chatbox.appendChild(createChatLi(subOptionsMessage, "incoming"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    currentOption = "subOption"; // Set current option to sub-option
    console.log(currentOption)
};

const returnMainmenu = () => {
    currentOption = null;
    const returnMain = `
        Press 1 to Return to the main menu
    `;
    chatbox.appendChild(createChatLi(returnMain, "incoming"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    currentOption = "returntoMain"; // Set current option to sub-option
    console.log(currentOption)
    //showSupportOptions()
};

// Function to display tickets
const displayTicket = (ticket) => {
    const ticketItem = document.createElement("li");
    ticketItem.textContent = `Ticket ID: ${ticket.id}, Issue: ${ticket.issue}, Status: ${ticket.status}`;
};

// Function to update user information
const updateUserInfo = (newInfo) => {
    fetch('http://localhost:3005/users/93d0', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newInfo)
    })
    .then(response => {
        console.log('Response Status:', response.status); // Log the response status
        return response.json();
    })
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
    //clearChat();
    currentOption = null;
    const optionsMessage = 
    `<p>Hi there 👋<br> How can I help you today? 
        <br id="support">1. Customer support
        <br id="productInformation">2. Product information retrieval
        <br id="Update">3. Update user information
        <br id="Subscriptions">4. Track ticket    
    </p>`;
    chatbox.appendChild(createChatLi(optionsMessage, "incoming"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
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
    currentOption = "subOption";
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
    
    if (currentOption === "describeIssue") {
        thinkingMessage.remove();
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
        currentOption = null; // Reset the state after handling the issue description
    }else if (currentOption === "subOption") {
        thinkingMessage.remove()
        if (userMessage === "1") {
            // If the user wants to describe another issue
            chatbox.appendChild(createChatLi("Kindly provide information of your challenge/issue:", "incoming"));
            currentOption = "describeIssue";
        } else if (userMessage === "2") {
            // If the user wants to return to the main menu
            showSupportOptions();
            // currentOption =null
        } else {
            chatbox.appendChild(createChatLi("Invalid option. Please select 1 or 2.", "incoming"));
            showSubOptionsAfterTicket(); // Show options again if invalid input
            
        }
        currentOption =null
    }else if (currentOption === "returnToMain" ) {
        thinkingMessage.remove();
        if (userMessage === "1") {
            showSupportOptions();
            // currentOption =null
        }else {
            chatbox.appendChild(createChatLi("Invalid option.", "incoming"));
            returnMainmenu(); // Show options again if invalid input
        }
        currentOption =null
    
    }else if (currentOption === "subOption") {
        thinkingMessage.remove();
        if (userMessage === "1") {
            // If the user wants to describe another issue
            chatbox.appendChild(createChatLi("Kindly provide information of your challenge/issue:", "incoming"));
            currentOption = "describeIssue";
            console.log(currentOption, "currentOption")
        } else if (userMessage === "2") {
                // If the user wants to return to the main menu
                showSupportOptions();
                currentOption =null
        } else {
                chatbox.appendChild(createChatLi("Invalid option. Please select 1 or 2.", "incoming"));
                showSubOptionsAfterTicket(); // Show options again if invalid input
                
        }
        currentOption =null
    }
    else if (currentOption === "productQuery") {
        fetch('http://localhost:3005/products')
            .then(response => response.json())
            .then(products => {
                thinkingMessage.remove(); // Remove the "Thinking..." message

                // Find the product based on user input
                const product = products.find(p => p.name.toLowerCase() === userMessage.toLowerCase());

                // Check if the product was found
                const botMessage = product ? product.details : "Sorry, I don't have information on that product.";
                chatbox.appendChild(createChatLi(botMessage, "incoming"));
                // currentOption = "returnToMain";
                const returnMain = `Press 1 to Return to the main menu `;
                chatbox.appendChild(createChatLi(returnMain, "incoming"));
                chatbox.scrollTo(0, chatbox.scrollHeight);
                currentOption = "returnToMain";

            })
            .catch(error => {
                console.error('Error fetching products:', error);
                thinkingMessage.remove(); // Remove the "Thinking..." message
                chatbox.appendChild(createChatLi("There was an error processing your request. Please try again later.", "incoming"));
                //showSupportOptions(); // Return to support options in case of error
            });
        currentOption = null; // Reset current option after processing

    }else if (currentOption === "returnToMain" ) {
        thinkingMessage.remove()
        if (userMessage === "1") {
            showSupportOptions();
            currentOption =null
        }else {
            chatbox.appendChild(createChatLi("Invalid option.", "incoming"));
            returnMainmenu(); // Show options again if invalid input
        }
        currentOption =null
    }else if (currentOption === "updateUser") {
            thinkingMessage.remove(); // Remove "Thinking..." message
    
            // Parse user message for the update format
            const [key, value] = userMessage.split('=');
            console.log(`Attempting to update: key = ${key}, value = ${value}`); // Debugging output
            if (key && value) {
                const newInfo = { [key.trim()]: value.trim() };
                updateUserInfo(newInfo); // Call function to update info
            } else {
                chatbox.appendChild(createChatLi("Please provide the information in the format (e.g., email=myemail@example.com)", "incoming"));
            }
            currentOption = null; // Reset after processing update
    }else if (currentOption === "requestTicketID") {
        // Fetch ticket information using the provided ticket ID
        fetch('http://localhost:3005/tickets')
            .then(response => response.json())
            .then(tickets => {
                const ticket = tickets.find(t => t.id.toString() === userMessage);
                thinkingMessage.remove();
                const botMessage = ticket
                    ? `Ticket ID: ${ticket.id}, Issue: ${ticket.issue}, Status: ${ticket.status}`
                    : "Sorry, no ticket found with that ID. Please check and try again.";
                chatbox.appendChild(createChatLi(botMessage, "incoming"));
                showSupportOptions(); // Return to support options after displaying ticket info
            })
            .catch(error => {
                console.error('Error fetching tickets:', error);
                thinkingMessage.remove();
                chatbox.appendChild(createChatLi("There was an error processing your request. Please try again later.", "incoming"));
                showSupportOptions(); // Return to support options in case of error
            });
        currentOption = null; // Reset after processing
    }else {
        thinkingMessage.remove();
        if (userMessage === "1") {
            chatbox.appendChild(createChatLi("How may i be of support to you? Kindly describe your challenge", "incoming"));
            currentOption = "describeIssue"; // Change to a specific state for describing the issue
        }
        else if (userMessage === "2") {
            chatbox.appendChild(createChatLi("Please enter the product name you want to inquire about:", "incoming"));
            currentOption = "productQuery"; // Set the current option to productQuery
        }else if (userMessage === "3" ) {
            thinkingMessage.remove(); // Remove "Thinking..." message
            chatbox.appendChild(createChatLi("Please enter the information you want to update in the format (e.g., email=myemail@example.com)", "incoming"));
            currentOption = "updateUser"; // Set state to handle update
            //currentOption = null;
        } else if (userMessage === "4" ) {
            chatbox.appendChild(createChatLi("Please provide your ticket ID to track:", "incoming"));
            currentOption = "requestTicketID";
            
        }   
    }
}
   
sendChatBtn.addEventListener("click", handleChat);
chatbotCloseBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
