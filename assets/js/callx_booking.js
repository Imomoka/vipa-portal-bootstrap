window.addEventListener("DOMContentLoaded", (event) => {
    const npn_submit = document.getElementById('authenticate_npn');
    if (npn_submit) {
      npn_submit.addEventListener('click', check_npn);
    }
    const refresh_avail = document.getElementById('avail_refresh');
    if (refresh_avail){
        refresh_avail.addEventListener('click', avail_refresh);
    }
    const refresh_persRes = document.getElementById('persRes_refresh');
    if (refresh_persRes){
        refresh_persRes.addEventListener('click', persRes_refresh);
    }
    const advanceFilterbutton = document.getElementById('advanceFilterbutton');
    if(advanceFilterbutton){
        advanceFilterbutton.addEventListener('click',advanceFilter);
    }
    const allRes_refresh= document.getElementById('allRes_refresh');
    if(allRes_refresh){
            allRes_refresh.addEventListener('click',refresh_allRes);
    }
    const check_locationauthbtn=document.getElementById('loc_id_btn');
    if(check_locationauthbtn){
        check_locationauthbtn.addEventListener('click',fetchAgentDatawlocationid);
    }
    const updateUser_npnbtn=document.getElementById('update_npn_btn');
    if(updateUser_npnbtn){
        updateUser_npnbtn.addEventListener('click',updateUser_npn);
    }
});

// Run automatically on page load if NPN exists in localStorage
document.addEventListener("DOMContentLoaded", () => {
    const storedNpn = localStorage.getItem("npn");
    if (storedNpn) {
        fetchAgentData(storedNpn);
    }

});

