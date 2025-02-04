// Write JS function to reserve a table, persist the data using Axios API
// Write JS function to reserve a table, persist the data using Axios API
function validInput() {
    let isValid = true;
    clearError();

    const name = document.getElementById("bookname").value;
    if(!name){
        isValid = false;
        document.getElementById("name-error").textContent = "Name is required";
    }

    const email = document.getElementById("bookemail").value;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if(!email || !emailRegex.test(email)){
       isValid = false;
        document.getElementById("email-error").textContent = "Email is required and Enter valid Email ID";
    }

    const contact = document.getElementById("bookphone").value;
    if(!contact || contact.length !== 10){
       isValid= false;
        document.getElementById("phone-error").textContent = "Contact is required and must be 10 digits";
    }

    const date = document.getElementById("bookdate").value;
    if(!date){
        isValid = false;
        document.getElementById("date-error").textContent = "Date is requried";
    }

    const time = document.getElementById("booktime").value;
    if(!time){
        isValid = false;
        document.getElementById("time-error").textContent = "Time is requried";
    }

    const personCount = document.getElementById("bookperson").value;
    if(!personCount || personCount < 1){
        isValid = false;
        document.getElementById("person-error").textContent = "Person count should be atleast 1";
    }

    return isValid;
}

function clearError() {
    const error = document.querySelectorAll(".error");
    error.forEach((error) =>{
        error.textContent = "";
    });

}

function clearForm(){
    document.getElementById("bookname").value = "";
    document.getElementById("bookemail").value = "";
    document.getElementById("bookphone").value = "";
    document.getElementById("bookdate").value = "";
    document.getElementById("bookperson").value = "";
    
}

document.querySelector("form").addEventListener("submit",function(event){
    event.preventDefault();
    if(validInput()){
        submitReservation();
        alert("You successfully reserved a table");
    }
    // else{
    //     alert("Invalid Form");
    // }
});

function submitReservation() {
    const name = document.getElementById("bookname").value;
    const email = document.getElementById("bookemail").value;
    const contact = document.getElementById("bookphone").value;
    const date = document.getElementById("bookdate").value;
    const personCount = document.getElementById("bookperson").value;

    if (name && email && contact && date && personCount) {
        const reservationData = {
            Name: name,
            EmailID: email,
            Contact: contact,
            Date: date,
            PersonCount: personCount
        };

        // Posting data to json-server
        axios.post("http://localhost:3004/reservations", reservationData)
            .then(response => {
                console.log("Response:", response);
                if (response.status === 201) { // Successful response from JSON Server
                    alert(`Reservation successfully created for ${personCount} persons!`);
                    clearForm();
                } else {
                    alert("Reservation not successful. Check your server.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Error occurred while creating reservation.");
            });
    } else {
        alert("Please fill all fields correctly.");
    }
}