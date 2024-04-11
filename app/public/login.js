const mensajeError = document.getElementsByClassName("error")[0];
 //lama el evento de submir en la parte del formulario de inicio de login.html
document.getElementById("login-form").addEventListener("submit",async (e)=>{
    e.preventDefault();//evitar recargar
    const user = e.target.children.user.value; //captura los datos del submit en variables
    const password = e.target.children.password.value;
    const res = await fetch("http://localhost:4000/api/login",{
        method:"POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify({ //convierte a string el dato
            user,password
        })
    
    });
    if(!res.ok) return  mensajeError.classList.toggle("escondido",false);
    const resJson = await res.json();
    if(resJson.redirect){
        window.location.href = resJson.redirect;
    } 
})


