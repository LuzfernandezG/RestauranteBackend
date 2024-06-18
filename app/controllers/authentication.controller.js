
//importaciones
import bcryptjs from "bcryptjs"; //libreria que permitira la encriptacion de contraseñas
import jsonwebtoken from "jsonwebtoken";//maneja de contraseña para login tipo token 
import dotenv from "dotenv";//libreria para variables de entorno 
import connection from "./db.js";
import { response } from 'express';
dotenv.config();

//Funcion para login
async function login(req, res) {
    const user = req.body.user;
    const password = req.body.password;

    if (!user || !password) {
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    try {
        const query = 'SELECT * FROM users WHERE user = ?';
        connection.query(query, [user], (error, results, fields) => {
            if (error) {
                console.error("Error durante el inicio de sesión:", error);
                return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
            }

            if (results.length === 0) {
                return res.status(400).send({ status: "Error", message: "Error durante el inicio de sesión" });
            }

            //comparacion de la contraseña con bcrypts
            const usuarioRevisar = results[0];
            bcryptjs.compare(password, usuarioRevisar.password, (compareError, logincorrecto) => {
                if (compareError) {
                    console.error("Error durante el inicio de sesión:", compareError);
                    return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
                }

                if (!logincorrecto) {
                    return res.status(400).send({ status: "Error", message: "Error durante el inicio de sesión" });
                }

                const token = jsonwebtoken.sign(
                    { user: usuarioRevisar.nombre },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRATION }
                );

                const cookieOption = {
                    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                    path: "/"
                };

                res.cookie("jwt", token, cookieOption);
                if (usuarioRevisar.modo === 1) {
                    // Si el modo es 1, redirigir al admin
                    res.send({ status: "ok", message: "Usuario loggeado", token, redirect: "/admin" });
                } else {
                    // Si el modo es 0, redirigir al home
                    res.send({ status: "ok", message: "Usuario loggeado", token, redirect: "/home" });
                }
            });
        });
    } catch (error) {
        console.error("Error durante el inicio de sesión:", error);
        return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
}
//Funcion para registrar usuario
async function register(req, res) {
    try {
        const { user,email,password } = req.body;

        // Verifica que los campos no estén vacíos
        if (!user || !password || !email) {
            return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
        }

        // Verifica si el usuario ya existe en la base de datos
        const query = "SELECT * FROM users WHERE user = ?";
        connection.query(query, [user], async (error, results, fields) => {
            if (error) {
                console.error("Error al buscar al usuario:", error);
                return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
            }

            if (results.length > 0) {
                return res.status(400).send({ status: "Error", message: "Este usuario ya existe" });
            }

            // Genera el hash de la contraseña
            const salt = await bcryptjs.genSalt(5); //seguridad la encriptacion
            const hashContraseña = await bcryptjs.hash(password, salt);
            const fechaCreacion = new Date().toISOString().split('T')[0];

            // Inserta el nuevo usuario en la base de datos
            const insertQuery = "INSERT INTO users (user, email, password, dc, modo) VALUES (?, ?, ?, ?, ?)";
            connection.query(insertQuery, [user, email, hashContraseña, fechaCreacion,'0'], (insertError, insertResults, insertFields) => {
                if (insertError) {
                    console.error("Error al registrar al usuario:", insertError);
                    return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
                }

                // Envía la respuesta de éxito
                res.status(201).send({ status: "ok", message: `Usuario ${user} agregado`, redirect: "/login" });
            });
        });
    } catch (error) {
        console.error("Error en la función de registro:", error);
        res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
}

//Funcion para cerrar sesion
async function logout(req, res = response) {
    try {
        // Eliminar la cookie jwt del cliente
        res.clearCookie("jwt");

        // Envía una respuesta exitosa
        res.status(200).send({ status: "ok", message: "Usuario deslogueado exitosamente" });
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
}

/*MANEJO DE MESAS*/

//Funcion para crear mesa
function crearMesa(nombre, numero, descripcion) {
  verificarMesa(nombre, numero, (err, disponible) => {
    if (err) {
      console.error("Error al verificar la disponibilidad de la mesa:", err);
      return;
    }

    if (!disponible) {
      console.log('El número de mesa o el nombre ya existen.');
      // Aquí puedes enviar una respuesta al frontend indicando que la mesa ya existe.
      return;
    }

    const sqlInsert = `INSERT INTO mesas (nombre, numero, descripcion) VALUES (?, ?, ?)`;
    connection.query(sqlInsert, [nombre, numero, descripcion], (err, result) => {
      if (err) {
        console.error("Error al crear la mesa:", err);
        return;
      }
      console.log(`Se ha creado una nueva mesa con ID: ${result.insertId}`);
      // Aquí puedes enviar una respuesta al frontend indicando que la mesa fue creada exitosamente.
    });
  });
}

function verificarMesa(nombre, numero, callback) {
  const sqlCheck = `SELECT * FROM mesas WHERE nombre = ? OR numero = ?`;
  
  connection.query(sqlCheck, [nombre, numero], (err, result) => {
    if (err) {
      console.error("Error al verificar la mesa:", err);
      callback(err, false);
    } else {
      callback(null, result.length === 0);
    }
  });
}


  // Función para modificar una mesa por número de mesa
  function modificarMesaPorNumero(numeroMesa, nuevosDatos) {
    const sql = `UPDATE mesas SET ? WHERE numero = ?`;
    connection.query(sql, [nuevosDatos, numeroMesa], (err, result) => {
      if (err) throw err;
      console.log(`Se han modificado ${result.changedRows} mesa(s)`);
    });
  }
  


  // Función para imprimir todas las mesas
  function imprimirMesas(callback) {
    const sql = `SELECT * FROM mesas`;
    connection.query(sql, (err, result) => {
      if (err) {
        console.error("Error al imprimir las mesas:", err);
        callback([]);
      } else {
        console.log("Mesas encontradas:", result);
        callback(result);
      }
    });
  }
  
  // Función para eliminar una mesa por número de mesa
  function eliminarMesaPorNumero(numeroMesa) {
    const sql = `DELETE FROM mesas WHERE numero = ?`;
    connection.query(sql, [numeroMesa], (err, result) => {
      if (err) throw err;
      console.log(`Se han eliminado ${result.affectedRows} mesa(s)`);
    });
  }

//Funcion para obtener mesas no reservadas apartir de una fecha
  const obtenerMesasDisponibles = async (req, res) => {
    const { fecha } = req.query;
    
    try {
      // Consulta SQL para obtener las mesas que no están reservadas para la fecha especificada
      const sql = `
        SELECT *
        FROM mesas
        WHERE numero NOT IN (
          SELECT numero_mesa
          FROM reservas
          WHERE fecha = ?
        )
      `;
      connection.query(sql, [fecha], (error, results, fields) => {
        if (error) {
          console.error("Error al obtener las mesas disponibles:", error);
          return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
        }
        res.status(200).json(results);
      });
    } catch (error) {
      console.error("Error al obtener las mesas disponibles:", error);
      return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
  }

  /*FUNCIONES PARA RESERVACION DE MESAS*/

  //Funcion para reservar mesa

  function reservarMesa(nombreReservante, fecha, numeroMesa, motivo, modalidad, cedula) {
    verificarMesaDisponible(numeroMesa, fecha, (disponible) => { //llama a funcion para verificar la mesa
        if (!disponible) {
            console.error("La mesa no está disponible para esa fecha");
            return;
        }

        // Actualización de la consulta SQL para incluir la columna `estado` con el valor `pendiente`
        const insertSql = `INSERT INTO reservas (nombre_reservante, fecha, numero_mesa, motivo, modop, estado, cc) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        connection.query(insertSql, [nombreReservante, fecha, numeroMesa, motivo, modalidad, 'pendiente', cedula], (insertErr, insertResult) => {
            if (insertErr) {
                console.error("Error al reservar la mesa:", insertErr);
                throw insertErr;
            }
            console.log(`Se ha realizado la reserva con ID: ${insertResult.insertId}`);
        });
    });
}

  
  //Funcion comparativa de numero y fecha para saber si esta disponible
  function verificarMesaDisponible(numeroMesa, fecha, callback) {
      const sql = `SELECT * FROM reservas WHERE numero_mesa = ? AND fecha = ?`;
      connection.query(sql, [numeroMesa, fecha], (err, result) => {
        if (err) {
          console.error("Error al verificar la disponibilidad de la mesa:", err);
          callback(false);
        } else {
          callback(result.length === 0); 
        }
      });
  }
//Funcion para imprimir las reservas 
    function imprimirReservas(callback) {
        const sql = `SELECT * FROM reservas`;
        connection.query(sql, (err, result) => {
          if (err) {
            console.error("Error al imprimir las reservas:", err);
            callback([]);
          } else {
            console.log("Reservas encontradas:", result);
            callback(result);
          }
        });
      }

// Función para eliminar una reserva por nombre de reservante y fecha
function eliminarReservaPorId(reservaId) {
  const sql = `DELETE FROM reservas WHERE id = ?`;
  connection.query(sql, [reservaId], (err, result) => {
    if (err) {
      console.error("Error al eliminar la reserva:", err);
      throw err;
    }
    console.log(`Se han eliminado ${result.affectedRows} reserva(s) con ID ${reservaId}`);
  });
}

//eliminar mesa para la seccion de cliente
function eliminarReservaPorIdYDatos(reservaId, nombreReservante, cc) {
  const sql = `DELETE FROM reservas WHERE id = ? AND nombre_reservante = ? AND cc = ?`;
  connection.query(sql, [reservaId, nombreReservante, cc], (err, result) => {
    if (err) {
      console.error("Error al eliminar la reserva:", err);
      throw err;
    }
    if (result.affectedRows === 0) {
      console.log(`No se encontró ninguna reserva con ID ${reservaId}, nombre_reservante ${nombreReservante} y cc ${cc}`);
    } else {
      console.log(`Se han eliminado ${result.affectedRows} reserva(s) con ID ${reservaId}, nombre_reservante ${nombreReservante} y cc ${cc}`);
    }
  });
}

//reservacion para consulta
async function consultarReservasPorNombre(req, res) {
  const { nombreReservante } = req.query;

  if (!nombreReservante) {
      return res.status(400).send({ status: "Error", message: "Falta el nombre del reservante" });
  }

  try {
      const sql = `SELECT * FROM reservas WHERE nombre_reservante = ?`;
      connection.query(sql, [nombreReservante], (error, results, fields) => {
          if (error) {
              console.error("Error al consultar las reservas:", error);
              return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
          }

          if (results.length === 0) {
              return res.status(404).send({ status: "Error", message: "No se encontraron reservas para este nombre de reservante" });
          }

          res.status(200).send({ status: "ok", message: "Reservas encontradas", data: results });
      });
  } catch (error) {
      console.error("Error al consultar las reservas:", error);
      res.status(500).send({ status: "Error", message: "Error interno del servidor" });
  }
}

//actualizar estado en admin
async function actualizarEstadoReserva(req, res) {
  const { reservaId } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).send({ status: "Error", message: "El estado no puede estar vacío" });
  }

  const sql = `UPDATE reservas SET estado = ? WHERE id = ?`;
  connection.query(sql, [estado, reservaId], (err, result) => {
    if (err) {
      console.error("Error al actualizar el estado de la reserva:", err);
      return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
    res.send({ status: "ok", message: "Estado de la reserva actualizado exitosamente" });
  });
}


/* EXPORTACIÓN DE MÉTODOS */
export const methods = {
login,
register,
logout,
crearMesa,
verificarMesa,
modificarMesaPorNumero,
imprimirMesas,
eliminarMesaPorNumero,
reservarMesa,
verificarMesaDisponible,
obtenerMesasDisponibles,
imprimirReservas,
eliminarReservaPorId,
consultarReservasPorNombre,
actualizarEstadoReserva ,
eliminarReservaPorIdYDatos// Agregar la nueva función para consultar reservas por nombre de reservante
};
