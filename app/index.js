/*IMPORTACIONES */
import express from "express";
import cookieParser from "cookie-parser"; 
import { methods as autenthication } from "./controllers/authentication.controller.js"; //Toma las funciones que se exportaron en authetication controllers 
import cors from 'cors'; //sirve para  que haya una transmicion de datos entre backend-frontend =COMUNICACION DE PUERTOS

//servidor
const app = express();
app.set("port", 4000);
app.listen(app.get("port"));
console.log("servidor corriendo en puerto", app.get("port")); //abre el puerto

//configuracion
app.use(express.json()); //permite mirar los datos mandados en el registro
app.use(cookieParser());
app.use(cors());//comunicacion fronted-backend

//rutas
//login
app.post("/api/register", autenthication.register);
app.post("/api/login", autenthication.login);
app.get("/api/logout", autenthication.logout);

//manejo de mesas
app.post("/api/mesas", (req, res) => {
    const { nombre, numero, descripcion } = req.body;
    autenthication.crearMesa(nombre, numero, descripcion);
    res.send("Mesa creada exitosamente");
  });
  app.put("/api/mesas/:numero", (req, res) => {
    const { numero } = req.params;
    const { nombre, descripcion } = req.body;
    autenthication.modificarMesaPorNumero(numero, { nombre, descripcion });
    res.send(`Mesa con número ${numero} modificada exitosamente`);
  });
  app.get("/api/mesas", (req, res) => {
    autenthication.imprimirMesas((mesas) => {
      res.json(mesas);
    });
  });
  app.delete("/api/mesas/:numero", (req, res) => {
    const { numero } = req.params;
    autenthication.eliminarMesaPorNumero(numero);
    res.send(`Mesa con número ${numero} eliminada exitosamente`);
  });
  
//reserva de mesas
app.post("/api/reservar-mesa", (req, res) => {
  const { nombreReservante, fecha, numeroMesa ,motivo } = req.body;
  
  autenthication.verificarMesaDisponible(numeroMesa, fecha, (disponible) => {
      if (!disponible) {
          // La mesa no está disponible para la fecha especificada
          return res.status(400).send("La mesa no está disponible para la fecha especificada");
      }

      // La mesa está disponible, proceder con la reserva
      autenthication.reservarMesa(nombreReservante, fecha, numeroMesa, motivo);
      res.send("Mesa reservada exitosamente");
  });
});

app.get("/api/mesas-disponibles", autenthication.obtenerMesasDisponibles);

app.get("/api/imprimir-reservas", (req, res) => {
  autenthication.imprimirReservas((reservas) => {
    res.json(reservas);
  });
});