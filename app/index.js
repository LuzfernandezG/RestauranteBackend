//dirname
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import express from "express";
import cookieParser from "cookie-parser";
import {methods as autenthication} from"./controllers/authentication.controller.js";


//servidor
const app=express();
app.set("port",4000);
app.listen(app.get("port"));
console.log("servidor corriendo en puerto",app.get("port")); //abre el puerto

//configuracion
app.use(express.static(__dirname + "/public")); //aginar archivos estaticos
app.use(express.json());//permite mirar los datos mandados en el registro
app.use(cookieParser());

//rutas
app.get("/", (req,res)=> res.sendFile(__dirname +"/pages/login.html"));
app.get("/register", (req,res)=> res.sendFile(__dirname +"/pages/register.html"));
app.get("/admin",(req,res)=> res.sendFile(__dirname +"/pages/admin/admin.html"));
app.post("/api/register1",autenthication.register);
app.post("/api/login",autenthication.login);
// Ruta para cerrar sesión
app.get("/logout", (res) => {
    // Eliminar la cookie
    res.clearCookie("jwt");
    // Redirigir al inicio de sesión
    res.redirect("/");
});