//Manual Authenticate NPN Process
function check_npn(){
  var npninput= document.getElementById('inputNPN').value;
  console.log(npninput);
  fetchAgentData(npninput);
}    
function fetchAgentData(npn){
    const requestOptions = {
        method: "GET",
        redirect: "follow"
        };
    
        fetch(`https://api1.simplyworkcrm.com/api:Y0n8xNqT/integration/npn/{npn_number}?npn=${npn}`, requestOptions)
            .then(response => response.json()) // Convert response to JSON
            .then(data => {
                console.log(data); // Log the full response for debugging
    
                // Check if response contains an error
                if (data.code && data.message) {
                    document.getElementById("error_message").textContent = data.message;
                    document.getElementById("callx_user").textContent = ""; // Clear agent name if invalid npn
                    localStorage.clear("npn");
                    let locID_auth = new bootstrap.Modal(document.getElementById('locationID_authorize_error'), {});
                    locID_auth.show();
                } else if (data[0].agent_name) {
    
                    // Display agent name if valid response
                    document.getElementById("callx_user").textContent = data[0].agent_name;
                    document.getElementById("error_message").textContent = ""; // Clear any previous error
                    document.getElementById('user_type').textContent = data[0].user_type;
                    document.getElementById('npn_id').textContent = npn;
                    document.getElementById('booking_content').classList.remove("d-none");
                    document.getElementById('page-npn-authenticate').classList.add("d-none");
                    localStorage.setItem("npn",npn);
                    localStorage.setItem("access",data[0].user_type)
                    fetchAvailsched(npn);
                    fetchPersRes(npn);
                    fetchAllRes(npn);
                } else {
                    // Handle unexpected response format
                    document.getElementById("error_message").textContent = "Unexpected response received.";
                    document.getElementById("callx_user").textContent = "";
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                document.getElementById("error_message").textContent = "Error fetching data. Please try again.";
                document.getElementById("agent_name").textContent = ""; // Clear agent name on error
            });
}

function fetchAgentDatawlocationid(){
    const locationid = document.getElementById('location_ID_auth').value;

    const requestOptions = {
        method: "GET",
        redirect: "follow"
        };
    
        fetch(`https://api1.simplyworkcrm.com/api:Y0n8xNqT/integration/npn/{npn_number}?location_id=${locationid}`, requestOptions)
            .then(response => response.json()) // Convert response to JSON
            .then(data => {
                console.log(data); // Log the full response for debugging
    
                // Check if response contains an error
                if (data.code && data.message) {
                    document.getElementById("loc_modal_error_message").textContent = data.message;

                } else if (data[0].agent_name) {
    
                    // Display agent name if valid response
                    document.getElementById("loc_modal_error_message").textContent = "Location Found";
                    document.getElementById('update_npn_loc_auth').classList.remove("d-none");
                    document.getElementById('locationauth_input').classList.add("d-none");
                    localStorage.setItem("callx_user_id",data[0].id);
                } else {
                    // Handle unexpected response format
                    document.getElementById("error_message").textContent = "Unexpected response received.";
                    document.getElementById("callx_user").textContent = "";
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                document.getElementById("error_message").textContent = "Error fetching data. Please try again.";
                document.getElementById("agent_name").textContent = ""; // Clear agent name on error
            });
}

function updateUser_npn(){
    const npnNumber = document.getElementById('location_ID_auth_npn').value;
    const team_color = document.getElementById('team_color_select').value;
    const storedCallx_id = localStorage.getItem("callx_user_id");
    fetch(`https://api1.simplyworkcrm.com/api:Y0n8xNqT/integration/npn/${storedCallx_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          team: team_color,
          npn: npnNumber
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
          document.getElementById("update_npn_message").textContent="There was an error, please contact support";
        }
        return response.json();
      })
      .then(data => {
        // handle data here (no logs)
        console.log(data)
        document.getElementById("update_npn_message").textContent="Success! Please close popup and login with your NPN";
        document.getElementById("error_message").textContent = "Success, Now you can input your NPN";
      })
      .catch(error => {
        // handle error here (no logs)
      });
}




//get NPN for refresh availability schedule
function avail_refresh(){
    const storedNpn = localStorage.getItem("npn");
    fetchAvailsched(storedNpn);
}
//fetch all Availabilities
function fetchAvailsched(npn){
    //format data
    const amList = document.getElementById("availAMsched");
    amList.innerHTML='';
    const pmList = document.getElementById("availPMsched");
    pmList.innerHTML='';
    const requestOptions = {
        method: "GET",
        redirect: "follow"
        };
    
        fetch(`https://api1.simplyworkcrm.com/api:Y0n8xNqT/bookings/calls/availability?npn=${npn}`, requestOptions)
            .then(response => response.json()) // Convert response to JSON
            .then(data => {
                console.log(data); // Log the full response for debugging
    
                // Check if response contains an error
                if (data.code && data.message) {
                    console.log("An Error has occured, please contact dev.")
                } else if (data.current_week_day) {
    
                    // Preview Available Slots
                    previewAvailsched(data.availability,npn);
                    
                } else {
                    // Handle unexpected response format
                    console.log("Unexpected error received")
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);    
            });
}
//preview Availabilities
function previewAvailsched(availsched,npn){
        //format data
        const amList = document.getElementById("availAMsched");
        const pmList = document.getElementById("availPMsched");
        availsched.forEach(availsched => {

        //check if morning shift
        if(availsched.shift==1){
            if(availsched.remaining_slots!=0){
                //checks if not yet booked
                if(availsched.already_scheduled != true){
                    const am_list = document.createElement('li');
                    am_list.className='list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg';
                    am_list.innerHTML = `
                        <div class="d-flex flex-column">
                            <h6 class="text-s">${availsched.date}</h6>
                            <span class="text-xs">Available Slot: <span class="text-dark ms-sm-2 font-weight-bold">${availsched.remaining_slots}</span></span>
                        </div>
                        <div class="ms-auto">
                            <a class="btn bg-gradient-primary" href="javascript:;" onClick="bookSlot('${availsched.date}','${npn}','1')">Reserve</a>
                        </div>`;
                amList.appendChild(am_list);
                }else{
                    const am_list = document.createElement('li');
                    am_list.className='list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg';
                    am_list.innerHTML = `
                        <div class="d-flex flex-column">
                            <h6 class="text-s">${availsched.date}</h6>
                            <span class="text-xs">Available Slot: <span class="text-dark ms-sm-2 font-weight-bold">${availsched.remaining_slots}</span></span>
                        </div>
                        <div class="ms-auto">
                            <a class="btn bg-gradient-success" href="javascript:;">Booked</a>
                        </div>`;
                    amList.appendChild(am_list);
                }
                
            }else{
                const am_list = document.createElement('li');
                am_list.className='list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg';
                am_list.innerHTML = `
                    <div class="d-flex flex-column">
                        <h6 class="text-s">${availsched.date}</h6>
                        <span class="text-xs">Available Slot: <span class="text-dark ms-sm-2 font-weight-bold">Fully Booked</span></span>
                    </div>
                    <div class="ms-auto">
                    <a class="btn bg-gradient-danger" href="javascript:;">Full</a>
                    </div>`;
                amList.appendChild(am_list);
            }
        }

        //check if PM shift
        else if(availsched.shift==2){
            if(availsched.remaining_slots!=0){
                //checks if not yet booked
                if(availsched.already_scheduled != true){
                    const pm_list = document.createElement('li');
                    pm_list.className='list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg';
                    pm_list.innerHTML = `
                        <div class="d-flex flex-column">
                            <h6 class="text-s">${availsched.date}</h6>
                            <span class="text-xs">Available Slot: <span class="text-dark ms-sm-2 font-weight-bold">${availsched.remaining_slots}</span></span>
                        </div>
                        <div class="ms-auto">
                            <a class="btn bg-gradient-primary" href="javascript:;" onClick="bookSlot('${availsched.date}','${npn}','2')">Reserve</a>
                        </div>`;
                pmList.appendChild(pm_list);
                }else{
                    const pm_list = document.createElement('li');
                    pm_list.className='list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg';
                    pm_list.innerHTML = `
                        <div class="d-flex flex-column">
                            <h6 class="text-s">${availsched.date}</h6>
                            <span class="text-xs">Available Slot: <span class="text-dark ms-sm-2 font-weight-bold">${availsched.remaining_slots}</span></span>
                        </div>
                        <div class="ms-auto">
                            <a class="btn bg-gradient-success" href="javascript:;">Booked</a>
                        </div>`;
                    pmList.appendChild(pm_list);
                }
                
            }else{
                const pm_list = document.createElement('li');
                pm_list.className='list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg';
                pm_list.innerHTML = `
                    <div class="d-flex flex-column">
                        <h6 class="text-s">${availsched.date}</h6>
                        <span class="text-xs">Available Slot: <span class="text-dark ms-sm-2 font-weight-bold">Fully Booked</span></span>
                    </div>
                    <div class="ms-auto">
                    <a class="btn bg-gradient-danger" href="javascript:;">Full</a>
                    </div>`;
                pmList.appendChild(pm_list);
            }
        }
        
        
    });
}
//book a slot
function bookSlot(date,npn,shift){
    const requestOptions = {
        method: "POST",
        redirect: "follow"
    };

    fetch(`https://api1.simplyworkcrm.com/api:Y0n8xNqT/bookings/calls/schedules?npn=${npn}&shift=${shift}&schedule_date=${date}`, requestOptions)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log(data);

    // Example response handling
    if (data.code && data.message) {
      console.log("An error has occurred, please contact dev.");
    } else {
      // Handle success case
      console.log("Success:", data);
      fetchAvailsched(npn);
      fetchPersRes(npn);
    }
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });
    
}




//get NPN for refresh personal reservations
function persRes_refresh(){
    const storedNpn = localStorage.getItem("npn");
    fetchPersRes(storedNpn);
}
//fetch own reservation
function fetchPersRes(npn){
    //format data
    const resList = document.getElementById("myReservation");
    resList.innerHTML='';
    const requestOptions = {
        method: "GET",
        redirect: "follow"
        };
    
        fetch(`https://api1.simplyworkcrm.com/api:Y0n8xNqT/bookings/calls/schedules?limit=10&npn=${npn}&view_all=false&from_today=true&groups[logic]=string&groups[conditions][field]=string&groups[conditions][op]=string&groups[conditions][value]=string`, requestOptions)
            .then(response => response.json()) // Convert response to JSON
            .then(data => {
                console.log(data); // Log the full response for debugging
    
                // Check if response contains an error
                if (data.code) {
                    console.log("An Error has occured, please contact dev.")
                } else if (data.items) {
    
                    // Preview Available Slots
                    previewPersRes(data.items,npn);
                    
                } else {
                    // Handle unexpected response format
                    console.log("Unexpected error received")
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);    
            });
}

function previewPersRes(persRes,npn){
    const resList = document.getElementById("myReservation");
    const storedNpn = localStorage.getItem("npn");

    persRes.forEach(persRes => {
        if(storedNpn!=persRes.callx_ghl_info.npn){
            //skip data
        }
        else{
            if(persRes.shift==1){
                const persRes_list = document.createElement('li');
                persRes_list.className='list-group-item border-0 d-flex align-items-center px-0 mb-2';
                persRes_list.innerHTML = `
                    <div class="avatar me-3">
                        <img src="../assets/img/calendar-icon.jpg" alt="kal" class="border-radius-lg shadow">
                    </div>
                    <div class="d-flex align-items-start flex-column justify-content-center">
                        <h6 class="mb-0 text-sm">${persRes.date}</h6>
                        <p class="mb-0 text-xs">Shift: Morning</p>
                    </div>
                    <a class="btn btn-link pe-3 ps-0 mb-0 ms-auto" href="javascript:;" onClick="delete_persRes('${persRes.id}','${npn}')">Cancel</a>`;
                    resList.appendChild(persRes_list);
            }
            else{
                    const persRes_list = document.createElement('li');
                persRes_list.className='list-group-item border-0 d-flex align-items-center px-0 mb-2';
                persRes_list.innerHTML = `
                    <div class="avatar me-3">
                        <img src="../assets/img/calendar-icon.jpg" alt="kal" class="border-radius-lg shadow">
                    </div>
                    <div class="d-flex align-items-start flex-column justify-content-center">
                        <h6 class="mb-0 text-sm">${persRes.date}</h6>
                        <p class="mb-0 text-xs">Shift: Afternoon</p>
                    </div>
                    <a class="btn btn-link pe-3 ps-0 mb-0 ms-auto" href="javascript:;" onClick="delete_persRes('${persRes.id}','${npn}')">Cancel</a>`;
                    resList.appendChild(persRes_list);
            }
        }
        
    });
}

function delete_persRes(schedule_id,npn){
    // Create a FormData object
    const formData = new FormData();
    console.log(schedule_id,npn);

    formData.append('npn', npn); 

    fetch(`https://api1.simplyworkcrm.com/api:Y0n8xNqT/bookings/calls/schedules/${schedule_id}`, {
        method: "DELETE",
        headers: {
        "Accept": "application/json" 
        // Typically, do NOT set 'Content-Type': 'multipart/form-data' here;
        // fetch + FormData will do that automatically.
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
    })
    .then(data => {
        console.log("Success:", data);
        fetchPersRes(npn);
        fetchAvailsched(npn);
    })
    .catch(error => {
        console.error("Error:", error);
    });
}



//declare needed element for advance filter
function advanceFilter(){
    const storedNpn = localStorage.getItem("npn");
    if(storedNpn){
        var advanceFilter_date= document.getElementById('advanceFilter_date').value;
        var advanceFilter_shift = document.getElementById('advanceFilter_shift').value;
        fetchadvanceFilterRes(storedNpn,advanceFilter_date,advanceFilter_shift);
    }
}
//fetch all reservation with advance filters
function fetchadvanceFilterRes(npn,date,shift){
    //format Data
    const allresList = document.getElementById("allSchedule");
    allresList.innerHTML='';

    const requestOptions = {
        method: "GET",
        redirect: "follow"
        };
        console.log(npn,date, shift);
    
        fetch(`https://api1.simplyworkcrm.com/api:Y0n8xNqT/bookings/calls/schedules?
                page=1
                &limit=100
                &npn=${npn}
                &search[groups][0][logic]=AND
                &search[groups][0][conditions][0][field]=date
                &search[groups][0][conditions][0][op]==
                &search[groups][0][conditions][0][value]=${date}
                &search[groups][0][conditions][1][field]=shift
                &search[groups][0][conditions][1][op]==
                &search[groups][0][conditions][1][value]=${shift}
                &view_all=true&from_today=true`, requestOptions)
            .then(response => response.json()) // Convert response to JSON
            .then(data => {
                console.log(data); // Log the full response for debugging
    
                // Check if response contains an error
                if (data.code) {
                    console.log("An Error has occured, please contact dev.")
                } else if (data.items) {
    
                    // Preview Available Slots
                    previewadvanceFilterRes(data.items);
                    document.getElementById('allRes_refresh').innerHTML="Clear Filter";
                    
                } else {
                    // Handle unexpected response format
                    console.log("Unexpected error received")
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);    
            });
}
function previewadvanceFilterRes(allRes){
    const allresList = document.getElementById("allSchedule");
    const storedAccess = localStorage.getItem("access");
    const storedNpn = localStorage.getItem("npn");

    allRes.forEach(allRes => {
        //Check whether it is an admin user
        if(storedAccess=="admin"){
            if(allRes.callx_ghl_info.npn== storedNpn){
                //skip table       
            }
            else{
                if(allRes.shift == 1){
        
                    const allRes_list = document.createElement('tr');
                    allRes_list.innerHTML = `
                        <td class="align-middle text-center">
                            <span class="text-secondary text-xs font-weight-bold">${allRes.date}</span>
                        </td>
                        <td>
                            <div class="d-flex px-2 py-1">
                                <div class="d-flex flex-column justify-content-center">
                                    <h6 class="mb-0 text-sm">${allRes.callx_ghl_info.agent_name}</h6>
                                </div>
                            </div>
                        </td>
                        <td class="text-sm">
                            <span class="badge badge-sm bg-gradient-success">Morning Shift</span>
                        </td>
                        <td class="align-middle">
                            <p class="text-xs text-center font-weight-bold mb-0">Booked</p>
                        </td>
                                                    
                        <td class="align-middle">
                            <a href="javascript:;" class="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit user" onClick="delete_AllRes('${allRes.id}','${allRes.callx_ghl_info.npn}')">
                                Delete
                            </a>
                        </td>`;
                    allresList.appendChild(allRes_list);
                }
                else{
                    const allRes_list = document.createElement('tr');
                    allRes_list.innerHTML = `
                        <td class="align-middle text-center">
                            <span class="text-secondary text-xs font-weight-bold">${allRes.date}</span>
                        </td>
                        <td>
                            <div class="d-flex px-2 py-1">
                                <div class="d-flex flex-column justify-content-center">
                                    <h6 class="mb-0 text-sm">${allRes.callx_ghl_info.agent_name}</h6>
                                </div>
                            </div>
                        </td>
                        <td class="text-sm">
                            <span class="badge badge-sm bg-gradient-success">Afternoon Shift</span>
                        </td>
                        <td class="align-middle">
                            <p class="text-xs text-center font-weight-bold mb-0">Booked</p>
                        </td>
                                                    
                        <td class="align-middle">
                             <a href="javascript:;" class="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit user" onClick="delete_AllRes('${allRes.id}','${allRes.callx_ghl_info.npn}')">
                                Delete
                            </a>
                        </td>`;
                    allresList.appendChild(allRes_list);
                }
            }         
        }
        //when non-admin user
        else{
            //check if it gets own schedule
            if(allRes.callx_ghl_info.npn==storedNpn){
                //skip data
            }
            else{
                if(allRes.shift == 1){
                    const allRes_list = document.createElement('tr');
                    allRes_list.innerHTML = `
                        <td class="align-middle text-center">
                            <span class="text-secondary text-xs font-weight-bold">${allRes.date}</span>
                        </td>
                        <td>
                            <div class="d-flex px-2 py-1">
                                <div class="d-flex flex-column justify-content-center">
                                    <h6 class="mb-0 text-sm">${allRes.callx_ghl_info.agent_name}</h6>
                                </div>
                            </div>
                        </td>
                        <td class="text-sm">
                            <span class="badge badge-sm bg-gradient-success">Morning Shift</span>
                        </td>
                        <td class="align-middle">
                            <p class="text-xs text-center font-weight-bold mb-0">Booked</p>
                        </td>
                                                    
                        <td class="align-middle">
                        </td>`;
                    allresList.appendChild(allRes_list);
                }
                else{
                    const allRes_list = document.createElement('tr');
                    allRes_list.innerHTML = `
                        <td class="align-middle text-center">
                            <span class="text-secondary text-xs font-weight-bold">${allRes.date}</span>
                        </td>
                        <td>
                            <div class="d-flex px-2 py-1">
                            <div class="d-flex flex-column justify-content-center">
                                <h6 class="mb-0 text-sm">${allRes.callx_ghl_info.agent_name}</h6>
                            </div>
                            </div>
                        </td>
                        <td class="text-sm">
                            <span class="badge badge-sm bg-gradient-success">Afternoon Shift</span>
                        </td>
                        <td class="align-middle">
                            <p class="text-xs text-center font-weight-bold mb-0">Booked</p>
                        </td>                                
                        <td class="align-middle">
                        </td>`;
                    allresList.appendChild(allRes_list);
                }
            }
        }       
    });
}



//get NPN for refresh all reservations
function refresh_allRes(){
    const storedNpn = localStorage.getItem("npn");
    fetchAllRes(storedNpn);
}

function populateUniqueDates(data) {
    // Grab the "items" array from the payload
    const items = data;
    
    // Get the <select> element by its ID
    const selectElement = document.getElementById('advanceFilter_date');
    selectElement.innerHTML='';
    
    // Extract all dates from the items array
    const allDates = items.map(item => item.date);
  
    // Make them unique by converting to a Set and back to an array
    const uniqueDates = [...new Set(allDates)];
  
    // (Optional) Clear existing <option> tags except the first one
    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }
  
    // Create a new <option> for each unique date
    uniqueDates.forEach(dateValue => {
        const option = document.createElement('option');
        option.value = dateValue;
        option.textContent = dateValue;
        selectElement.appendChild(option);
    });
}

function populateUniqueShifts(data){
    // Grab the "items" array from the payload
    const items = data;
    
    // Get the <select> element by its ID
    const selectElement = document.getElementById('advanceFilter_shift');
    selectElement.innerHTML='';
    
    // Extract all dates from the items array
    const allShifts = items.map(item => item.shift);
  
    // Make them unique by converting to a Set and back to an array
    const uniqueShifts = [...new Set(allShifts)];
  
    // (Optional) Clear existing <option> tags except the first one
    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }
  
    // Create a new <option> for each unique date
    uniqueShifts.forEach(shiftValue => {
        if(shiftValue==1){
            const option = document.createElement('option');
            option.value = shiftValue;
            option.textContent = "Morning";
            selectElement.appendChild(option);
        }
        else if(shiftValue==2){
            const option = document.createElement('option');
            option.value = shiftValue;
            option.textContent = "Afternoon";
            selectElement.appendChild(option);
        }
        
    });
}



