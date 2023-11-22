document.addEventListener('DOMContentLoaded', function() {
    // Simulate click event on apibutton
    var apibutton = document.getElementById('api'); // Replace 'yourApibuttonId' with the actual ID of your button
    var clickEvent = new Event('click');

    // Dispatch the click event
    apibutton.dispatchEvent(clickEvent);
});

const buttons = document.querySelectorAll('.button');
let data = {}

// Add a click event listener to each button
buttons.forEach(button => {
    button.addEventListener('click', function(e) {
        // const text1 = this.querySelector('.text1').textContent;
        // const text2 = this.querySelector('.text2').textContent;
        // console.log(`Button Clicked: ${text1} - ${text2}`);
        if(this.classList.contains("occupied-button"))
        {
            if (this.classList.contains("plain-button")) {
                this.classList.remove("plain-button");
                this.classList.add("expanded-button");
                button.style.height = button.scrollHeight + "px";
            }
            else if (this.classList.contains("expanded-button")) {
                button.style.height = "30px"
                this.classList.remove("expanded-button");
                this.classList.add("plain-button");
            }
        }
    });
});

const apibutton = document.querySelector('.api-button')

apibutton.addEventListener('click', function(e) {
    if(!this.classList.contains('api-button-cooldown')) {
        // send update request
        getCalendarData();

        // prevent user from spamming
        this.classList.add("api-button-cooldown");
        this.querySelector('.status-text').textContent = 'Updated! Available in ~1m';
        setTimeout(() => {
            this.classList.remove('api-button-cooldown');
            this.querySelector('.status-text').textContent = 'API Update';
        }, 60000);
    }
})

const headers = {'Content-Type':'application/json',
                    'Access-Control-Allow-Origin':'*',
                    'Access-Control-Allow-Methods':'POST,PATCH,OPTIONS'}

const dateInput = document.getElementById("dateInput");
const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");

// Add input event listeners to the input fields
dateInput.addEventListener("input", sendDataToAPI);
startTimeInput.addEventListener("input", sendDataToAPI);
endTimeInput.addEventListener("input", sendDataToAPI);

function sendDataToAPI() {
    // Get input values
    const date = dateInput.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    // Create a data object to send to the API
    const data = {
        date: date,
        startTime: startTime,
        endTime: endTime
    };

    resetButtons();

    // receive data from backend
    let extract_data = extract(date, startTime, endTime)
    if (extract_data) {
        resetButtons()
    

        let occupied = [];
        let reason = [];

        for (let item in extract_data) {
            occupied.push(extract_data[item]['roomid']);
            reason.push(extract_data[item]);
        }

        let index = 0;

        for (roomIds of occupied) {
            for (id of roomIds) {
                const elementId = `room${id}`;
                const element = document.getElementById(elementId);
                if(element)
                {
                    element.className = "expanded-button occupied-button";
                    element.querySelector('.text1').textContent = "Booked"
                    
                    const text3Elt = element.querySelector('.text3')
                    if(text3Elt){
                        text3Elt.innerHTML += `${reason[index]['name']}<br>${reason[index]['start_time']}-${reason[index]['end_time']}<br>`;
                    }

                    element.style.height = element.scrollHeight + "px";

                    
                }
            }
            index++;
        }

    }
        
};

// return buttons to original state
function resetButtons() {
    buttons.forEach(button => {
        button.className = "plain-button button";
        button.style.height = "30px";
        button.querySelector('.text1').textContent = "Available";
        button.querySelector('.text3').innerHTML = "";
    })
}



function getCalendarData() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const formattedYesterday = yesterday.toISOString().split('T')[0];
    fetch('https://corsproxy.io?https://api.espace.cool/api/v2/event/occurrences?startDate='+ formattedYesterday + '&topX=2000', {
        method: 'GET',
        headers: {
            'Accept': 'application/json', 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFubmllLmhzdUByb2xjYy5uZXQiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9oYXNoIjoiOXIvREQ4UHhNVWhjYWhaTFpXdXdKSjFOZGNjPSIsIm5iZiI6MTY5OTkzMjc3NCwiZXhwIjoxNzMxNDY4Nzc0LCJpYXQiOjE2OTk5MzI3NzR9.gYLIlQqkbde_qJPPU2HGRmHNZtxI_xpNNNoJOogLdp4'
        }
    })
    .then(response => response.json())
    .then(parseddata => data = parseddata);
}

