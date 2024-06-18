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
//crear mesa
app.post("/api/mesas", async (req, res) => {
  const { nombre, numero, descripcion } = req.body;

  // Verificar si los datos ya existen en la base de datos
  autenthication.verificarMesa(nombre, numero, async (err, disponible) => {
    if (err) {
      console.error("Error al verificar la disponibilidad de la mesa:", err);
      return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }

    if (!disponible) {
      return res.status(400).send("Los datos ingresados ya existen");
    }

    // Los datos no existen, procedemos a crear la mesa
    try {
      await autenthication.crearMesa(nombre, numero, descripcion);
      res.status(201).send("Mesa creada exitosamente");
    } catch (error) {
      console.error("Error al crear la mesa:", error);
      res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
  });
});


//editar mesa
  app.put("/api/mesas/:numero", (req, res) => {
    const { numero } = req.params;
    const { descripcion } = req.body; 
    autenthication.modificarMesaPorNumero(numero, { descripcion });
    res.send(`Mesa con número ${numero} modificada exitosamente`);
  });


  
  //imprime las mesas
  app.get("/api/mesas", (req, res) => {
    autenthication.imprimirMesas((mesas) => {
      res.json(mesas);
    });
  });


  //eliminar mesa
  app.delete("/api/mesas/:numero", (req, res) => {
    const { numero } = req.params;
    autenthication.eliminarMesaPorNumero(numero);
    res.send(`Mesa con número ${numero} eliminada exitosamente`);
  });
  
//reserva de mesas
//reservar mesa
app.post("/api/reservar-mesa", (req, res) => {
  const { nombreReservante, fecha, numeroMesa, motivo, modalidad, cedula } = req.body;

  autenthication.verificarMesaDisponible(numeroMesa, fecha, disponible => {
    if (!disponible) {
      // La mesa no está disponible para la fecha especificada
      return res.status(400).send("La mesa no está disponible para la fecha especificada");
    }

    // La mesa está disponible, proceder con la reserva
    autenthication.reservarMesa(nombreReservante, fecha, numeroMesa, motivo, modalidad, cedula);
    res.send("Mesa reservada exitosamente");
  });
});


//mesas disponibles
app.get("/api/mesas-disponibles", autenthication.obtenerMesasDisponibles);

//imprimir reservas
app.get("/api/imprimir-reservas", (req, res) => {
  autenthication.imprimirReservas((reservas) => {
    res.json(reservas);
  });
});

// Ruta para eliminar una reserva por su ID
//eliminar mesa -admin
app.delete("/api/reservas/:reservaId", (req, res) => {
  const { reservaId } = req.params;
  autenthication.eliminarReservaPorId(reservaId);
  res.send("Reserva eliminada exitosamente");
});

// Ruta para eliminar una reserva por su ID y datos asociados
//reservante
app.delete("/api/reservas/:reservaId/:nombreReservante/:cc", (req, res) => {
  const { reservaId, nombreReservante, cc } = req.params;
  autenthication.eliminarReservaPorIdYDatos(reservaId, nombreReservante, cc);
  res.send("Reserva eliminada exitosamente");
});


// Define la ruta para la consulta de reservas por nombre de reservante
// Define la ruta para la consulta de reservas por nombre de reservante
//consulta
app.get("/api/reservas-por-nombre", autenthication.consultarReservasPorNombre);
//consulta
app.put('/api/reservas/:reservaId', autenthication.actualizarEstadoReserva);





