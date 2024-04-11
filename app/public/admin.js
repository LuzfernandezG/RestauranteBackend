//admin.js
document.getElementsByTagName("button")[0].addEventListener("click",()=>{
    //cerrar sesion se toma en cuenta la cookie existente y la borra
    document.cookie='jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.location.href = "/"
})