//fetch all reservation
function fetchAllRes(npn){
    //format Data
    const allresList = document.getElementById("allSchedule");
    allresList.innerHTML='';
    const requestOptions = {
        method: "GET",
        redirect: "follow"
        };
    
        fetch(`https://api1.simplyworkcrm.com/api:Y0n8xNqT/bookings/calls/schedules?
        limit=30&npn=${npn}
        &view_all=true&from_today=true&groups[logic]=string&groups[conditions][field]=string&groups[conditions][op]=string&groups[conditions][value]=string`, requestOptions)
            .then(response => response.json()) // Convert response to JSON
            .then(data => {
                console.log(data); // Log the full response for debugging
    
                // Check if response contains an error
                if (data.code) {
                    console.log("An Error has occured, please contact dev.")
                } else if (data.items) {
    
                    // Preview Available Slots
                    previewAllRes(data.items);
                    populateUniqueDates(data.items);
                    populateUniqueShifts(data.items);
                    document.getElementById('allRes_refresh').innerHTML="Refresh";
                    
                } else {
                    // Handle unexpected response format
                    console.log("Unexpected error received")
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);    
            });
}

function previewAllRes(allRes){
    const allresList = document.getElementById("allSchedule");
    const storedAccess = localStorage.getItem("access");
    const storedNpn = localStorage.getItem("npn");

    allRes.forEach(allRes => {
        //Check whether it is an admin user
        if(storedAccess=="admin"){
            if(allRes.callx_ghl_info.npn== storedNpn){
                //skip table       
            }
            else{
                if(allRes.shift == 1){
        
                    const allRes_list = document.createElement('tr');
                    allRes_list.innerHTML = `
                        <td class="align-middle text-center">
                            <span class="text-secondary text-xs font-weight-bold">${allRes.date}</span>
                        </td>
                        <td>
                            <div class="d-flex px-2 py-1">
                                <div class="d-flex flex-column justify-content-center">
                                    <h6 class="mb-0 text-sm">${allRes.callx_ghl_info.agent_name}</h6>
                                </div>
                            </div>
                        </td>
                        <td class="text-sm">
                            <span class="badge badge-sm bg-gradient-success">Morning Shift</span>
                        </td>
                        <td class="align-middle">
                            <p class="text-xs text-center font-weight-bold mb-0">Booked</p>
                        </td>
                                                    
                        <td class="align-middle">
                            <a href="javascript:;" class="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit user" onClick="delete_AllRes('${allRes.id}','${allRes.callx_ghl_info.npn}')">
                                Delete
                            </a>
                        </td>`;
                    allresList.appendChild(allRes_list);
                }
                else{
                    const allRes_list = document.createElement('tr');
                    allRes_list.innerHTML = `
                        <td class="align-middle text-center">
                            <span class="text-secondary text-xs font-weight-bold">${allRes.date}</span>
                        </td>
                        <td>
                            <div class="d-flex px-2 py-1">
                                <div class="d-flex flex-column justify-content-center">
                                    <h6 class="mb-0 text-sm">${allRes.callx_ghl_info.agent_name}</h6>
                                </div>
                            </div>
                        </td>
                        <td class="text-sm">
                            <span class="badge badge-sm bg-gradient-success">Afternoon Shift</span>
                        </td>
                        <td class="align-middle">
                            <p class="text-xs text-center font-weight-bold mb-0">Booked</p>
                        </td>
                                                    
                        <td class="align-middle">
                             <a href="javascript:;" class="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit user" onClick="delete_AllRes('${allRes.id}','${allRes.callx_ghl_info.npn}')">
                                Delete
                            </a>
                        </td>`;
                    allresList.appendChild(allRes_list);
                }
            }         
        }
        //when non-admin user
        else{
            //check if it gets own schedule
            if(allRes.callx_ghl_info.npn==storedNpn){
                //skip data
            }
            else{
                if(allRes.shift == 1){
                    const allRes_list = document.createElement('tr');
                    allRes_list.innerHTML = `
                        <td class="align-middle text-center">
                            <span class="text-secondary text-xs font-weight-bold">${allRes.date}</span>
                        </td>
                        <td>
                            <div class="d-flex px-2 py-1">
                                <div class="d-flex flex-column justify-content-center">
                                    <h6 class="mb-0 text-sm">${allRes.callx_ghl_info.agent_name}</h6>
                                </div>
                            </div>
                        </td>
                        <td class="text-sm">
                            <span class="badge badge-sm bg-gradient-success">Morning Shift</span>
                        </td>
                        <td class="align-middle">
                            <p class="text-xs text-center font-weight-bold mb-0">Booked</p>
                        </td>
                                                    
                        <td class="align-middle">
                        </td>`;
                    allresList.appendChild(allRes_list);
                }
                else{
                    const allRes_list = document.createElement('tr');
                    allRes_list.innerHTML = `
                        <td class="align-middle text-center">
                            <span class="text-secondary text-xs font-weight-bold">${allRes.date}</span>
                        </td>
                        <td>
                            <div class="d-flex px-2 py-1">
                            <div class="d-flex flex-column justify-content-center">
                                <h6 class="mb-0 text-sm">${allRes.callx_ghl_info.agent_name}</h6>
                            </div>
                            </div>
                        </td>
                        <td class="text-sm">
                            <span class="badge badge-sm bg-gradient-success">Afternoon Shift</span>
                        </td>
                        <td class="align-middle">
                            <p class="text-xs text-center font-weight-bold mb-0">Booked</p>
                        </td>                                
                        <td class="align-middle">
                        </td>`;
                    allresList.appendChild(allRes_list);
                }
            }
        }       
    });
}
//only admins
function delete_AllRes(schedule_id,npn){
    // Create a FormData object
    const formData = new FormData();
    console.log(schedule_id,npn);

    formData.append('npn', npn); 

    fetch(`https://api1.simplyworkcrm.com/api:Y0n8xNqT/bookings/calls/schedules/${schedule_id}`, {
        method: "DELETE",
        headers: {
        "Accept": "application/json" 
        // Typically, do NOT set 'Content-Type': 'multipart/form-data' here;
        // fetch + FormData will do that automatically.
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
    })
    .then(data => {
        console.log("Success:", data);
        const storedNPN = localStorage.getItem("npn");
        fetchAllRes(storedNPN);
    })
    .catch(error => {
        console.error("Error:", error);
    });
}






