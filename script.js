// -------- LOGIN / REGISTER --------
function login() {
    const email = document.getElementById("loginEmail").value || document.getElementById("regEmail").value;
    if(email){
      localStorage.setItem("passengerEmail", email);
      document.getElementById("loginContainer")?.style.display = "none";
      const logoDiv = document.getElementById("logoDiv");
      logoDiv.innerHTML = email;
      document.getElementById("logoutBtn")?.style.setProperty("display","inline");
      window.location.href = "flights.html";
    }
  }
  
  function register() {
    alert("Registered successfully!");
    login();
  }
  
  // -------- LOAD FLIGHTS --------
  if(location.pathname.includes("flights.html")){
    fetch("flights.json")
      .then(res=>res.json())
      .then(data=>{
        const tbody = document.querySelector("#flightsTable tbody");
        tbody.innerHTML = "";
        data.forEach(f=>{
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${f.id}</td>
            <td>${f.from}</td>
            <td>${f.to}</td>
            <td>${f.date}</td>
            <td>${f.time}</td>
            <td>${f.price.toLocaleString("ar-EG",{style:"currency",currency:"EGP"})}</td>
            <td><button onclick="selectFlight('${f.id}')">Book</button></td>
          `;
          tbody.appendChild(row);
        });
      });
  }
  
  function selectFlight(id){
    localStorage.setItem("selectedFlight",id);
    window.location.href="booking.html";
  }
  
  // -------- BOOKING PAGE --------
  function savePassenger(){
    const passenger = {
      name: document.getElementById("pName").value,
      passport: document.getElementById("pPassport").value,
      email: document.getElementById("pEmail").value,
      phone: document.getElementById("pPhone").value
    };
    localStorage.setItem("passenger",JSON.stringify(passenger));
    window.location.href="seats.html";
    const nextBtn = document.getElementById("nextBtn");

nextBtn.addEventListener("click", () => {
    const meal = document.getElementById("meal").value;
    const flight = JSON.parse(document.getElementById("flightSelect").value);

    localStorage.setItem("meal", meal);
    localStorage.setItem("selectedFlight", JSON.stringify(flight));

    window.location.href = "passenger.html";
});

  }
  
  // -------- SEAT SELECTION --------
  if(location.pathname.includes("seats.html")){
    const grid = document.getElementById("seatGrid");
    const bookedSeats = [5,12,18];
    for(let i=1;i<=36;i++){
      const btn = document.createElement("button");
      btn.innerText=i;
      if(bookedSeats.includes(i)) btn.classList.add("busy");
      btn.onclick = ()=>{
        if(btn.classList.contains("busy")) return;
        document.querySelectorAll("#seatGrid button").forEach(b=>b.classList.remove("selected"));
        btn.classList.add("selected");
        localStorage.setItem("seat",i);
      }
      grid.appendChild(btn);
    }
  }
  
  function goToMeals(){
    window.location.href="meals.html";
  }
  
  // -------- MEALS --------
  function saveMeals(){
    const meals=[...document.querySelectorAll(".meal:checked")].map(m=>m.value);
    localStorage.setItem("meals",JSON.stringify(meals));
    window.location.href="confirm.html";
  }
  
  // -------- CONFIRM --------
  if(location.pathname.includes("confirm.html")){
    const email=localStorage.getItem("passengerEmail");
    const flight=localStorage.getItem("selectedFlight");
    const seat=localStorage.getItem("seat");
    const meals=JSON.parse(localStorage.getItem("meals"));
    document.getElementById("summary").innerHTML=`
      <b>Email:</b> ${email}<br>
      <b>Flight:</b> ${flight}<br>
      <b>Seat:</b> ${seat}<br>
      <b>Meals:</b> ${meals? meals.join(","):"-"}
    `;
  }
  
  // -------- DASHBOARD --------
  if(location.pathname.includes("dashboard.html")){
    fetch("flights.json")
      .then(res=>res.json())
      .then(data=>{
        document.getElementById("countFlights").innerText=data.length;
      });
    const seat=localStorage.getItem("seat");
    document.getElementById("seatShow").innerText=seat?seat:"-";
    const meals=JSON.parse(localStorage.getItem("meals"));
    document.getElementById("mealShow").innerText=meals?meals.join(","):"-";
  }
  // بيانات الرحلة اللي اخترها من صفحة الحجز
const selectedFlight = JSON.parse(localStorage.getItem("selectedFlight")) || {};

// عرض المعلومات في الصفحة
document.getElementById("fNumber").textContent = selectedFlight.flightNumber || "N/A";
document.getElementById("fDepart").textContent = selectedFlight.departure || "N/A";
document.getElementById("fRoute").textContent = selectedFlight.route || "N/A";
document.getElementById("fWeight").textContent = selectedFlight.weight || 23;

// توليد QR Code
const passengerName = localStorage.getItem("name") || "";
new QRCode(document.getElementById("qrcode"), {
    text: `Name: ${passengerName}, Flight: ${selectedFlight.flightNumber || ""}`,
    width: 150,
    height: 150
});

// زر الانتقال لصفحة الدفع
document.getElementById("nextPassenger").addEventListener("click", () => {
    localStorage.setItem("name", document.getElementById("name").value);
    localStorage.setItem("passport", document.getElementById("passport").value);
    localStorage.setItem("class", document.getElementById("class").value);
    window.location.href = "payment.html";
});
// استدعاء البيانات من LocalStorage
const flight = JSON.parse(localStorage.getItem("selectedFlight")) || {};
const meal = localStorage.getItem("meal") || "N/A";

// عرض البيانات في الصفحة
document.getElementById("rFlight").textContent = flight.flightNumber;
document.getElementById("rRoute").textContent = flight.route;
document.getElementById("rDepart").textContent = flight.departure;
document.getElementById("rWeight").textContent = flight.weight;
document.getElementById("rPrice").textContent = flight.price;
document.getElementById("rMeal").textContent = meal;

// زر الرجوع
document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "booking.html";
});

// زر التأكيد → نروح لصفحة Passenger Info
document.getElementById("confirmBtn").addEventListener("click", () => {
    window.location.href = "passenger.html";
});