function extract(input_day, input_start_time, input_end_time) {
    let calendarData = {};

    function getRoomId(room) {
        let rooms = [];
        const room_id = {
            "Dining Area I": 0, // activities
            "Dining Area II": 1, 
            "Plaza Booth1": 2, 
            "Plaza Booth2": 3,
            "Plaza Booth A": 4, 
            "Plaza Booth B": 5,
            "A3": 6,
            "River Plaza": 7,
            "Y4": 8,
            "C1": 9, // chapels
            "F1": 10,
            "SG1": 11,
            "K4 (Splash)": 12, // children center
            "K8": 13,
            "K9": 14,
            "K10": 15,
            "K11 (Checkout Room)": 16,
            "K12 (Dive)": 17,
            "E5": 18, // classrooms
            "E6": 19,
            "F2": 20,
            "G10": 21,
            "G11": 22,
            "G5": 23,
            "G6": 24,
            "H18": 25,
            "Y2": 26,
            "Y5": 27,
            "Booth 1": 28, // lobby
            "Booth 2": 29,
            "D4/D7": 30, // nursery
            "E1/E10": 31, // preschool
            "E2/E4": 32
        }

        for (let key in room_id) {
            room.forEach((r) => {
                if(r.includes(key)) {
                    rooms.push(room_id[key]);
                }
            })
        }
        return rooms;
    }

    for (let key in data['Data']) {
        const event = data['Data'][key];
        if(event['OccurrenceStatus'] === 'Canceled') {
            continue;
        }
        let event_day = event['EventStart'];
        let year = event_day.substring(0,4);
        let month = event_day.substring(5,7);
        let date = event_day.substring(8,10);

        let rooms = []
        for (const item in event['Items']) {
            if(event['Items'][item]['ItemType'] === "Space") {
                rooms.push(event['Items'][item]['Name']);
            }
        }

        let new_event = {
            'name': event['EventName'],
            'start_time': event['EventStart'].substring(11,16),
            'end_time': event['EventEnd'].substring(11,16),
            'room': rooms,
            'roomid': getRoomId(rooms)
        }

        if (calendarData[year] && calendarData[year][month] && calendarData[year][month][date]) {
            // Add the new event to the existing list of events for the specified date
            calendarData[year][month][date].push(new_event);
        } else {
            // If the date does not exist, create the necessary structure
            if (!calendarData[year]) {
                calendarData[year] = {};
            }
            if (!calendarData[year][month]) {
                calendarData[year][month] = {};
            }
            calendarData[year][month][date] = [new_event];
        }
    }

    function overlap(start_time, end_time, test_start_time, test_end_time) {
        let start_time_minutes = toMinutes(start_time);
        let end_time_minutes = toMinutes(end_time);
        let test_start_time_minutes = toMinutes(test_start_time);
        let test_end_time_minutes = toMinutes(test_end_time);
        
        return test_end_time_minutes > start_time_minutes && test_start_time_minutes < end_time_minutes;
    }

    function toMinutes(time) {
        let hours = 0;
        let minutes = 0;
        const pattern = /(\d+):(\d+)/;
        let match = time.match(pattern);
    
        if (match) {
            hours = parseInt(match[1]);
            minutes = parseInt(match[2]);
        }
    
        
        return hours * 60 + minutes;
        
    }

    let year = input_day.substring(0,4);
    let month = input_day.substring(5,7);
    let date = input_day.substring(8,10);
    
    let invalid_rooms = [];
    try {
        for (let event in calendarData[year][month][date]){
            if(overlap(calendarData[year][month][date][event]['start_time'], calendarData[year][month][date][event]['end_time'], input_start_time, input_end_time)) {
                invalid_rooms.push(calendarData[year][month][date][event]);
            }
        }
    }
    catch {
        console.log("No events exist for date: " + input_day);
    }

    return invalid_rooms;
}