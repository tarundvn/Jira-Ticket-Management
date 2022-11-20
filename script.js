let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textareaCont = document.querySelector(".textarea-cont");
let allPriorityColor = document.querySelectorAll(".priority-color");
let toolBoxColors = document.querySelectorAll(".color");

let colors = ["lightpink", "lightblue", "lightgreen", "black"];
let modalPriorityColor = colors[colors.length - 1];

let addFlag = false;
let removeFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-unlock";

let ticketArr = [];

if (localStorage.getItem("jira_tickets")) {
    // Retrieve and display tickets
    ticketArr = JSON.parse(localStorage.getItem("jira_tickets"));
    ticketArr.forEach((ticketObj) => {
      createTicket(
        ticketObj.ticketColor,
        ticketObj.ticketTask,
        ticketObj.ticketId,
        1
      );
    });
}

//Modal Display
addBtn.addEventListener("click", function(e)
{
    addFlag = !addFlag;
    if(addFlag)
    {
        modalCont.style.display = "flex";
    }
    else
    {
        modalCont.style.display = "none";
    }
});

//Modal's priority color toggling
allPriorityColor.forEach((colorElem, idx) => {
   colorElem.addEventListener("click", function(e)
   {
        //unset border class in all first
        allPriorityColor.forEach((prioritycolorElem, idx)=>{
            prioritycolorElem.classList.remove("border");
        })
        colorElem.classList.add("border");
        modalPriorityColor = colorElem.classList[0];
   }) 
});

//Ticket Generating
modalCont.addEventListener("keydown", (e)=>{
    let key = e.key;
    if(key === "Shift")
    {
        createTicket(modalPriorityColor, textareaCont.value,shortid(),0);
        addFlag = !addFlag;
        setModalToDefault();
    }
});

//Helper Function
function createTicket(ticketColor, ticketTask, ticketId,x)
{
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");
    ticketCont.innerHTML = `
        <div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">
            #${ticketId}
        </div>
        <div class="task-area"> ${ticketTask}
        </div>
        <div class="ticket-lock"><i class="fa-solid fa-lock"></i></i></div>
    `;
    mainCont.appendChild(ticketCont);

    //create object of ticket and add to ticketArr
    if(x == 0)
    {
        ticketArr.push({ticketColor, ticketTask, ticketId});
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
    }
    handleRemoval(ticketCont,ticketColor, ticketTask, ticketId);
    handleLock(ticketCont,ticketColor, ticketTask, ticketId);
    handleColor(ticketCont,ticketColor, ticketTask, ticketId);
}

//Remove Functionality
removeBtn.addEventListener("click", function(e)
{
    removeFlag = !removeFlag;
});

function handleRemoval(ticket,myticketColor, myticketTask, myticketId)
{
    ticket.addEventListener("click", function(e)
    {
        if(removeFlag)
        {
            //Change in ticketArr
            let idx = -1;
            for(let i = 0; i < ticketArr.length; i++)
            {
                if(ticketArr[i].ticketId === myticketId)
                {
                    idx = i;
                    break;
                }
            }

            if(idx!=-1)
            {
                ticketArr.splice(idx, 1);
                localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
            }
            //Change in UI
            ticket.remove();
        }
    });
}

//Lock Functionality
function handleLock(ticket,myticketColor, myticketTask, myticketId)
{
    let ticketLockElem = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketLockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");
    ticketLock.addEventListener("click", function(e)
    {
        if(ticketLock.classList.contains(lockClass))
        {
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        }
        else
        {
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");
            let val = ticketTaskArea.innerText;
            let idx = -1;
            for(let i = 0; i < ticketArr.length; i++)
            {
                if(ticketArr[i].ticketId === myticketId)
                {
                    idx = i;
                    break;
                }
            }
            if(idx!=-1)
            {
                ticketArr[idx].ticketTask = val;
                localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
            }
        }
    });
}

//Color Functionality on tickets
function handleColor(ticket,myticketColor, myticketTask, myticketId)
{
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click", (e)=>{
        let currentTicketColor = ticketColor.classList[1];
        //Get Ticket Color Idx : 
        let currentTicketColorIdx = colors.findIndex((color) => 
        {
            return currentTicketColor === color;
        });
        currentTicketColorIdx++;
        let newTicketColorIdx = currentTicketColorIdx % colors.length;
        let newTicketColor = colors[newTicketColorIdx];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        //Change in ticketArr
        let idx = -1;
        for(let i = 0; i < ticketArr.length; i++)
        {
            if(ticketArr[i].ticketId === myticketId)
            {
                idx = i;
                break;
            }
        }
        if(idx!=-1)
        {
            ticketArr[idx].ticketColor = newTicketColor;
            localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
        }
    });
}

//Sets Modal to Default Parameteres
function setModalToDefault()
{
    modalCont.style.display = "none";
    textareaCont.value = "";
    modalPriorityColor = colors[colors.length - 1];
    allPriorityColor.forEach((prioritycolorElem, idx)=>{
        prioritycolorElem.classList.remove("border");
    });
    allPriorityColor[allPriorityColor.length - 1].classList.add("border");
}

//toolbox-priority-cont Functionalities
for(let i = 0; i<toolBoxColors.length; i++)
{
    toolBoxColors[i].addEventListener("click", function(e)
    {
        let currentTicketColorBox = toolBoxColors[i].classList[0];
        let filteredTickets = ticketArr.filter((ticketObj, index)=>{
            return currentTicketColorBox == ticketObj.ticketColor;
        });

        //Remove Previous Tickets
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for(let j = 0; j < allTicketsCont.length; j++)
        {
            allTicketsCont[j].remove();
        }

        //Display Filtered Tickets
        filteredTickets.forEach((ticketObj, index)=>{
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId, 1);
        });
    });

    toolBoxColors[i].addEventListener("dblclick", function(e)
    {
         //Remove Previous Tickets
         let allTicketsCont = document.querySelectorAll(".ticket-cont");
         for(let j = 0; j < allTicketsCont.length; j++)
         {
             allTicketsCont[j].remove();
         }

        //Display All Tickets
        ticketArr.forEach((ticketObj, index)=>{
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId, 1);
        });
    });
}