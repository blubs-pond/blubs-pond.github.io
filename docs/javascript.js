//mobile side bar  navagation controll
function w3_open() {
  document.getElementById("mySidebar").style.display = "block";
}

function w3_close() {
  document.getElementById("mySidebar").style.display = "none";

}

function awa() {
    const awa_sound = new Audio('');
    window.alert("awa");
    awa_sound.play()
      .then(() => {
        console.info('awa success');
      })
      .catch(error => {
        console.error('awa failed:', error);
      });
}
